const ASC = 'asc'
const DESC = 'desc'

const defaultSortOrder = ASC
const defaultSortField = 'size'
const defaultPath = 'D:/Git Reps'

let globalSortOrder = ASC
let currentPath = defaultPath

// загрузка страницы
document.addEventListener('DOMContentLoaded', function () {
    let pathInput = document.getElementById('path')
    pathInput.value = defaultPath

    const url = `/paths?sortField=${encodeURIComponent(defaultSortField)}&sortOrder=${encodeURIComponent(defaultSortOrder)}&path=${encodeURIComponent(currentPath)}`

    getPaths(url)
});

// getPaths получает данные с сервера и создает элементы на странице
function getPaths(url) {
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        // нахождение элемента, отобращающий ошибки
        let errorDiv = document.querySelector('.error-data-not-found')
        if (!response.ok) {
            console.log(2)
            // удаление всех ранее отрисованных путей (потомков списка)
            let itemList = document.querySelector('.list-section')
            while (itemList.firstChild) {
                itemList.removeChild(itemList.firstChild)
            }
            // вывод ошибки
            errorDiv.classList.add('error-data-not-found-active')
            throw new Error('Ошибка. Данные не получены (статус отличен от 200 OK). Причина:')
        }
        // сокрытие ошибки
        errorDiv.classList.remove('error-data-not-found-active')
        return response.json()
    })
    .then(data => {
        // если статус с сервера не удовлетворительный, то вывод ошибки
        if (data.serverStatus == false) {
            console.log(data.serverErrorText)
            let errorDiv = document.querySelector('.error-data-not-found')
            errorDiv.classList.add('error-data-not-found-active')
            throw new Error('Ошибка. Данные получены (статус 200 OK), но они пусты. Причина:')
        }
        // вывод времени
        document.querySelector('.time').innerText = `Загружено за: ${data.loadTime} секунд`

        // вызов функции отрисовки путей
        createNewElements(data.serverData)
    })
    .catch(error => {
        console.error('Ошибка запроса:', error)
    })
};

// createNewElements отрисовывает полученные с сервера пути в качестве потомков списка
function createNewElements(data) {
    let pathList = document.querySelector('.list-section')

        while (pathList.firstChild) {
            pathList.removeChild(pathList.firstChild)
        }

        for (let i = 0; i < data.length; i++) {
            // создаем элемент нового пути
            let newPath = document.createElement('div')
            newPath.classList.add('item-list')

            // если путь является папкой, добавляем соответствующий класс и возможность нажать на него
            if (data[i].type == "Папка") {
                newPath.classList.add('item-list-folder')

                newPath.onclick = function () {
                    setNewPath(data[i].relPath)
                }
            }

            // инициализируем составляющие информации о путе: название, тип, размер и дату редактирования
            const pathComponents = [
                { text: data[i].relPath, class: 'path-component' },
                { text: data[i].type, class: 'path-component' },
                { text: data[i].itemSize, class: 'path-component' },
                { text: data[i].editDate, class: 'path-component' }
            ]

            // для каждого такого составляющего отрисовываем его в качестве потомка пути, которому они принадлежат
            pathComponents.forEach(element => {
                let newComponent = document.createElement('div')
                newComponent.textContent = element.text
                newComponent.classList.add(element.class)
                newPath.appendChild(newComponent)
            })

            // добавляем созданный элемент пути в список
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
    let pathArray = currentPath.split('/')
    pathArray.pop()
    currentPath = pathArray.join('/')
    const url = `/paths?sortField=${encodeURIComponent(defaultSortField)}&sortOrder=${encodeURIComponent(defaultSortOrder)}&path=${encodeURIComponent(currentPath)}`
    getPaths(url)
    let pathInput = document.getElementById('path')
    pathInput.value = currentPath
};

// setPreviousPath устанавливает значение текущего пути в зависимости от директории, в которую пользователь перешел
function setNewPath(dir) {
    currentPath = currentPath + '/' +dir
    const url = `/paths?sortField=${encodeURIComponent(defaultSortField)}&sortOrder=${encodeURIComponent(defaultSortOrder)}&path=${encodeURIComponent(currentPath)}`
    getPaths(url)
    let pathInput = document.getElementById('path')
    pathInput.value = currentPath
};

// setPreviousPath устанавливает значение текущего пути заданному в поиске
function setNewPathByInput() {
    if (event.key === "Enter") {
        let inputValue = document.getElementById("path").value
        if (inputValue.charAt(inputValue.length - 1) === "/") {
            inputValue = inputValue.slice(0, -1)
        }
        currentPath = inputValue
        const url = `/paths?sortField=${encodeURIComponent(defaultSortField)}&sortOrder=${encodeURIComponent(defaultSortOrder)}&path=${encodeURIComponent(currentPath)}`
        getPaths(url)
        let pathInput = document.getElementById('path')
        pathInput.value = currentPath
    }
};
