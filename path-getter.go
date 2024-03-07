package main

import (
	"flag"
	"fmt"
	"io/fs"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"
)

// структура элементов-путей (файлов и директорий)
type pathItems struct {
	relPath  string // путь относительно srcPath пользователя
	itemSize int64  // размер
	isDir    bool   // является ли директорией
}

type Sort string

const (
	ASC  Sort   = "asc"
	DES  Sort   = "des"
	PORT string = ":8321"
)

func startServer() {
	fs := http.FileServer(http.Dir("./static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))
	http.HandleFunc("/paths", getPaths)

	//http.HandleFunc("/", routeHandler) // сделать роутер?
	err := http.ListenAndServe(PORT, nil)
	if err != nil {
		fmt.Println(err)
	}
}

// getPaths получает по запросу получает информацию из json и отправляет ее на сервер
func getPaths(w http.ResponseWriter, r *http.Request) {
	// TODO: замена на postre/mysql ?
	fileContent, err := ioutil.ReadFile("db/db.json")
	if err != nil {
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(fileContent)
}

func main() {
	start := time.Now()

	startServer()

	srcPath, sortOrder, err := parseFlag()
	if err != nil {
		return
	}

	pathsArray := []pathItems{}

	// вывод заголовка таблицы результатов
	err = printHeader(srcPath)
	if err != nil {
		return
	}

	// обход корневой папки
	dirEntries, err := os.ReadDir(srcPath)
	if err != nil {
		fmt.Println("Ошибка доступа по пути:", err)
		return
	}

	var wg sync.WaitGroup
	resultCh := make(chan pathItems, len(dirEntries))

	// обход по найденным вхождениям в корневую папку
	for _, dirEntry := range dirEntries {
		wg.Add(1)
		go processDirEntry(srcPath, dirEntry, resultCh, &wg)
	}

	// ожидание всех горутин и закрытие канала с их данными
	wg.Wait()
	close(resultCh)

	// добавление в срез pathsArray данных из канала горутин
	for result := range resultCh {
		pathsArray = append(pathsArray, result)
	}

	sortPathsBySize(pathsArray, sortOrder)

	// вывод информации о элементах-путях в терминал
	for _, pathItem := range pathsArray {
		err = printFileOrDirInfo(pathItem.relPath, pathItem.itemSize, pathItem.isDir)
		if err != nil {
			return
		}
	}

	// вывод времени
	duration := float64(time.Since(start).Seconds())
	fmt.Printf("\nДлительность в секундах: %f", duration)
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

	resultCh <- pathItems{dirEntry.Name(), itemSize, dirEntry.IsDir()}
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
func sortPathsBySize(pathsArray []pathItems, sortOrder string) {
	less := func(i, j int) bool {
		if sortOrder == "asc" {
			return pathsArray[i].itemSize > pathsArray[j].itemSize
		} else {
			return pathsArray[i].itemSize < pathsArray[j].itemSize
		}
	}

	sort.Slice(pathsArray, less)
}

// parseFlag парсит флаги, заданные пользователем в консоли
func parseFlag() (string, string, error) {
	var srcPath string
	flag.StringVar(&srcPath, "src", "DEFAULT VALUE", "путь к корневой папке")
	var sort string
	flag.StringVar(&sort, "sort", "asc", "(необязательный) способ сортировки (по возрастанию asc; по убыванию des): по умолчанию 'asc'")
	flag.Parse()

	// проверка корректности введенных параметров
	if srcPath == "DEFAULT VALUE" || (sort != string(ASC) && sort != string(DES)) {
		errMsg := "Ошибка в параметрах. Введите параметры или проверьте корректность их ввода:\n"
		flag.VisitAll(func(f *flag.Flag) {
			errMsg += fmt.Sprintf(" --%s - %s\n", f.Name, f.Usage)
		})
		fmt.Println(errMsg)
		return "", "", fmt.Errorf(errMsg)
	}

	// вывод дополнительной справочной информации
	fmt.Println("Вы можете использовать параметр --sort - способ сортировки (по возрастанию asc; по убыванию des): по умолчанию 'asc'")
	if sort == string(ASC) {
		fmt.Print("СОРТИРОВКА ПО ВОЗРАСТАНИЮ\n\n")
	} else if sort == string(DES) {
		fmt.Print("СОРТИРОВКА ПО УБЫВАНИЮ\n\n")
	}

	return srcPath, sort, nil
}

// printHeader печатает абсолютный путь до указанной папки и шапку таблицы под ней
func printHeader(srcPath string) error {
	absPath, err := filepath.Abs(srcPath)
	if err != nil {
		fmt.Println("Ошибка получения абсолютного путя:", err)
		return err
	}

	fmt.Printf("%s:\n", absPath)
	fmt.Printf("\tТИП   | %-25s | РАЗМЕР\n\t-------------------------------------------------\n", "ИМЯ")
	return nil
}

// printFileOrDirInfo выводит информацию (файл или директория, название, размер) в терминал
func printFileOrDirInfo(relPath string, itemSize int64, isDir bool) error {
	if isDir {
		fmt.Printf("\tПапка | %-25s | %s\n", relPath, formatSize(itemSize))
	} else {
		fmt.Printf("\tФайл  | %-25s | %s\n", relPath, formatSize(itemSize))
	}
	return nil
}

// formatSize переводит размер из байт в удобный вид (Кб, Мб)
func formatSize(size int64) string {
	const kb = 1024
	const mb = 1024 * kb

	switch {
	case size < kb:
		return fmt.Sprintf("%d байт", size)
	case size < mb:
		return fmt.Sprintf("%.2f Кб", float64(size)/float64(kb))
	default:
		return fmt.Sprintf("%.2f Мб", float64(size)/float64(mb))
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
