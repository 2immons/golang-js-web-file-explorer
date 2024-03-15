// view.js
class View {
    constructor(controller) {
        this.controller = controller;
    }

    // clearPathList удаляет все пути из списка
    clearNodes() {
        let pathList = document.querySelector('.path-list-section');
        while (pathList.firstChild) {
            pathList.removeChild(pathList.firstChild);
        }
    }

    // createNewElements отрисовывает полученные с сервера пути в качестве потомков списка
    displayNodes(nodes) {
        this.clearNodes()
        let pathList = document.querySelector('.path-list-section');

        for (let i = 0; i < nodes.length; i++) {
            // создание элемента нового пути
            let newNode = document.createElement('div')
            newNode.classList.add('path-list__item')
            newNode.addEventListener("click", () => this.controller.handleNodeClick(newNode))

            // если путь является папкой, добавление соответствующего класса и кликабельности для него
            if (nodes[i].type == "Папка") {
                newNode.classList.add('path-list__item_folder')
            }

            // инициализация составляющих информации о пути: название, тип, размер и дату редактирования
            const pathComponents = [
                { text: nodes[i].name, class: 'path-list__item__component' },
                { text: nodes[i].type, class: 'path-list__item__component' },
                { text: nodes[i].itemSize, class: 'path-list__item__component' },
                { text: nodes[i].editDate, class: 'path-list__item__component' }
            ]

            // отрисовка каждого такого составляющего в качестве потомка соответствующего ему пути
            pathComponents.forEach(element => {
                let newComponent = document.createElement('div')
                newComponent.textContent = element.text
                newComponent.classList.add(element.class)
                newNode.appendChild(newComponent)
            })

            // добавление созданного элемента пути в список
            pathList.appendChild(newNode)
        }
    }

    setLoadingTime(time) {
        document.querySelector('.time').innerText = `Загружено за: ${time} секунд`
    }

    showError() {
        let errorDiv = document.querySelector('.error-data-not-found')
        errorDiv.style.display = 'display'
    }

    hideError() {
        let errorDiv = document.querySelector('.error-data-not-found')
        errorDiv.style.display = 'none'
    }

    showLoading() {
        const loadingDiv = document.querySelector('.loading-data')
        loadingDiv.style.display = 'flex'
    }

    hideLoading() {
        const loadingDiv = document.querySelector('.loading-data')
        loadingDiv.style.display = 'none'
    }

    setCurrentPathToInput(path) {
        let pathInput = document.getElementById('path')
        pathInput.value = path
    }
}

export default View;