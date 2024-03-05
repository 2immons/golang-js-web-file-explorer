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

func processFile(path string, fileInfo os.FileInfo, err error) error {
	fmt.Printf("%s ----- size of %d bytes\n", path, fileInfo.Size())
	return nil
}

func main() {
	srcPath := flag.String("src", "", "Source dir path")
	flag.Parse()

	err := filepath.Walk(*srcPath, processFile)
	if err != nil {
		fmt.Println(err)
	}
}
