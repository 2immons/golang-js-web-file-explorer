// sortTable обрабатывает нажатие кнопки сортировки (определяет порядок)
function sortTable(sortField) {
    const sortOrder = currentSortOrder === ASC ? (currentSortOrder = DESC) : (currentSortOrder = ASC)
    getPaths(sortField, sortOrder, currentPath)
};

// устанавливает значение текущего пути на 1 уровень выше
let backButton = document.getElementById("back-button")
backButton.addEventListener("onclick", function () {
    let pathArray = currentPath.split('/')

    // если путь вида "dir" ('/'), то установка возврат
    if (currentPath.length <= 1) {
        return
    // если в Windows путь вида "ДИСК:/dir", то установка "ДИСК:/"
    } else if (os === WINDOWS && pathArray.length === 2) {
        currentPath = pathArray[0] + "/"
        getPaths(defaultSortField, defaultSortOrder, currentPath)
        setCurrentPathToInput()
        return
    } 
    // если в Windows путь вида "ДИСК:/", то возврат
    else if (os === WINDOWS && pathArray.length < 2) {
        return
    }
    // если в Linux путь вида "/home", то возврат
    else if (os === LINUX && pathArray.length <= 2) {
        currentPath = "/"
        getPaths(defaultSortField, defaultSortOrder, currentPath)
        setCurrentPathToInput()
        return
    }

    // удаление последнего составляющее пути и соединение его обратно в строку
    pathArray.pop()
    currentPath = pathArray.join('/')

    getPaths(defaultSortField, defaultSortOrder, currentPath)
    setCurrentPathToInput()   
});

// setPreviousPath устанавливает значение текущего пути в зависимости от директории, в которую пользователь перешел
function setNewPath(dir) {
    console.log(currentPath)
    if (currentPath.endsWith("/")) {
        currentPath += dir
    } else {
        currentPath = currentPath + '/' + dir
    }
    
    getPaths(defaultSortField, defaultSortOrder, currentPath)
    setCurrentPathToInput()
};

// setPreviousPath устанавливает значение текущего пути заданному в поиске
function setNewPathByInput(event) {
    if (event.key === "Enter") {
        let inputValue = document.getElementById("path").value

        // TODO: проверка на валидность пути через регулярные выражения?
        // if (inputValue.charAt(inputValue.length - 1) === "/") {
        //     inputValue = inputValue.slice(0, -1)
        // }

        currentPath = inputValue
        getPaths(defaultSortField, defaultSortOrder, currentPath)
        setCurrentPathToInput()
    }
};

export default {sortTable, setPreviousPath, setNewPath, setNewPathByInput}