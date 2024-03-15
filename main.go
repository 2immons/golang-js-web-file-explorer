package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	fileprocessing "paths-getter/server/fileprocessing"
	"time"
)

const configFilePath string = "server/server.config.json" // путь к файлу конфигураци

type ServerConfig struct {
	Port string `json:"port"` // порт сервера
}

type ResponseStruct struct {
	IsSucceed bool        `json:"serverIsSucceed"` // успешно ли обработан запрос
	ErrorText string      `json:"serverErrorText"` // текст ошибки
	Nodes     interface{} `json:"nodes"`           // вхождения в заданную запросом директорию
	LoadTime  float64     `json:"loadTime"`        // время обработки запроса
}

type RequestStruct struct {
	IsSucceed   bool      `json:"serverIsSucceed"` // успешно ли отправлен запрос
	ErrorText   string    `json:"serverErrorText"` // текст ошибки
	TotalSize   int64     `json:"totalSize"`       // общий вес всех директорий
	LoadTime    float64   `json:"loadTime"`        // время обработки запроса
	RequestDate time.Time `json:"date"`            // дата и время обработки
	RootPath    string    `json:"path"`            // корневой путь обработки
}

func main() {
	// создание корневого контекста для программы с функцией отмены
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// отлавливание сигнала прерывания работы и передача его в канал
	osSignalChan := make(chan os.Signal, 1)
	signal.Notify(osSignalChan, os.Interrupt)

	// обработка паники в случае ошибки сервера
	defer func() {
		r := recover()
		if r != nil {
			fmt.Printf("Остановка сервера из-за паники: %v.", r)
			cancel()
		}
	}()

	// горутина закрытия приложения с отменой корневого контекста
	go func() {
		<-osSignalChan
		fmt.Println("Получен сигнал остановки...")
		cancel()
	}()

	serverConfig, err := readConfigFromFile(configFilePath)
	if err != nil {
		fmt.Printf("Ошибка загрузки конфигурационных данных: %v\n", err)
		return
	}

	// инициализации сервера
	server := &http.Server{
		Addr:    fmt.Sprintf(":%s", serverConfig.Port),
		Handler: http.DefaultServeMux,
	}

	// путь к style.css и .js файлам
	http.Handle("/src/", http.StripPrefix("/src/", http.FileServer(http.Dir("./src"))))
	http.Handle("/src/JSscripts/", http.StripPrefix("/src/JSscripts/", http.FileServer(http.Dir("./src/JSscripts"))))

	// путь к index.html
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./public"))))

	http.HandleFunc("/nodes", handleGetNodesRequestWithContext(ctx, handleGetNodesRequest))

	// горутина запуска сервера
	go func() {
		fmt.Printf("Запуск сервера на http://localhost:%s ...\n", serverConfig.Port)
		err := server.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			panic(err)
		}

		cancel()
	}()

	// блокировка программы до момента отмены контекста ctx;
	<-ctx.Done()

	// остановка сервера
	fmt.Println("Остановка сервера...")
	err = server.Shutdown(context.Background())
	if err != nil {
		fmt.Printf("Ошибка при остановке сервера %v\n", err)
	}
}

// readConfigFromFile получает кофигурационные данные из соответствующего файла и возвращает их
func readConfigFromFile(configFilePath string) (ServerConfig, error) {
	var config ServerConfig
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

// getRequestParams получает параметры из запроса: путь корневой папки, поле сортировки, порядок сортировки
func getRequestParams(r *http.Request) (string, string, string) {
	srcPath := r.URL.Query().Get("path")
	sortField := r.URL.Query().Get("sortField")
	sortOrder := r.URL.Query().Get("sortOrder")
	return srcPath, sortField, sortOrder
}

// handleGetNodesRequestWithContext представляет из себя мидлвар для передачи контекста из main в getPaths
func handleGetNodesRequestWithContext(ctx context.Context, h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		h(w, r.WithContext(ctx))
	}
}

// handleGetNodesRequest совершает обход директорий по указанному в запросе пути,
// получает информацию (имя, размер, тип: файл или папка и дата модификации) о каждом входящем в указанную директорию элементе (папке или файле)
// и отправляет её в формате JSON
func handleGetNodesRequest(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()

	response := ResponseStruct{
		IsSucceed: true,
		ErrorText: "",
		Nodes:     "",
		LoadTime:  0,
	}

	// получение параметров из запроса
	srcPath, sortField, sortOrder := getRequestParams(r)

	// получение отсортированного среза узлов файловой системы с информацией о них
	// по заданному пути, полю сортировки и направлению
	nodesSliceForJson, totalSize, err := fileprocessing.GetNodesSliceForJson(srcPath, sortField, sortOrder)
	if err != nil {
		w.WriteHeader(http.StatusOK)
		response.ErrorText = fmt.Sprintf("Ошибка при создании сортированного среза данных: %v", err)
		response.IsSucceed = false
		duration := float64(time.Since(startTime).Seconds())
		response.LoadTime = duration
		response.Nodes = "No data"

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

	// расчет времени выполнения работы функции
	loadTime := float64(time.Since(startTime).Seconds())

	// составление ответа на клиент
	response.Nodes = nodesSliceForJson
	response.LoadTime = loadTime

	// конвертация ответа на клиент в JSON формат
	responseJsonFormat, err := json.Marshal(response)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// отправка ответа на клиент
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseJsonFormat)

	apacheURL := "http://localhost:80/index.php"

	requestData := RequestStruct{
		IsSucceed:   true,
		ErrorText:   "",
		TotalSize:   totalSize,
		LoadTime:    loadTime,
		RequestDate: time.Now(),
		RootPath:    srcPath,
	}

	jsonRequestData, err := json.Marshal(requestData)
	if err != nil {
		return
	}

	client := &http.Client{}

	req, err := http.NewRequest("POST", apacheURL, bytes.NewBuffer(jsonRequestData))
	if err != nil {
		return
	}

	req.Header.Set("Content-Type", "applicaton/json")

	resp, err := client.Do(req)
	if err != nil {
		return
	}

	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		fmt.Println(1)
	} else if resp.StatusCode == 404 {
		fmt.Println(2)
	}
}
