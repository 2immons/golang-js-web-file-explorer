const ASC = 'asc'
const DESC = 'desc'

const defaultSortOrder = ASC
const defaultSortField = 'size'

const WINDOWS = "windows"
const LINUX = "linux"

let defaultPath = ''
let os = ''

let globalSortOrder = ASC
let currentPath = ''

// загрузка страницы
document.addEventListener('DOMContentLoaded', async function () {
    // установка операционной системы и корневой директории пользователя
    const userDataURL = `/user-info`
    await getSetDefaultPathAndOS(userDataURL)

    currentPath = defaultPath

    let pathInput = document.getElementById('path')
    pathInput.value = defaultPath
    const url = `/paths?sortField=${encodeURIComponent(defaultSortField)}&sortOrder=${encodeURIComponent(defaultSortOrder)}&path=${encodeURIComponent(currentPath)}`

    await getPaths(url)
});

// setDefaultPathAndOS получает данные об операционной системе и корневой директории пользователя
// и устанавливает соответствующие значения глобальных переменных
async function getSetDefaultPathAndOS(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Ошибка. Данные не получены (статус отличен от 200 OK). Причина:')
        }

        const data = await response.json();

        if (data.serverIsSucceed == false) {
            throw new Error('Ошибка. Данные получены (статус 200 OK), но они пусты. Причина: ' + data.serverErrorText)
        }

        // вывод времени 
        document.querySelector('.time').innerText = `Загружено за: ${data.loadTime} секунд`

        // временно:
        // defaultPath = data.serverData.rootDir

        // определение операционной системы и корневой папки
        os = data.serverData.os
        if (os == WINDOWS) {
            defaultPath = 'F:'
        }
        else if (os == LINUX) {
            defaultPath = '/'
        }
    } catch(error) {
        console.error('Ошибка запроса:', error)
        throw error
    }
}

// getPaths получает данные с сервера и создает элементы на странице
async function getPaths(url) {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        // удаление предыдущих отрисованных путей
        clearPathList()
        
        let errorDiv = document.querySelector('.error-data-not-found')
        
        if (!response.ok) {
            errorDiv.classList.add('error-data-not-found-active')
            throw new Error('Ошибка. Данные не получены (статус отличен от 200 OK). Причина:')
        }
        
        // сокрытие ошибки
        errorDiv.classList.remove('error-data-not-found-active')
        
        const data = await response.json()

        // если внутренний статус с сервера не удовлетворительный, то отображение ошибки
        if (data.serverIsSucceed == false) {
            errorDiv.classList.add('error-data-not-found-active')
            throw new Error('Ошибка. Данные получены (статус 200 OK), но они пусты. Причина: ' + data.serverErrorText)
        }
        
        // вывод времени
        document.querySelector('.time').innerText = `Загружено за: ${data.loadTime} секунд`

        // вызов функции отрисовки новых путей
        createNewElements(data.serverData)
    } catch (error) {
        console.error('Ошибка запроса:', error)
        throw error
    }
};

// clearPathList удаляет все пути из списка
function clearPathList() {
    let itemList = document.querySelector('.path-list-section');
    while (itemList.firstChild) {
        itemList.removeChild(itemList.firstChild);
    }
}

// createNewElements отрисовывает полученные с сервера пути в качестве потомков списка
function createNewElements(paths) {
    clearPathList()

    for (let i = 0; i < paths.length; i++) {
        // создание элемента нового пути
        let newPath = document.createElement('div')
        newPath.classList.add('path-list__item')

        // если путь является папкой, добавление соответствующего класса и кликабельности для него
        if (paths[i].type == "Папка") {
            newPath.classList.add('path-list__item_folder')

            newPath.onclick = function () {
                setNewPath(paths[i].relPath)
            }
        }

        // инициализация составляющих информации о пути: название, тип, размер и дату редактирования
        const pathComponents = [
            { text: paths[i].relPath, class: 'path-list__item__component' },
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
    const sortOrder = globalSortOrder === ASC ? (globalSortOrder = DESC) : (globalSortOrder = ASC)
    const url = `/paths?sortField=${encodeURIComponent(sortField)}&sortOrder=${encodeURIComponent(sortOrder)}&path=${encodeURIComponent(currentPath)}`
    getPaths(url)
};

// setDefaultPath устанавливает значение текущего пути в стандартный defaultPath
function setDefaultPath() {
    currentPath = defaultPath
    const url = `/paths?sortField=${encodeURIComponent(defaultSortField)}&sortOrder=${encodeURIComponent(defaultSortOrder)}&path=${encodeURIComponent(currentPath)}`
    getPaths(url)
    let pathInput = document.getElementById('path')
    pathInput.value = currentPath
};

// setPreviousPath устанавливает значение текущего пути на 1 уровень выше
function setPreviousPath() {
    // получение массива из текущего пути
    let pathInput = document.getElementById('path')
    let pathArray = currentPath.split('/')

    // если в Windows путь вида "ДИСК:", то возврат
    if (os === WINDOWS && pathArray.length < 2) {
        return
    } 
    // если в Linux путь вида "/home", то возврат
    else if (os === LINUX && pathArray.length <= 2) {
        currentPath = "/"
        const url = `/paths?sortField=${encodeURIComponent(defaultSortField)}&sortOrder=${encodeURIComponent(defaultSortOrder)}&path=${encodeURIComponent(currentPath)}`
        getPaths(url)
        pathInput.value = currentPath
        return
    }

    // удаление последнего составляющее пути и соединение его обратно в строку
    pathArray.pop()
    currentPath = pathArray.join('/')

    const url = `/paths?sortField=${encodeURIComponent(defaultSortField)}&sortOrder=${encodeURIComponent(defaultSortOrder)}&path=${encodeURIComponent(currentPath)}`
    getPaths(url)
    pathInput.value = currentPath
};

// setPreviousPath устанавливает значение текущего пути в зависимости от директории, в которую пользователь перешел
function setNewPath(dir) {
    if (currentPath == "/") {
        currentPath += dir
    } else {
        currentPath = currentPath + '/' +dir
    }
    
    const url = `/paths?sortField=${encodeURIComponent(defaultSortField)}&sortOrder=${encodeURIComponent(defaultSortOrder)}&path=${encodeURIComponent(currentPath)}`
    getPaths(url)
    let pathInput = document.getElementById('path')
    pathInput.value = currentPath
};

// setPreviousPath устанавливает значение текущего пути заданному в поиске
function setNewPathByInput() {
    if (event.key === "Enter") {
        let inputValue = document.getElementById("path").value
        // if (inputValue.charAt(inputValue.length - 1) === "/") {
        //     inputValue = inputValue.slice(0, -1)
        // }
        currentPath = inputValue
        const url = `/paths?sortField=${encodeURIComponent(defaultSortField)}&sortOrder=${encodeURIComponent(defaultSortOrder)}&path=${encodeURIComponent(currentPath)}`
        getPaths(url)
        let pathInput = document.getElementById('path')
        pathInput.value = currentPath
    }
};
