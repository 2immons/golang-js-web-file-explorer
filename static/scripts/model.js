import View from "./view.js"
import Controller from "./controller.js"

const ASC = 'asc'
const DESC = 'desc'

const defaultSortOrder = ASC
const defaultSortField = 'size'

let rootPath = ""
let os = ""

let currentSortOrder = ASC
let currentPath = ''

// загрузка страницы
document.addEventListener('DOMContentLoaded', async function () {
    await getPaths(defaultSortField, defaultSortOrder, rootPath)    
});


// getPaths получает данные с сервера и создает элементы на странице
async function getPaths(sortField, sortOrder, path) {
    // сокрытие ошибки "нет данных"
    View.hideError()

    // очистка списка путей
    View.clearPathList()
    View.showLoading()
    const url = `/paths?sortField=${encodeURIComponent(sortField)}&sortOrder=${encodeURIComponent(sortOrder)}&path=${encodeURIComponent(path)}`
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
        if (!response.ok) {
            View.showError()
            throw new Error('Ошибка. Данные не получены (статус отличен от 200 OK). Причина:')
        }
        
        const data = await response.json()
        console.log(data)

        // если внутренний статус с сервера не удовлетворительный, то отображение ошибки
        if (data.serverIsSucceed == false) {
            View.showError()
            throw new Error('Ошибка. Данные получены (статус 200 OK), но они пусты. Причина: ' + data.serverErrorText)
        }

        // вывод времени
        document.querySelector('.time').innerText = `Загружено за: ${data.loadTime} секунд`

        // если корневой путь не задан (первый запрос к серверу), то устанавливается корневой и текущий пути, а также операционная система
        if (rootPath == "") {
            currentPath = rootPath = getRootPath(data.serverData[0].path)
            View.setCurrentPathToInput(currentPath)
        }

        // вызов функции отрисовки новых путей
        View.createNewElements(data.serverData)
    } catch (error) {
        console.error('Ошибка запроса:', error)
        throw error
    } finally {
        View.hideLoading()
    }
};

// getDefaultPath получает корневой путь с помощью абсолютного пути
// TODO заменить
function getRootPath(path) {
    let pathArray = path.split("\\")
    if (true) {
        return pathArray[0] + "/"
    }
    else if (false) {
        return "/"
    }
}
