package main

import (
	"flag"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func main() {
	start := time.Now()
	srcPath := flag.String("src", "DEFAULT VALUE", "Путь к корневой папке")
	flag.Parse()

	if *srcPath == "DEFAULT VALUE" {
		fmt.Println("Введите параметры:")
		flag.VisitAll(func(f *flag.Flag) {
			fmt.Printf(" --%s - %s\n", f.Name, f.Usage)
		})
		os.Exit(1)
	}

	// вывод заголовка таблицы результатов
	err := printHeader(*srcPath)
	if err != nil {
		return
	}

	// обход корневой папки
	err = filepath.Walk(*srcPath, func(currentPath string, fileInfo os.FileInfo, err error) error {
		if err != nil {
			fmt.Println("Ошибка доступа по пути:", err)
			return err
		}

		// исключенние файлов и папок на уровне вложенности ниже 1 относительно корневой папки
		currentRelPath, err := filepath.Rel(*srcPath, currentPath)
		if err != nil {
			fmt.Println("Ошибка получения относительного путя:", err)
			return err
		}

		// является ли относительный путь корневым (.) или содержит ли какой-нибудь символ разделителя пути
		if currentRelPath == "." || strings.Contains(currentRelPath, "\\") || strings.Contains(currentRelPath, "/") {
			return nil
		}

		// печать информации о вложенных в указанную папку элементах (файлы и директории)
		err = printFileOrDirInfo(currentPath, currentRelPath, fileInfo)
		if err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		os.Exit(1)
	}

	duration := time.Since(start)
	fmt.Println(duration)
}

// printHeader печатает абсолютный путь до указанной папки и шапку таблицы под ней
func printHeader(srcPath string) error {
	absPath, err := filepath.Abs(srcPath)
	if err != nil {
		fmt.Println("Ошибка получения абсолютного путя:", err)
		return err
	}

	// вывод шапки таблицы
	fmt.Printf("%s:\n", absPath)
	fmt.Printf("\tТИП   | %-25s | РАЗМЕР\n\t-------------------------------------------------\n", "ИМЯ")
	return nil
}

// printFileOrDirInfo выводит информацию (файл или директория, название, размер) в терминал
func printFileOrDirInfo(currentPath, currentRelPath string, fileInfo fs.FileInfo) error {
	if fileInfo.IsDir() {
		dirSize, err := calculateFolderSize(currentPath)
		if err != nil {
			return err
		}
		fmt.Printf("\tПапка | %-25s | %s\n", currentRelPath, formatSize(dirSize))
	} else {
		fmt.Printf("\tФайл  | %-25s | %s\n", currentRelPath, formatSize(fileInfo.Size()))
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
