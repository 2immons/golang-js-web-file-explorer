package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"time"
)

// структура элементов (файлов и директорий)
type pathItems struct {
	Path     string    // путь к элементу (папке или директор)
	ItemSize int64     // размер элемента
	IsDir    bool      // является ли элемент директорией
	EditDate time.Time // дата время последнего изменения
}

// структура элементов (файлов и директорий) переведенные в string формат для отправки на клиент
type pathItemsForJson struct {
	Path     string `json:"path"`     // путь к элементу (папке или директор)
	ItemSize string `json:"itemSize"` // размер элемента
	IsDir    string `json:"type"`     // является ли элемент директорией
	EditDate string `json:"editDate"` // дата время последнего изменения
}

type Config struct {
	Port string `json:"port"` // порт сервера
}

type ResponseStruct struct {
	IsSucceed bool        `json:"serverIsSucceed"` // булевое значение верной отработки запроса
	ErrorText string      `json:"serverErrorText"` // текст ошибки, если она есть
	Data      interface{} `json:"serverData"`      // поле с данными, передаваемыми в запросе
	LoadTime  float64     `json:"loadTime"`        // время отработки сервера
}

type Sort string

const (
	asc            Sort   = "asc"         // по возрастанию сортировка
	desc           Sort   = "desc"        // по убыванию сортировка
	configFilePath string = "config.json" // путь к файлу конфигураци
)

func main() {
	// создание корневого контекста для программы с функцией отмены
	ctx, cancel := context.WithCancel(context.Background())

	// отлавливание сигнала прерывания работы и передача его в канал
	osSignalChan := make(chan os.Signal, 1)
	signal.Notify(osSignalChan, os.Interrupt)

	// ВОПРОС: через горутину или просто в конце?
	// горутина закрытия приложения с отменой корневого контекста
	go func() {
		<-osSignalChan
		fmt.Println("Получен сигнал остановки. Остановка сервера...")
		cancel()
	}()

	config, err := readConfigFromFile(configFilePath)
	if err != nil {
		fmt.Printf("Ошибка загрузки конфигурационных данных: %v\n", err)
		return
	}

	// инициализации сервера
	server := &http.Server{
		Addr:    fmt.Sprintf(":%s", config.Port),
		Handler: http.DefaultServeMux,
	}

	/*
		без StripPrefix("/static/") не дает загрузить script.js:
		Refused to execute script from 'http://localhost:8324/static/script.js' because its MIME type ('text/plain'), because...
	*/
	staticFilesDir := http.Dir("./static")

	http.Handle("/", http.StripPrefix("/static/", http.FileServer(staticFilesDir)))
	http.HandleFunc("/paths", getPaths)

	// горутина запуска сервера
	go func() {
		fmt.Printf("Запуск сервера на http://localhost:%s ...\n", config.Port)
		err := server.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			panic(err)
		}

		// обработка паники в случае ошибки сервера
		defer func() {
			err := recover()
			if err != nil {
				fmt.Printf("Остановка сервера из-за паники: %v.", err)
				cancel()
			}
		}()
	}()

	// блокировка программы до момента отмены контекста ctx;
	<-ctx.Done()
}

// readConfigFromFile получает кофигурационные данные из соответствующего файла и возвращает их
func readConfigFromFile(configFilePath string) (Config, error) {
	var config Config
	configFileContent, err := os.ReadFile(configFilePath)
	if err != nil {
		return config, err
	}

	err = json.Unmarshal(configFileContent, &config)
	if err != nil {
		return config, err
	}

	return config, nil
}

// getPaths совершает обход директорий по указанному в запросе пути,
// получает информацию (имя, размер, тип: файл или папка и дата модификации) о каждом входящем в указанную директорию элементе (папке или файле)
// и отправляет её в формате JSON
func getPaths(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
	response := ResponseStruct{
		IsSucceed: true,
		ErrorText: "",
		Data:      "",
		LoadTime:  0,
	}

	// получение параметров из запроса
	srcPath, sortField, sortOrder := getRequestParams(r)

	// создание сортированного среза элементов в заданной директории
	pathsSlice, err := createSortedSliceOfPathItems(srcPath, sortField, sortOrder)
	if err != nil {
		w.WriteHeader(http.StatusOK)
		response.ErrorText = fmt.Sprintf("Ошибка при создании сортированного среза данных: %v", err)
		response.IsSucceed = false
		duration := float64(time.Since(startTime).Seconds())
		response.LoadTime = duration
		response.Data = "No data"

		responseJsonFormat, err := json.Marshal(response)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			// как тут показывать ошибку?
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(responseJsonFormat)
		return
	}

	// создание нового среза элементов в заданной директории для дальнейшей конвертации в JSON формат
	pathsSliceForJson := createConvertedPathsSliceForJson(pathsSlice)

	// расчет времени выполнения работы функции
	duration := float64(time.Since(startTime).Seconds())

	// составление ответа на клиент
	response.Data = pathsSliceForJson
	response.LoadTime = duration

	// конвертация ответа на клиент в JSON формат
	responseJsonFormat, err := json.Marshal(response)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		// как тут показывать ошибку?
		return
	}

	// отправка ответа на клиент
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseJsonFormat)
}

// getRequestParams получает параметры из запроса: путь корневой папки, поле сортировки, порядок сортировки
func getRequestParams(r *http.Request) (string, string, string) {
	srcPath := r.URL.Query().Get("path")
	sortField := r.URL.Query().Get("sortField")
	sortOrder := r.URL.Query().Get("sortOrder")
	return srcPath, sortField, sortOrder
}
