package fileprocessing

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"
)

type Sort string

const (
	asc  Sort = "asc"  // по возрастанию сортировка
	desc Sort = "desc" // по убыванию сортировка

	size    Sort = "size" // размер директории
	name    Sort = "name" // имя директори
	dirType Sort = "type" // тип директории
	date    Sort = "date" // дата модификации директории
)

// структура элементов (файлов и директорий)
type nodeItem struct {
	Name     string    // имя директории
	Path     string    // путь к элементу (папке или директор)
	ItemSize int64     // размер элемента
	IsDir    bool      // является ли элемент директорией
	EditDate time.Time // дата время последнего изменения
}

// структура элементов (файлов и директорий) переведенные в string формат для отправки на клиент
type nodeItemForJson struct {
	Name     string `json:"name"`     // имя директории
	Path     string `json:"path"`     // путь к элементу (папке или директории)
	ItemSize string `json:"itemSize"` // размер элемента
	IsDir    string `json:"type"`     // является ли элемент директорией
	EditDate string `json:"editDate"` // дата время последнего изменения
}

// GetNodesSliceForJson возвращает для маршалинга отсортированный срез срез вхождений в заданную директорию с информацией о них
func GetNodesSliceForJson(srcPath string, sortField string, sortOrder string) ([]nodeItemForJson, int64, error) {
	pathsSlice, err := createSortedSliceOfPathItems(srcPath, sortField, sortOrder)
	if err != nil {
		return nil, 0, err
	}
	totalSize := getTotalSize(pathsSlice)
	pathSliceForJson := createConvertedPathsSliceForJson(pathsSlice)
	return pathSliceForJson, totalSize, nil
}

// createSortedSliceOfPathItems создает сортированный срез вхождений в заданную директорию
func createSortedSliceOfPathItems(srcPath string, sortField string, sortOrder string) ([]nodeItem, error) {
	if srcPath == "" {
		currentDir, err := os.Getwd()
		if err != nil {
			return nil, err
		}
		srcPath = filepath.Join(filepath.VolumeName(filepath.Clean(currentDir)), "/")
	}

	// получение вхождений в заданную директрию
	dirEntries, err := os.ReadDir(srcPath)
	if err != nil {
		return nil, err
	}

	var wg sync.WaitGroup

	// срез для вхождений (dirEntries) в заданную директорию
	pathsSlice := make([]nodeItem, len(dirEntries))

	// получение информации о каждом вхождении (имя, размер, тип, время модификации) и запись в срез pathsSlice
	for i, dirEntry := range dirEntries {
		wg.Add(1)
		go func(index int, dirEntry os.DirEntry) {
			defer wg.Done()
			// текущий index передается внутрь замыкания, чтобы каждая горутина использовала свой уникальный индекс
			err = getDirEntryInfoAndWriteToSlice(srcPath, dirEntry, pathsSlice, index)
			if err != nil {
				fmt.Println(err)
			}
		}(i, dirEntry)
	}
	wg.Wait()

	// удаление из среза вхождений, у которых пустое поле имени (т.е. к которым недостаточно доступа)
	var cleanedPathsSlice []nodeItem
	for _, path := range pathsSlice {
		if path.Name != "" {
			cleanedPathsSlice = append(cleanedPathsSlice, path)
		}
	}
	pathsSlice = cleanedPathsSlice

	// вызов функций сортировки среза pathSlice в зависимости от поля сортировки
	if sortField == string(size) {
		sortPathsBySize(pathsSlice, sortOrder)
	} else if sortField == string(name) {
		sortPathsByName(pathsSlice, sortOrder)
	} else if sortField == string(dirType) {
		sortPathsByType(pathsSlice, sortOrder)
	} else if sortField == string(date) {
		sortPathsByEditDate(pathsSlice, sortOrder)
	}
	return pathsSlice, nil
}

// createConvertedPathsSliceForJson из полученного среза вхождений создает новый срез вхождений, подходящий для маршалинга
func createConvertedPathsSliceForJson(pathsSlice []nodeItem) []nodeItemForJson {
	pathsSliceForJson := make([]nodeItemForJson, len(pathsSlice))

	for i, value := range pathsSlice {
		// замена bool на сооветствующее string элементов pathsSlice
		isDirValue := "Файл"
		if value.IsDir {
			isDirValue = "Папка"
		}

		// присвоение значений новому срезу
		pathsSliceForJson[i] = nodeItemForJson{
			Name:     value.Name,
			Path:     value.Path,
			ItemSize: formatSize(value.ItemSize),
			IsDir:    isDirValue,
			EditDate: value.EditDate.Format("02.01.2006 15:04"),
		}
	}

	return pathsSliceForJson
}

// getDirEntryInfoAndWriteToSlice получает имя, размер, тип (файл или директория) и последнее время редактирования директории,
// после чего добавляет эту информацию в срез вхождений pathSlice по своему уникальному индексу
func getDirEntryInfoAndWriteToSlice(srcPath string, dirEntry fs.DirEntry, pathsSlice []nodeItem, index int) error {
	// получение пути от корневой директории до текущей папки или файла
	currentPath := filepath.Join(srcPath, dirEntry.Name())

	// получение размера файла или директории по заданному пути
	itemSize, err := getDirSize(currentPath, dirEntry)
	if err != nil {
		return err
	}

	// получение даты и времени последней модификации директории
	fileInfo, err := dirEntry.Info()
	if err != nil {
		return err
	}
	lastModifiedTime := fileInfo.ModTime()

	// получение имени директори и абсолютного пути
	dirName := dirEntry.Name()
	absoluteDirPath := filepath.Join(srcPath, dirName)

	// вставка данных в срез по индексу
	(pathsSlice)[index] = nodeItem{dirName, absoluteDirPath, itemSize, dirEntry.IsDir(), lastModifiedTime}
	return nil
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

// sortParths производит сортировку среза по размеру директории
func sortPathsBySize(pathsSlice []nodeItem, sortOrder string) {
	less := func(i, j int) bool {
		if sortOrder == string(asc) {
			return pathsSlice[i].ItemSize > pathsSlice[j].ItemSize
		} else {
			return pathsSlice[i].ItemSize < pathsSlice[j].ItemSize
		}
	}

	sort.Slice(pathsSlice, less)
}

// sortParths производит сортировку среза по имени директории
func sortPathsByName(pathsSlice []nodeItem, sortOrder string) {
	less := func(i, j int) bool {
		if sortOrder == string(asc) {
			return pathsSlice[i].Name < pathsSlice[j].Name
		} else {
			return pathsSlice[i].Name > pathsSlice[j].Name
		}
	}

	sort.Slice(pathsSlice, less)
}

// sortParths производит сортировку среза по типу директории
func sortPathsByType(pathsSlice []nodeItem, sortOrder string) {
	less := func(i, j int) bool {
		if sortOrder == string(asc) {
			return pathsSlice[i].IsDir && !pathsSlice[j].IsDir
		} else {
			return !pathsSlice[i].IsDir && pathsSlice[j].IsDir
		}
	}

	sort.Slice(pathsSlice, less)
}

// sortParths производит сортировку среза по дате модификации директории
func sortPathsByEditDate(pathsSlice []nodeItem, sortOrder string) {
	less := func(i, j int) bool {
		if sortOrder == string(asc) {
			return pathsSlice[i].EditDate.Before(pathsSlice[j].EditDate)
		} else {
			return pathsSlice[i].EditDate.After(pathsSlice[j].EditDate)
		}
	}

	sort.Slice(pathsSlice, less)
}

// formatSize переводит размер из байт в читабельный вид (Кб, Мб, Гб)
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

func getTotalSize(pathsSlice []nodeItem) int64 {
	var totalSize int64 = 0
	for _, node := range pathsSlice {
		totalSize += node.ItemSize
	}
	return totalSize
}
