// controller.js
import Model from './model.js';
import View from './view.js';

class Controller {
    constructor() {
        this.model = new Model();
        this.view = new View(this);
    }

    // иницииализация приложения
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
                    this.calculateAndSetRootPath(data.nodes[0].path)
                }
                this.view.setCurrentPathToInput(this.currentPath)
            })
            .catch(error => {
                console.log(error)
                this.view.hideLoading()
                this.view.showError()
            })
    }

    // calculateRootPath рассчитывает и устанавливает корневую директорию
    calculateAndSetRootPath(path) {
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

    // вызывает метод загрузки данных с обновленным порядком сортировки и по заданному кнопкой сортировки полю
    handleSortButtonClick(sortField) {
        this.currentSortOrder === this.ASC ? (this.currentSortOrder = this.DESC) : (this.currentSortOrder = this.ASC)
        this.loadData(sortField, this.currentSortOrder, this.currentPath)
    }

    // обновляет текущий путь в зависимости от директории, в которую пользователь хочет перейти,
    // и вызывает метод загрузки данных
    handleNodeClick(node) {
        let dirName = node.firstElementChild.textContent
        if (this.currentPath.endsWith("/"))
            this.currentPath += dirName
        else
            this.currentPath = this.currentPath + "/" + dirName
        this.view.setCurrentPathToInput(this.currentPath)
        this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath)
    }

    // устанавливает текущий путь равным корневому и вызывает метод загрузки данных
    handleHomeButtonClick() {
        if (this.currentPath === this.rootPath) {
            return
        }
        this.view.setCurrentPathToInput(this.rootPath)
        this.loadData(this.defaultSortField, this.defaultSortOrder, this.rootPath)
    }

    // устанавливает текущий путь на 1 уровень выше и вызывает метод загрузки данных
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

    // устанавливает текущий путь равным введенному пользователю значению
    handlePathInputKeyPress(event) {
        if (event.key === "Enter") {
            let inputValue = this.pathInput.value;
            this.currentPath = inputValue
            this.view.setCurrentPathToInput(this.currentPath)
            this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath)
        }
    }
}

export default Controller;
