import Controller from './controller.js';
import Chart, { TimeScale } from 'chart.js/auto';

type Nodes = {
    name: string;
    path: string;
    type: string;
    itemSize: string;
    editDate: string;
};

type ChartData = {
    id: number;
    load_time_seconds: number;
    root_path: string;
    total_size: number;
};

class View {
    private controller: Controller;
    
    private nodeList: HTMLElement | null = document.querySelector('.node-list-section');
    private errorDiv: HTMLElement | null = document.querySelector('.error-data-not-found');
    private loadingDiv: HTMLElement | null = document.querySelector('.loading-data');
    private pathInput = document.getElementById('path') as HTMLInputElement;

    private nodeSection: HTMLElement | null = document.querySelector('.workspace');
    private statButtonGraphic: HTMLElement | null = document.getElementById("stat-button-graphic");
    private backToDirsButton: HTMLElement | null = document.getElementById("stat-button-graphic-back");

    private chartWrapper: HTMLElement | null = document.querySelector('.chart');
    private chartCanvas: HTMLCanvasElement | null = document.getElementById('chart') as HTMLCanvasElement | null;
    private chartItem: Chart | null = null;

    constructor(controller: Controller) {
        this.controller = controller;
    }

    // создание и отрисовка графика
    createAndDisplayChart(data: ChartData[]): void { 
        if (this.chartCanvas !== null){
            // сортировка данных перед созданием графика
            data.sort(this.compareLoadTime);

            // извлечение значений времени и объема данных для графика
            const loadTimesSeconds = data.map(row => row.load_time_seconds);
            const totalSizesMb = data.map(row => row.total_size / 1024 / 1024); // получение примерного количества Мбайтов

            // создание графика с правильными метками и данными
            this.chartItem = new Chart(this.chartCanvas, {
                type: 'line',
                data: {
                    labels: loadTimesSeconds,
                    datasets: [{
                        label: 'Объем данных',
                        data: totalSizesMb,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: "Объем (Мб)"
                            },
                            beginAtZero: true,
                            stacked: true
                        },
                        x: {
                            title: {
                                display: true,
                                text: "Время (с)"
                            }
                        }
                    }
                }
            });

            this.chartCanvas.style.display = "flex";
            if (this.chartWrapper) {
                this.chartWrapper.style.display = "flex";
            }
        }
    }

    // displayNodes отрисовывает полученные с сервера пути в качестве потомков списка
    displayNodes(nodes: Nodes[]): void {
        this.removeNodes();

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

    // метод для сравнения данных статистики по времени
    compareLoadTime(a: ChartData, b: ChartData): number {
        if ( a.load_time_seconds < b.load_time_seconds ){
          return -1;
        }
        if ( a.load_time_seconds > b.load_time_seconds ){
          return 1;
        }
        return 0;
    }

    // отображает время загрузки
    showLoadingTime(time: number): void {
        const timeElement = document.querySelector('.time');
        if (timeElement) {
            timeElement.textContent = `Загружено за: ${time} секунд`;
        }
    }

    // устанавливает текущий путь в интерфейс поля ввода пути
    setCurrentPathToInput(path: string): void {
        if (this.pathInput) {
            this.pathInput.value = path;
        }
    }

    // удалить созданный график, скрыть его и отобразить директории
    destroyChartAndShowNodeSection(): void {
        if (this.chartItem)
            this.chartItem.destroy()
        if (this.nodeSection && this.chartWrapper) {
            this.chartWrapper.style.display = "none"
            this.nodeSection.style.display = ""
        }
    }

    // удаляет все пути из списка
    removeNodes(): void {
        if (this.nodeList) {
            while (this.nodeList.firstChild) {
                this.nodeList.removeChild(this.nodeList.firstChild);
            }
        }
    }

    // СОКРЫТИЕ, ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ПОЛЬЗОВАТЕЛЬСКОГО ИНТЕРФЕЙСА:

    // сокрытие секции с директориями
    hideNodeSection(): void {
        if (this.nodeSection)
            this.nodeSection.style.display = "none"
    }

    // появление кнопки возвращающей к директориям
    showBackButton(): void {
        if (this.backToDirsButton)
            this.backToDirsButton.style.display = "inline-block"
    }

    // сокрытие кнопки возвращающей к директориям
    hideBackButton(): void {
        if (this.backToDirsButton) {
            this.backToDirsButton.style.display = "none"
        }
    }

    // появление кнопки включающей отображение графика
    showGraphicButton(): void {
        if (this.statButtonGraphic) {
            this.statButtonGraphic.style.display = "inline-block"
        }
    }

    // сокрытие кнопки включающей отображение графика
    hideGraphicButton(): void {
        if (this.statButtonGraphic)
            this.statButtonGraphic.style.display = "none"
    }

    // появление ошибки загрузки
    showError(): void {
        if (this.errorDiv) {
            this.errorDiv.style.display = 'flex';
        }
    }

    // сокрытие ошибки загрузки
    hideError(): void {
        if (this.errorDiv) {
            this.errorDiv.style.display = 'none';
        }
    }

    // появление сообщения "загрузка данных"
    showLoading(): void {
        if (this.loadingDiv) {
            this.loadingDiv.style.display = 'flex';
        }
    }

    // сокрытие сообщения "загрузка данных"
    hideLoading(): void {
        if (this.loadingDiv) {
            this.loadingDiv.style.display = 'none';
        }
    }
}

export default View;
