const ASC = 'asc'
const DESC = 'desc'

const defaultSortOrder = ASC
const defaultSortField = 'size'

const WINDOWS = "windows"
const LINUX = "linux"

let defaultPath = ""
let os = ""

let currentSortOrder = ASC
let currentPath = ''

// загрузка страницы
document.addEventListener('DOMContentLoaded', async function () {
    await getPaths(defaultSortField, defaultSortOrder, defaultPath)    
});

// getPaths получает данные с сервера и создает элементы на странице
async function getPaths(sortField, sortOrder, path) {
    // сокрытие ошибки "нет данных"
    let errorDiv = document.querySelector('.error-data-not-found')
    errorDiv.style.display = 'none'

    // очистка списка путей
    clearPathList()
    showLoading()
    const url = `/paths?sortField=${encodeURIComponent(sortField)}&sortOrder=${encodeURIComponent(sortOrder)}&path=${encodeURIComponent(path)}`
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
        let errorDiv = document.querySelector('.error-data-not-found')
        
        if (!response.ok) {
            errorDiv.style.display = 'flex'
            throw new Error('Ошибка. Данные не получены (статус отличен от 200 OK). Причина:')
        }
        
        const data = await response.json()

        // если внутренний статус с сервера не удовлетворительный, то отображение ошибки
        if (data.serverIsSucceed == false) {
            errorDiv.style.display = 'flex'
            throw new Error('Ошибка. Данные получены (статус 200 OK), но они пусты. Причина: ' + data.serverErrorText)
        }

        // вывод времени
        document.querySelector('.time').innerText = `Загружено за: ${data.loadTime} секунд`

        // если корневой путь не задан (первый запрос к серверу), то устанавливается корневой и текущий пути, а также операционная система
        if (defaultPath == "") {
            setDefaultPathAndOS(data.serverData[0].path)
        }

        // вызов функции отрисовки новых путей
        createNewElements(data.serverData)
    } catch (error) {
        console.error('Ошибка запроса:', error)
        throw error
    } finally {
        hideLoading()
    }
};

function setDefaultPathAndOS(path) {
    os = getOperationSystem(path)
    currentPath = defaultPath = getDefaultPath(path)
    setCurrentPathToInput()
}

function showLoading() {
    const loadingDiv = document.querySelector('.loading-data')
    loadingDiv.style.display = 'flex'
}

function hideLoading() {
    const loadingDiv = document.querySelector('.loading-data')
    loadingDiv.style.display = 'none'
}

function getOperationSystem(path) {
    if (path[0] === "/") {
        return LINUX
    }
    else {
        return WINDOWS 
    }
}

function setCurrentPathToInput() {
    let pathInput = document.getElementById('path')
    pathInput.value = currentPath
}

// clearPathList удаляет все пути из списка
function clearPathList() {
    let pathList = document.querySelector('.path-list-section');
    while (pathList.firstChild) {
        pathList.removeChild(pathList.firstChild);
    }
}

// получение имени директории
function getDirName(path) {
    let pathArray = path.split("\\")
    return pathArray[pathArray.length-1]
}

function getDefaultPath(path) {
    let pathArray = path.split("\\")
    if (os == WINDOWS) {
        return pathArray[0] + "/"
    }
    else if (os == LINUX) {
        return "/"
    }
}

// createNewElements отрисовывает полученные с сервера пути в качестве потомков списка
function createNewElements(paths) {
    clearPathList()
    let pathList = document.querySelector('.path-list-section');

    for (let i = 0; i < paths.length; i++) {
        // создание элемента нового пути
        let newPath = document.createElement('div')
        newPath.classList.add('path-list__item')

        // если путь является папкой, добавление соответствующего класса и кликабельности для него
        if (paths[i].type == "Папка") {
            newPath.classList.add('path-list__item_folder')

            newPath.onclick = function () {
                setNewPath(getDirName(paths[i].path))
            }
        }

        // инициализация составляющих информации о пути: название, тип, размер и дату редактирования
        const pathComponents = [
            { text: getDirName(paths[i].path), class: 'path-list__item__component' },
            { text: paths[i].type, class: 'path-list__item__component' },
            { text: paths[i].itemSize, class: 'path-list__item__component' },
            { text: paths[i].editDate, class: 'path-list__item__component' }
        ]

        // отрисовка каждого такого составляющего в качестве потомка соответствующего ему пути
        pathComponents.forEach(element => {
            let newComponent = document.createElement('div')
            newComponent.textContent = element.text
            newComponent.classList.add(element.class)
            newPath.appendChild(newComponent)
        })

        // добавление созданного элемента пути в список
        pathList.appendChild(newPath)
    }
}

// sortTable обрабатывает нажатие кнопки сортировки (определяет порядок)
function sortTable(sortField) {
    const sortOrder = currentSortOrder === ASC ? (currentSortOrder = DESC) : (currentSortOrder = ASC)
    getPaths(sortField, sortOrder, currentPath)
};

// setDefaultPath устанавливает значение текущего пути в стандартный defaultPath
function setDefaultPath() {
    currentPath = defaultPath
    getPaths(defaultSortField, defaultSortOrder, currentPath)
    setCurrentPathToInput()
};

// setPreviousPath устанавливает значение текущего пути на 1 уровень выше
function setPreviousPath() {
    let pathArray = currentPath.split('/')

    // если в Windows путь вида "ДИСК:/dir", то установка "ДИСК:/"
    if (os === WINDOWS && pathArray.length === 2) {
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
};

// setPreviousPath устанавливает значение текущего пути в зависимости от директории, в которую пользователь перешел
function setNewPath(dir) {
    if (currentPath.endsWith("/")) {
        currentPath += dir
    } else {
        currentPath = currentPath + '/' + dir
    }
    
    getPaths(defaultSortField, defaultSortOrder, currentPath)
    setCurrentPathToInput()
};

// setPreviousPath устанавливает значение текущего пути заданному в поиске
function setNewPathByInput() {
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
