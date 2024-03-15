// view.js
class View {
    constructor(controller) {
        this.controller = controller
        this.nodeList = document.querySelector('.node-list-section')
        this.errorDiv = document.querySelector('.error-data-not-found')
        this.loadingDiv = document.querySelector('.loading-data')
        this.pathInput = document.getElementById('path')
    }

    // clearPathList удаляет все пути из списка
    clearNodes() {
        while (this.nodeList.firstChild) {
            this.nodeList.removeChild(this.nodeList.firstChild);
        }
    }

    // createNewElements отрисовывает полученные с сервера пути в качестве потомков списка
    displayNodes(nodes) {
        this.clearNodes()

        nodes.forEach(node => {
            let newNode = document.createElement('div')
            newNode.classList.add('node-list__item')

            // если узел является папкой, добавление соответствующего класса и кликабельности для него
            if (node.type == "Папка") {
                newNode.classList.add('node-list__item_folder')
                newNode.addEventListener("click", () => this.controller.handleNodeClick(newNode))
            }

            // инициализация составляющих информации о пути: название, тип, размер и дату редактирования
            const nodeComponents = [
                { text: node.name, class: 'node-list__item__component' },
                { text: node.type, class: 'node-list__item__component' },
                { text: node.itemSize, class: 'node-list__item__component' },
                { text: node.editDate, class: 'node-list__item__component' }
            ]

            // отрисовка каждого такого составляющего в качестве потомка соответствующего ему пути
            nodeComponents.forEach(element => {
                let newComponent = document.createElement('div')
                newComponent.textContent = element.text
                newComponent.classList.add(element.class)
                newNode.appendChild(newComponent)
            })

            // добавление созданного элемента пути в список
            this.nodeList.appendChild(newNode)
        })
    }

    setLoadingTime(time) {
        document.querySelector('.time').innerText = `Загружено за: ${time} секунд`
    }

    showError() {
        this.errorDiv.style.display = 'display'
    }

    hideError() {
        this.errorDiv.style.display = 'none'
    }

    showLoading() {
        this.loadingDiv.style.display = 'flex'
    }

    hideLoading() {
        this.loadingDiv.style.display = 'none'
    }

    setCurrentPathToInput(path) {
        this.pathInput.value = path
    }
}

export default View;