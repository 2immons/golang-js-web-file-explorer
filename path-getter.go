package main

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"
)

// структура элементов (файлов и директорий)
type pathItems struct {
	RelPath  string    // относительный путь к элементу (папке или директор) по отношению к заданной пользователем
	ItemSize int64     // размер элемента
	IsDir    bool      // является ли элемент директорией
	EditDate time.Time // дата время последнего изменения
}

// структура элементов (файлов и директорий) переведенные в string формат для отправки на клиент
type pathItemsForJson struct {
	RelPath  string `json:"relPath"`  // относительный путь к элементу (папке или директор) по отношению к заданной пользователем
	ItemSize string `json:"itemSize"` // размер элемента
	IsDir    string `json:"type"`     // является ли элемент директорией
	EditDate string `json:"editDate"` // дата время последнего изменения
}

type Config struct {
	Port string `json:"port"` // порт сервера
}

type ResponseStruct struct {
	Status    bool        `json:"serverStatus"`    // булевое значение верной отработки запроса
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
	// получение конфигурационных данных из файла
	config, err := getConfig(configFilePath)
	if err != nil {
		fmt.Println("Error config:", err)
		return
	}

	http.Handle("/", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))
	http.HandleFunc("/paths", getPaths)

	//http.HandleFunc("/", routeHandler) // ВОПРОС: роутер можно реализовать здесь как отдельный handler, который будет пересылать по путям?

	adress := ":" + config.Port

	fmt.Printf("Starting server at http://localhost:%s ...\n", config.Port)
	if err := http.ListenAndServe(adress, nil); err != nil {
		fmt.Println(err)
	}
}

// getConfig получает кофигурационные данные из соответствующего файла и возвращает их
func getConfig(configFilePath string) (Config, error) {
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

// getRequestParams получает параметры из запроса: путь корневой папки, поле сортировки, порядок сортировки
func getRequestParams(r *http.Request) (string, string, string) {
	srcPath := r.URL.Query().Get("path")
	sortField := r.URL.Query().Get("sortField")
	sortOrder := r.URL.Query().Get("sortOrder")
	return srcPath, sortField, sortOrder
}

// getPaths совершает обход директорий по указанному в запросе пути,
// получает информацию (имя, размер, тип: файл или папка и дата модификации) о каждом входящем в указанную директорию элементе (папке или файле)
// и отправляет её в формате JSON
func getPaths(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
	response := ResponseStruct{
		Status:    true,
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
		response.Status = false
		duration := float64(time.Since(startTime).Seconds())
		response.LoadTime = duration
		response.Data = "No data"
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

// createConvertedPathsSliceForJson создает срез элементов в заданной директории для дальнейшей конвертации в JSON формат
func createConvertedPathsSliceForJson(pathsSlice []pathItems) []pathItemsForJson {
	pathsSliceForJson := make([]pathItemsForJson, len(pathsSlice))

	for i, value := range pathsSlice {
		// замена bool на сооветствующее string элементов pathsSlice
		isDirValue := "Файл"
		if value.IsDir {
			isDirValue = "Папка"
		}

		// присвоение значений новому срезу
		pathsSliceForJson[i] = pathItemsForJson{
			RelPath:  value.RelPath,
			ItemSize: formatSize(value.ItemSize),
			IsDir:    isDirValue,
			EditDate: value.EditDate.Format("02.01.2006 15:04"),
		}
	}

	return pathsSliceForJson
}

// createSortedSliceOfPathItems создает сортированный срез элементов в заданной директории
func createSortedSliceOfPathItems(srcPath string, sortField string, sortOrder string) ([]pathItems, error) {
	// обход заданной директории
	dirEntries, err := os.ReadDir(srcPath)
	if err != nil {
		return nil, err
	}

	var wg sync.WaitGroup

	// срез состоящий из элементов в заданной директории
	pathsSlice := []pathItems{}

	// получение информации о каждой директории (имя, размер, тип, время модификации) и запись в срез pathsSlice
	for _, dirEntry := range dirEntries {
		wg.Add(1)
		go func(dirEntry os.DirEntry) {
			getDirEntryInfoAndWriteToSlice(srcPath, dirEntry, &pathsSlice)
			wg.Done()
		}(dirEntry)
	}

	// ожидание всех горутин обхода
	wg.Wait()

	// вызов функций сортировки среза pathSlice в зависимости от поля сортировки
	if sortField == "size" {
		sortPathsBySize(pathsSlice, sortOrder)
	} else if sortField == "name" {
		sortPathsByRelPath(pathsSlice, sortOrder)
	} else if sortField == "type" {
		sortPathsByType(pathsSlice, sortOrder)
	} else if sortField == "date" {
		sortPathsByEditDate(pathsSlice, sortOrder)
	}
	return pathsSlice, nil
}

// getDirEntryInfoAndWriteToSlice получает имя, размер, тип (файл или директория) и последнее время редактирования директории,
// после чего добавляет эту информацию в срез pathSlice
func getDirEntryInfoAndWriteToSlice(srcPath string, dirEntry fs.DirEntry, pathsSlice *[]pathItems) {
	var mu sync.Mutex
	mu.Lock()
	// получение путя от корневой директории до текущей папки или файла
	currentPath := filepath.Join(srcPath, dirEntry.Name())

	// получение размера файла или директории по заданному пути
	itemSize, err := getDirSize(currentPath, dirEntry)
	if err != nil {
		return
	}

	fileInfo, err := dirEntry.Info()
	if err != nil {
		return
	}

	lastModifiedTime := fileInfo.ModTime()

	*pathsSlice = append(*pathsSlice, pathItems{dirEntry.Name(), itemSize, dirEntry.IsDir(), lastModifiedTime})
	mu.Unlock()
}

// getDirSize по заданному пути получает размер директории (файла или папки)
func getDirSize(currentPath string, dirEntry fs.DirEntry) (int64, error) {

	// вызов calculateFolderSize(), если путь является папкой
	if dirEntry.IsDir() {
		itemSize, err := calculateFolderSize(currentPath)
		if err != nil {
			return 0, err
		}
		return itemSize, nil
	} else {
		fileInfo, err := dirEntry.Info()
		if err != nil {
			return 0, err
		}
		itemSize := fileInfo.Size()
		return itemSize, nil
	}
}

// sortParths производит сортировку среза
func sortPathsBySize(pathsSlice []pathItems, sortOrder string) {
	less := func(i, j int) bool {
		if sortOrder == string(asc) {
			return pathsSlice[i].ItemSize > pathsSlice[j].ItemSize
		} else {
			return pathsSlice[i].ItemSize < pathsSlice[j].ItemSize
		}
	}

	sort.Slice(pathsSlice, less)
}

func sortPathsByRelPath(pathsSlice []pathItems, sortOrder string) {
	less := func(i, j int) bool {
		if sortOrder == string(asc) {
			return pathsSlice[i].RelPath < pathsSlice[j].RelPath
		} else {
			return pathsSlice[i].RelPath > pathsSlice[j].RelPath
		}
	}

	sort.Slice(pathsSlice, less)
}

func sortPathsByType(pathsSlice []pathItems, sortOrder string) {
	less := func(i, j int) bool {
		if sortOrder == string(asc) {
			return pathsSlice[i].IsDir && !pathsSlice[j].IsDir
		} else {
			return !pathsSlice[i].IsDir && pathsSlice[j].IsDir
		}
	}

	sort.Slice(pathsSlice, less)
}

func sortPathsByEditDate(pathsSlice []pathItems, sortOrder string) {
	less := func(i, j int) bool {
		if sortOrder == string(asc) {
			return pathsSlice[i].EditDate.Before(pathsSlice[j].EditDate)
		} else {
			return pathsSlice[i].EditDate.After(pathsSlice[j].EditDate)
		}
	}

	sort.Slice(pathsSlice, less)
}

// formatSize переводит размер из байт в удобный вид (Кб, Мб)
func formatSize(size int64) string {
	const kb = 1024
	const mb = 1024 * kb
	const gb = 1024 * mb

	switch {
	case size < kb:
		return fmt.Sprintf("%d байт", size)
	case size < mb:
		return fmt.Sprintf("%.2f Кб", float64(size)/float64(kb))
	case size < gb:
		return fmt.Sprintf("%.2f Мб", float64(size)/float64(mb))
	default:
		return fmt.Sprintf("%.2f Гб", float64(size)/float64(gb))
	}
}

// calculateFolderSize подсчитывает размер папки, учитывая все вложенные в нее элементы
func calculateFolderSize(folderPath string) (int64, error) {
	var size int64

	err := filepath.Walk(folderPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		size += info.Size()
		return nil
	})

	return size, err
}
