class View {
    constructor(controller) {
        this.nodeList = document.querySelector('.node-list-section');
        this.errorDiv = document.querySelector('.error-data-not-found');
        this.loadingDiv = document.querySelector('.loading-data');
        this.pathInput = document.getElementById('path');
        this.controller = controller;
    }
    // clearNodes удаляет все пути из списка
    clearNodes() {
        if (this.nodeList) {
            while (this.nodeList.firstChild) {
                this.nodeList.removeChild(this.nodeList.firstChild);
            }
        }
    }
    // displayNodes отрисовывает полученные с сервера пути в качестве потомков списка
    displayNodes(nodes) {
        this.clearNodes();
        if (this.nodeList) {
            nodes.forEach(node => {
                let newNode = document.createElement('div');
                newNode.classList.add('node-list__item');
                // если узел является папкой, добавление соответствующего класса и кликабельности для него
                if (node.type === "Папка" && newNode) {
                    newNode.classList.add('node-list__item_folder');
                    newNode.addEventListener("click", () => this.controller.handleNodeClick(newNode));
                }
                // инициализация составляющих информации о пути: название, тип, размер и дату редактирования
                const nodeComponents = [
                    { text: node.name, class: 'node-list__item__component' },
                    { text: node.type, class: 'node-list__item__component' },
                    { text: node.itemSize, class: 'node-list__item__component' },
                    { text: node.editDate, class: 'node-list__item__component' }
                ];
                // отрисовка каждого такого составляющего в качестве потомка соответствующего ему пути
                nodeComponents.forEach(element => {
                    let newComponent = document.createElement('div');
                    newComponent.textContent = element.text;
                    newComponent.classList.add(element.class);
                    if (newNode) {
                        newNode.appendChild(newComponent);
                    }
                });
                // добавление созданного элемента пути в список
                if (this.nodeList && newNode) {
                    this.nodeList.appendChild(newNode);
                }
            });
        }
    }
    setLoadingTime(time) {
        const timeElement = document.querySelector('.time');
        if (timeElement) {
            timeElement.textContent = `Загружено за: ${time} секунд`;
        }
    }
    showError() {
        if (this.errorDiv) {
            this.errorDiv.style.display = 'display';
        }
    }
    hideError() {
        if (this.errorDiv) {
            this.errorDiv.style.display = 'none';
        }
    }
    showLoading() {
        if (this.loadingDiv) {
            this.loadingDiv.style.display = 'flex';
        }
    }
    hideLoading() {
        if (this.loadingDiv) {
            this.loadingDiv.style.display = 'none';
        }
    }
    setCurrentPathToInput(path) {
        if (this.pathInput) {
            this.pathInput.value = path;
        }
    }
}
export default View;
