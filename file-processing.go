package main

import (
	"context"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"sync"
)

// createSortedSliceOfPathItems создает сортированный срез элементов в заданной директории
func createSortedSliceOfPathItems(ctx context.Context, srcPath string, sortField string, sortOrder string) ([]pathItems, error) {
	// go func() {
	// 	<-ctx.Done()
	// 	fmt.Println("bad")
	// }()

	select {
	case <-ctx.Done():
		fmt.Println("bad time")
		err := fmt.Errorf("error")
		return nil, err
	default:
	}

	if srcPath == "" {
		currentDir, err := os.Getwd()
		if err != nil {
			return nil, err
		}
		srcPath = filepath.Join(filepath.VolumeName(filepath.Clean(currentDir)), "/")
	}

	// обход заданной директории
	dirEntries, err := os.ReadDir(srcPath)
	if err != nil {
		return nil, err
	}

	var wg sync.WaitGroup

	// срез для элементов (dirEntries), находящихся в заданной директории
	pathsSlice := make([]pathItems, len(dirEntries))

	// получение информации о каждом элементе (имя, размер, тип, время модификации) и запись в срез pathsSlice
	for i, dirEntry := range dirEntries {
		wg.Add(1)
		go func(index int, dirEntry os.DirEntry) {
			defer wg.Done()
			// текущий index передается внутрь замыкания, чтобы каждая горутина использовала свой уникальный индекс
			getDirEntryInfoAndWriteToSlice(srcPath, dirEntry, pathsSlice, index)
		}(i, dirEntry)
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
			Path:     value.Path,
			ItemSize: formatSize(value.ItemSize),
			IsDir:    isDirValue,
			EditDate: value.EditDate.Format("02.01.2006 15:04"),
		}
	}

	return pathsSliceForJson
}

// getDirEntryInfoAndWriteToSlice получает имя, размер, тип (файл или директория) и последнее время редактирования директории,
// после чего добавляет эту информацию в срез pathSlice по своему уникальному индексу
func getDirEntryInfoAndWriteToSlice(srcPath string, dirEntry fs.DirEntry, pathsSlice []pathItems, index int) {
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
	absoluteDirPath := filepath.Join(srcPath, dirEntry.Name())

	// вставка данных в срез по индексу
	(pathsSlice)[index] = pathItems{absoluteDirPath, itemSize, dirEntry.IsDir(), lastModifiedTime}
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
			return pathsSlice[i].Path < pathsSlice[j].Path
		} else {
			return pathsSlice[i].Path > pathsSlice[j].Path
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
