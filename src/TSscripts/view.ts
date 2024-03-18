import Controller from './controller.js';

type Nodes = {
    name: string;
    path: string;
    type: string;
    itemSize: string;
    editDate: string;
};

class View {
    private controller: Controller;
    private nodeList: HTMLElement | null = document.querySelector('.node-list-section');
    private errorDiv: HTMLElement | null = document.querySelector('.error-data-not-found');
    private loadingDiv: HTMLElement | null = document.querySelector('.loading-data');
    private pathInput = document.getElementById('path') as HTMLInputElement;
    private tableContainer = document.getElementById('table-container') as HTMLInputElement;

    constructor(controller: Controller) {
        this.controller = controller;
    }

    // clearNodes удаляет все пути из списка
    clearNodes(): void {
        if (this.nodeList) {
            while (this.nodeList.firstChild) {
                this.nodeList.removeChild(this.nodeList.firstChild);
            }
        }
    }

    displayStatTable(data: string) {
        if (this.tableContainer) {
            this.tableContainer.innerHTML = data;
        }
    }

    // displayNodes отрисовывает полученные с сервера пути в качестве потомков списка
    displayNodes(nodes: Nodes[]): void {
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
                const nodeComponents: { text: string; class: string }[] = [
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

    setLoadingTime(time: number): void {
        const timeElement = document.querySelector('.time');
        if (timeElement) {
            timeElement.textContent = `Загружено за: ${time} секунд`;
        }
    }

    showError(): void {
        if (this.errorDiv) {
            this.errorDiv.style.display = 'display';
        }
    }

    hideError(): void {
        if (this.errorDiv) {
            this.errorDiv.style.display = 'none';
        }
    }

    showLoading(): void {
        if (this.loadingDiv) {
            this.loadingDiv.style.display = 'flex';
        }
    }

    hideLoading(): void {
        if (this.loadingDiv) {
            this.loadingDiv.style.display = 'none';
        }
    }

    setCurrentPathToInput(path: string): void {
        if (this.pathInput) {
            this.pathInput.value = path;
        }
    }
}

export default View;
