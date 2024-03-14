// showError показывает ошибку
function showError() {
    let errorDiv = document.querySelector('.error-data-not-found')
    errorDiv.style.display = 'display'
}

// hideError скрывает ошибку
function hideError() {
    let errorDiv = document.querySelector('.error-data-not-found')
    errorDiv.style.display = 'none'
}

// showLoading отображает загрузку
function showLoading() {
    const loadingDiv = document.querySelector('.loading-data')
    loadingDiv.style.display = 'flex'
}

// hideLoading скрывает отображение загрузки
function hideLoading() {
    const loadingDiv = document.querySelector('.loading-data')
    loadingDiv.style.display = 'none'
}

// clearPathList удаляет все пути из списка
function clearPathList() {
    let pathList = document.querySelector('.path-list-section');
    while (pathList.firstChild) {
        pathList.removeChild(pathList.firstChild);
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
                setNewPath(paths[i].name)
            }
        }

        // инициализация составляющих информации о пути: название, тип, размер и дату редактирования
        const pathComponents = [
            { text: paths[i].name, class: 'path-list__item__component' },
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

// setCurrentPathToInput обновляет поле ввода директории под текущий путь
function setCurrentPathToInput(currentPath) {
    let pathInput = document.getElementById('path')
    pathInput.value = currentPath
}

export default {createNewElements, hideError, hideLoading, showError, showLoading, clearPathList, setCurrentPathToInput}