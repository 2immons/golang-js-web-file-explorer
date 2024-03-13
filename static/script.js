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
        let errorDiv = document.querySelector('.error-data-not-found')
        if (!response.ok) {
            let itemList = document.querySelector('.list-section')
            while (itemList.firstChild) {
                itemList.removeChild(itemList.firstChild)
            }
            errorDiv.classList.add('error-data-not-found-active')
            throw new Error('Ошибка запроса')
        }
        errorDiv.classList.remove('error-data-not-found-active')
        return response.json()
    })
    .then(data => {
        console.log(data)
        if (data.serverStatus == false) {
            console.log(data.serverErrorText)
            let errorDiv = document.querySelector('.error-data-not-found')
            errorDiv.classList.add('error-data-not-found-active')
        }
        document.querySelector('.time').innerText = `Загружено за: ${data.loadTime} секунд`

        createNewElements(data.serverData)
    })
    .catch(error => {
        console.error('Ошибка запроса:', error)
    })
};

function createNewElements(data) {
    let pathList = document.querySelector('.list-section')

        while (pathList.firstChild) {
            pathList.removeChild(pathList.firstChild)
        }

        for (let i = 0; i < data.length; i++) {
            let newPath = document.createElement('div')
            newPath.classList.add('item-list')
            if (data[i].type == "Папка") {
                newPath.classList.add('item-list-folder')

                newPath.onclick = function () {
                    setNewPath(data[i].relPath)
                }
            }

            const pathComponents = [
                { text: data[i].relPath, class: 'path-component' },
                { text: data[i].type, class: 'path-component' },
                { text: data[i].itemSize, class: 'path-component' },
                { text: data[i].editDate, class: 'path-component' }
            ]

            pathComponents.forEach(element => {
                let newComponent = document.createElement('div')
                newComponent.textContent = element.text
                newComponent.classList.add(element.class)
                newPath.appendChild(newComponent)
            })

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
            inputValue = inputValue.slice(0, -1);
        }
        currentPath = inputValue
        const url = `/paths?sortField=${encodeURIComponent(defaultSortField)}&sortOrder=${encodeURIComponent(defaultSortOrder)}&path=${encodeURIComponent(currentPath)}`
        getPaths(url)
        let pathInput = document.getElementById('path')
        pathInput.value = currentPath
    }
};
