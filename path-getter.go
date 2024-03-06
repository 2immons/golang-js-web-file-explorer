package main

// Через флаг задается корневая директория
// Выводится список всех вложенных файлов и других директорий в корневой с указанием их размера

// go run . --src="/"

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
)

// processFile() производт обработку каждого файла: выводит его путь и размер в терминал;
// в случае ошибок доступа к файлу или ошибки получения информации о файле, выводит их на экран.
func processFile(path string, dir os.DirEntry, err error) error {
	if err != nil {
		fmt.Printf("Ошибка доступа по пути: %s. Ошибка: %v\n", path, err)
		return nil
	}

	fileInfo, err := dir.Info()
	if err != nil {
		fmt.Printf("Ошибка получения информации о файле по пути: %s. Ошибка: %v\n", path, err)
		return nil
	}

	fmt.Printf("%s ----- размер: %d байтов\n", path, fileInfo.Size())
	return nil
}

// main() считывает с терминала флаг, парсит его и получает корневую директорию,
// затем использует filePath.Walk() для обхода всех файлов и поддиректорий, начиная с корневой и вызывает для каждого файла processFile()
func main() {
	// парсинг флага из терминала
	srcPath := flag.String("src", "", "Source dir path")
	flag.Parse()

	// обход всех файлов и поддиректорий
	err := filepath.WalkDir(*srcPath, processFile)
	if err != nil {
		fmt.Println(err)
	}
}
