// controller.js
import Model from './model.js';
import View from './view.js';

class Controller {
    constructor() {
        this.model = new Model();
        this.view = new View(this);
    }

    init() {
        this.ASC = 'asc'
        this.DESC = 'desc'

        this.NAME = "name"
        this.TYPE = "type"
        this.DATE = "date"
        this.SIZE = "size"

        this.defaultSortOrder = this.ASC
        this.defaultSortField = 'size'

        this.rootPath = ""

        this.currentSortOrder = this.ASC
        this.currentPath = ''

        this.backButton = document.getElementById("back-button")
        this.homeButton = document.getElementById("home-button")
        this.sortByNameButton = document.getElementById("sort-button-name")
        this.sortByTypeButton = document.getElementById("sort-button-type")
        this.sortBySizeButton = document.getElementById("sort-button-size")
        this.sortByDateButton = document.getElementById("sort-button-date")
        this.pathInput = document.getElementById("path")

        this.loadData(this.defaultSortField, this.defaultSortOrder, this.rootPath)
        this.initEventListeners()
    }

    async loadData(sortField, sortOrder, path) {
        this.view.clearNodes()
        this.view.showLoading()
        this.model.fetchNodes(sortField, sortOrder, path)
            .then(data => {
                this.view.hideLoading()
                this.view.setLoadingTime(data.loadTime)
                this.view.displayNodes(data.nodes)
                if (path == "") {
                    this.calculateRootPath(data.nodes[0].path)
                }
                this.view.setCurrentPathToInput(this.currentPath)
            })
            .catch(error => {
                console.log(error)
                this.view.hideLoading()
                this.view.showError()
            })
    }

    calculateRootPath(path) {
        if (path[0] == "/") {
            this.currentPath = this.rootPath = "/"
            this.view.setCurrentPathToInput(this.currentPath)
            return
        }
        let pathArray = path.split("\\")
        this.currentPath = this.rootPath = pathArray[0] + "/"
        this.view.setCurrentPathToInput(this.currentPath)
        return
    }

    initEventListeners() {
        this.backButton.addEventListener("click", () => this.handleBackButtonClick())
        this.homeButton.addEventListener("click", () => this.handleHomeButtonClick())
        this.pathInput.addEventListener("keyup", (event) => this.handlePathInputKeyPress(event))

        this.sortByNameButton.addEventListener("click", () => this.handleSortButtonClick(this.NAME))
        this.sortByTypeButton.addEventListener("click", () => this.handleSortButtonClick(this.TYPE))
        this.sortBySizeButton.addEventListener("click", () => this.handleSortButtonClick(this.SIZE))
        this.sortByDateButton.addEventListener("click", () => this.handleSortButtonClick(this.DATE))
    }

    handleSortButtonClick(sortField) {
        this.currentSortOrder === this.ASC ? (this.currentSortOrder = this.DESC) : (this.currentSortOrder = this.ASC)
        this.loadData(sortField, this.currentSortOrder, this.currentPath)
    }

    handleNodeClick(node) {
        let dirName = node.firstElementChild.textContent
        if (this.currentPath.endsWith("/"))
            this.currentPath += dirName
        else
            this.currentPath = this.currentPath + "/" + dirName
        this.view.setCurrentPathToInput(this.currentPath)
        this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath)
    }

    handleHomeButtonClick() {
        if (this.currentPath === this.rootPath) {
            return
        }
        this.view.setCurrentPathToInput(this.rootPath)
        this.loadData(this.defaultSortField, this.defaultSortOrder, this.rootPath)
    }

    handleBackButtonClick() { // TODO: переделать условия
        let pathArray = this.currentPath.split('/')
        // если путь вида "dir" ('/'), то возврат
        if (this.currentPath.length <= 1) {
            return
        }
        // если путь вида "ДИСК:/", то возврат 
        else if (pathArray.length < 2 || pathArray[1] == "") {
            return
        }
        // если в путь вида "ДИСК:/dir", то установка "ДИСК:/" 
        else if (pathArray.length === 2) {
            this.currentPath = pathArray[0] + "/"
            this.view.setCurrentPathToInput(this.currentPath)
            this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath)
            return
        } 
        // во всех других случаях
        else {
            pathArray.pop()
            this.currentPath = pathArray.join("/")
            this.view.setCurrentPathToInput(this.currentPath)
            this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath)
        }
        this.view.setCurrentPathToInput(this.currentPath)
    }

    handlePathInputKeyPress(event) {
        if (event.key === "Enter") {
            let inputValue = this.pathInput.value;
            this.currentPath = inputValue
            this.view.setCurrentPathToInput(this.currentPath)
            this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath)
        }
    }

    handleAddButtonClick() {
        // реализация обработчика нажатия кнопки "добавить"
    }

    // другие методы для обработки действий пользователя
}

export default Controller;



// import view from "./view.js"

// // sortTable обрабатывает нажатие кнопки сортировки (определяет порядок)
// function sortTable(sortField) {
//     const sortOrder = currentSortOrder === ASC ? (currentSortOrder = DESC) : (currentSortOrder = ASC)
//     getPaths(sortField, sortOrder, currentPath)
// };

// // устанавливает значение текущего пути на 1 уровень выше
// let backButton = document.getElementById("back-button")
// backButton.addEventListener("onclick", function () {
//     let pathArray = currentPath.split('/')

//     // если путь вида "dir" ('/'), то установка возврат
//     if (currentPath.length <= 1) {
//         return
//     // если в Windows путь вида "ДИСК:/dir", то установка "ДИСК:/"
//     } else if (os === WINDOWS && pathArray.length === 2) {
//         currentPath = pathArray[0] + "/"
//         getPaths(defaultSortField, defaultSortOrder, currentPath)
//         setCurrentPathToInput()
//         return
//     } 
//     // если в Windows путь вида "ДИСК:/", то возврат
//     else if (os === WINDOWS && pathArray.length < 2) {
//         return
//     }
//     // если в Linux путь вида "/home", то возврат
//     else if (os === LINUX && pathArray.length <= 2) {
//         currentPath = "/"
//         getPaths(defaultSortField, defaultSortOrder, currentPath)
//         setCurrentPathToInput()
//         return
//     }

//     // удаление последнего составляющее пути и соединение его обратно в строку
//     pathArray.pop()
//     currentPath = pathArray.join('/')

//     getPaths(defaultSortField, defaultSortOrder, currentPath)
//     setCurrentPathToInput()   
// });

// document.addEventListener("click", function() {
//     let nodesParts = document.querySelectorAll('.path-list__item__component');

//     nodesParts.forEach(function(nodePart) {
//         nodePart.addEventListener("click", function() {
//             // Получаем родителя элемента
//             var fileSystemNode = nodePart.parentNode;
//             var firstChildNodePart = fileSystemNode.firstElementChild;
            
//             setNewPath(firstChildNodePart.innerText)
//         });
//     });
// });

       
// // setPreviousPath устанавливает значение текущего пути в зависимости от директории, в которую пользователь перешел
// function setNewPath(dir) {
//     console.log(currentPath)
//     if (currentPath.endsWith("/")) {
//         currentPath += dir
//     } else {
//         currentPath = currentPath + '/' + dir
//     }
    
//     Model.getPaths(defaultSortField, defaultSortOrder, currentPath)
//     View.setCurrentPathToInput()
// };

// // setPreviousPath устанавливает значение текущего пути заданному в поиске
// function setNewPathByInput(event) {
//     if (event.key === "Enter") {
//         let inputValue = document.getElementById("path").value

//         // TODO: проверка на валидность пути через регулярные выражения?
//         // if (inputValue.charAt(inputValue.length - 1) === "/") {
//         //     inputValue = inputValue.slice(0, -1)
//         // }

//         currentPath = inputValue
//         getPaths(defaultSortField, defaultSortOrder, currentPath)
//         setCurrentPathToInput()
//     }
// };

// export default {sortTable, setPreviousPath, setNewPath, setNewPathByInput}