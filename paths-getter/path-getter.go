package main

// Через флаг задается корневая директория
// Выводится список всех вложенных файлов и других директорий в корневой с указанием их размера

// go run . --src="../"

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
)

// processFile() производт обработку каждого файла: выводит его путь и размер в терминал
func processFile(path string, fileInfo os.FileInfo, err error) error {
	fmt.Printf("%s ----- size of %d bytes\n", path, fileInfo.Size())
	return nil
}

// main() считывает с терминала флаг, парсит и получает корневую директорию, с которой начнется вызов функци processFile
func main() {
	srcPath := flag.String("src", "", "Source dir path")
	flag.Parse()

	err := filepath.Walk(*srcPath, processFile)
	if err != nil {
		fmt.Println(err)
	}
}
