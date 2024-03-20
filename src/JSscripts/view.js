import Chart from 'chart.js/auto';
class View {
    constructor(controller) {
        this.nodeList = document.querySelector('.node-list-section');
        this.errorDiv = document.querySelector('.error-data-not-found');
        this.loadingDiv = document.querySelector('.loading-data');
        this.pathInput = document.getElementById('path');
        this.nodeSection = document.querySelector('.workspace');
        this.statButtonGraphic = document.getElementById("stat-button-graphic");
        this.backToDirsButton = document.getElementById("stat-button-graphic-back");
        this.chartWrapper = document.querySelector('.chart');
        this.chartCanvas = document.getElementById('chart');
        this.chartItem = null;
        this.controller = controller;
    }
    // создание и отрисовка графика
    createAndDisplayChart(data) {
        if (this.chartCanvas !== null) {
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
    displayNodes(nodes) {
        this.removeNodes();
        if (this.nodeList) {
            nodes.forEach(node => {
                let newNode = document.createElement('div');
                newNode.classList.add('node-list__item');
                // если узел является папкой, добавление соответствующего класса и кликабельности для него
                if (node.type === "Каталог" && newNode) {
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
    // метод для сравнения данных статистики по времени
    compareLoadTime(a, b) {
        if (a.load_time_seconds < b.load_time_seconds) {
            return -1;
        }
        if (a.load_time_seconds > b.load_time_seconds) {
            return 1;
        }
        return 0;
    }
    // отображает время загрузки
    showLoadingTime(time) {
        const timeElement = document.querySelector('.time');
        if (timeElement) {
            timeElement.textContent = `Загружено за: ${time} секунд`;
        }
    }
    // устанавливает текущий путь в интерфейс поля ввода пути
    setCurrentPathToInput(path) {
        if (this.pathInput) {
            this.pathInput.value = path;
        }
    }
    // удалить созданный график, скрыть его и отобразить директории
    destroyChartAndShowNodeSection() {
        if (this.chartItem)
            this.chartItem.destroy();
        if (this.nodeSection && this.chartWrapper) {
            this.chartWrapper.style.display = "none";
            this.nodeSection.style.display = "";
        }
    }
    // удаляет все пути из списка
    removeNodes() {
        if (this.nodeList) {
            while (this.nodeList.firstChild) {
                this.nodeList.removeChild(this.nodeList.firstChild);
            }
        }
    }
    // СОКРЫТИЕ, ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ПОЛЬЗОВАТЕЛЬСКОГО ИНТЕРФЕЙСА:
    // сокрытие секции с директориями
    hideNodeSection() {
        if (this.nodeSection)
            this.nodeSection.style.display = "none";
    }
    // появление кнопки возвращающей к директориям
    showBackButton() {
        if (this.backToDirsButton)
            this.backToDirsButton.style.display = "inline-block";
    }
    // сокрытие кнопки возвращающей к директориям
    hideBackButton() {
        if (this.backToDirsButton) {
            this.backToDirsButton.style.display = "none";
        }
    }
    // появление кнопки включающей отображение графика
    showGraphicButton() {
        if (this.statButtonGraphic) {
            this.statButtonGraphic.style.display = "inline-block";
        }
    }
    // сокрытие кнопки включающей отображение графика
    hideGraphicButton() {
        if (this.statButtonGraphic)
            this.statButtonGraphic.style.display = "none";
    }
    // появление ошибки загрузки
    showError() {
        if (this.errorDiv) {
            this.errorDiv.style.display = 'flex';
        }
    }
    // сокрытие ошибки загрузки
    hideError() {
        if (this.errorDiv) {
            this.errorDiv.style.display = 'none';
        }
    }
    // появление сообщения "загрузка данных"
    showLoading() {
        if (this.loadingDiv) {
            this.loadingDiv.style.display = 'flex';
        }
    }
    // сокрытие сообщения "загрузка данных"
    hideLoading() {
        if (this.loadingDiv) {
            this.loadingDiv.style.display = 'none';
        }
    }
}
export default View;
