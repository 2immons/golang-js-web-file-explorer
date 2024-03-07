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
	RelPath  string
	ItemSize int64
	IsDir    bool
	EditDate time.Time
}

// структура элементов (файлов и директорий) переведенные в string формат для отправки на клиент
type pathItemsForJson struct {
	RelPath  string `json:"relPath"`
	ItemSize string `json:"itemSize"`
	IsDir    string `json:"type"`
	EditDate string `json:"editDate"`
}

// структура запроса
type RequestBody struct {
	SortParams  map[string]interface{} `json:"sortParams"`
	CurrentPath string                 `json:"currentPath"`
}

// ВОПРОС: еще раз нужно объяснить зачем нам эта структура для констант сортировки ?
// type Sort string

const (
	ASC       string = "asc" // константа сортировки
	DES       string = "des" // константа сортировки
	PORT      string = ":8321"
	JSON_PATH string = "db/db.json"
)

func main() {
	startServer()
}

func startServer() {
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	http.HandleFunc("/paths", getPaths)

	//http.HandleFunc("/", routeHandler) // ВОПРОС: роутер можно реализовать здесь как отдельный handler, который будет пересылать по путям?
	err := http.ListenAndServe(PORT, nil)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Printf("Сервер запущен на порту %s\n", PORT)
	}
}

// getPaths получает по запросу получает информацию из json и отправляет ее на сервер
func getPaths(w http.ResponseWriter, r *http.Request) {
	start := time.Now()

	srcPath := r.URL.Query().Get("path")
	sortOrder := r.URL.Query().Get("sortOrder")
	sortField := r.URL.Query().Get("sortField")

	// создание сортированного среза элементов в заданной директории
	pathsSlice, err := createSortedSliceOfPathItems(srcPath, sortField, sortOrder)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	// создание нового среза элементов в заданной директории для дальнейшей конвертации в JSON формат
	pathsSliceForJson := createConvertedPathsSliceForJson(pathsSlice)

	// конвертация нового среза в JSON формат и запись его в JSON файл
	err = convertToJsonAndWriteToJsonFile(pathsSliceForJson)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// чтение обновленного после записи содержимого файла JSON
	jsonFileContent, err := os.ReadFile(JSON_PATH)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// отправка ответа на сервер с JSON файлом
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonFileContent)

	duration := float64(time.Since(start).Seconds())
	fmt.Printf("\nДлительность в секундах: %f\n", duration)
}

// createConvertedPathsSliceForJson создает срез элементов в заданной директории для дальнейшей конвертации в JSON формат
func createConvertedPathsSliceForJson(pathsSlice []pathItems) []pathItemsForJson {
	pathsSliceForJson := make([]pathItemsForJson, len(pathsSlice))

	for i, v := range pathsSlice {
		// замена bool на сооветствующее string элементов pathsSlice
		isDirValue := "Файл"
		if v.IsDir {
			isDirValue = "Папка"
		}

		// присвоение значений новому срезу
		pathsSliceForJson[i] = pathItemsForJson{
			RelPath:  v.RelPath,
			ItemSize: formatSize(v.ItemSize),
			IsDir:    isDirValue,
			EditDate: v.EditDate.Format("02.01.2006 15:04"),
		}
	}

	return pathsSliceForJson
}

// createSortedSliceOfPathItems создает сортированный срез элементов в заданной директории
func createSortedSliceOfPathItems(srcPath string, sortField string, sortOrder string) ([]pathItems, error) {
	// обход заданной директории
	dirEntries, err := os.ReadDir(srcPath)
	if err != nil {
		fmt.Println("Ошибка доступа по пути:", err)
		return nil, err
	}

	var wg sync.WaitGroup
	resultPathsCh := make(chan pathItems, len(dirEntries))

	// обход найденных вхождений в заданную директорию
	for _, dirEntry := range dirEntries {
		wg.Add(1)
		go processDirEntry(srcPath, dirEntry, resultPathsCh, &wg)
	}

	// ожидание всех горутин и закрытие канала с их данными
	wg.Wait()
	close(resultPathsCh)

	// срез состоящий из элементов в заданной директории
	pathsSlice := []pathItems{}

	// добавление в срез pathsSlice данных из канала горутин
	for resultPath := range resultPathsCh {
		pathsSlice = append(pathsSlice, resultPath)
	}

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

// convertToJsonAndWriteToJsonFile конвертирует срез путей в JSON формат и записывает его в JSON файл
func convertToJsonAndWriteToJsonFile(pathsSliceForJson []pathItemsForJson) error {
	// конвертация среза в JSON
	jsonData, err := json.MarshalIndent(pathsSliceForJson, "", "  ")
	if err != nil {
		fmt.Println("Ошибка при маршалинге JSON:", err)
		return err
	}

	// запись в файл JSON
	err = os.WriteFile(JSON_PATH, jsonData, 0644)
	if err != nil {
		fmt.Println("Ошибка при записи в файл:", err)
		return err
	}

	// закрытие файла JSON после записи
	file, err := os.Open(JSON_PATH)
	if err != nil {
		fmt.Println("Ошибка при открытии файла:", err)
		return err
	}
	defer file.Close()
	return nil
}

// processDirEntry получает размер файла или директори и добавляет его в канал данных
func processDirEntry(srcPath string, dirEntry fs.DirEntry, resultCh chan<- pathItems, wg *sync.WaitGroup) {
	defer wg.Done()

	// получение путя от корневой директории до текущей папки или файла
	currentPath := filepath.Join(srcPath, dirEntry.Name())

	// получение размера файла или директории по заданному пути
	itemSize, err := getItemSize(currentPath, dirEntry)
	if err != nil {
		return
	}

	fileInfo, err := dirEntry.Info()
	if err != nil {
		return
	}

	lastModifiedTime := fileInfo.ModTime()

	resultCh <- pathItems{dirEntry.Name(), itemSize, dirEntry.IsDir(), lastModifiedTime}
}

// getItemSize по заданному пути получает размер файла или папки (папки с помощью calculateFolderSize)
func getItemSize(currentPath string, dirEntry fs.DirEntry) (int64, error) {
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
		if sortOrder == string(ASC) {
			return pathsSlice[i].ItemSize > pathsSlice[j].ItemSize
		} else {
			return pathsSlice[i].ItemSize < pathsSlice[j].ItemSize
		}
	}

	sort.Slice(pathsSlice, less)
}

func sortPathsByRelPath(pathsSlice []pathItems, sortOrder string) {
	less := func(i, j int) bool {
		if sortOrder == string(ASC) {
			return pathsSlice[i].RelPath < pathsSlice[j].RelPath
		} else {
			return pathsSlice[i].RelPath > pathsSlice[j].RelPath
		}
	}

	sort.Slice(pathsSlice, less)
}

func sortPathsByType(pathsSlice []pathItems, sortOrder string) {
	less := func(i, j int) bool {
		if sortOrder == string(ASC) {
			return pathsSlice[i].IsDir && !pathsSlice[j].IsDir
		} else {
			return !pathsSlice[i].IsDir && pathsSlice[j].IsDir
		}
	}

	sort.Slice(pathsSlice, less)
}

func sortPathsByEditDate(pathsSlice []pathItems, sortOrder string) {
	less := func(i, j int) bool {
		if sortOrder == string(ASC) {
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
			fmt.Println("Ошибка при расчете размера папки:", err)
			return err
		}

		size += info.Size()
		return nil
	})

	return size, err
}
