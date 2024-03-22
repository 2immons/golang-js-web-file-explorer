import Model from './model';
import View from './view';

enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

const NODE_NAME: string = 'name';
const NODE_TYPE: string = 'type';
const NODE_EDITDATE: string = 'date';
const NODE_SIZE: string = 'size';

class Controller {
    private model: Model;
    private view: View;

    private defaultSortOrder: string = SortOrder.ASC;
    private defaultSortField: string = NODE_SIZE;
    private rootPath: string = "";

    private currentSortOrder: string = SortOrder.ASC;
    private currentPath: string = "";

    private backButton: HTMLElement | null = document.getElementById('back-button');
    private homeButton: HTMLElement | null = document.getElementById('home-button');
    
    private sortByNameButton: HTMLElement | null = document.getElementById('sort-button-name');
    private sortByTypeButton: HTMLElement | null = document.getElementById('sort-button-type');
    private sortBySizeButton: HTMLElement | null = document.getElementById('sort-button-size');
    private sortByDateButton: HTMLElement | null = document.getElementById('sort-button-date');

    private statButtonTable: HTMLElement | null = document.getElementById("stat-button-table");
    private statButtonGraphic: HTMLElement | null = document.getElementById("stat-button-graphic");
    private backToDirsButton: HTMLElement | null = document.getElementById("stat-button-graphic-back");

    private pathInput = document.getElementById('path') as HTMLInputElement;

    constructor() {
        this.model = new Model();
        this.view = new View(this);
    }

    init(): void {
        this.loadNodesData(this.defaultSortField, this.defaultSortOrder, this.rootPath);
        this.initEventListeners();
    }

    // вызывает загрузку и обрабатывает данные о директориях
    async loadNodesData(sortField: string, sortOrder: string, path: string) {
        this.view.removeNodes();
        this.view.showLoading();
        this.view.hideError();
        try {
            const data = await this.model.fetchNodes(sortField, sortOrder, path);
            this.view.showLoadingTime(data.loadTime);
            this.view.displayNodes(data.nodes);
            if (path === '') {
                this.calculateRootPath(data.nodes[0].path);
            }
            this.view.setCurrentPathToInput(this.currentPath);
        } catch (error) {
            this.view.showError();
        } finally {
            this.view.hideLoading();
        }
    }

    // вызывает переход на страницу сервера Apache со статистикой загрузок данных
    loadStatsTable() {
        this.model.redirectToStat()
    }

    // вызывает загрузку и обрабатывает данные о статистике загрузок данных (для дальнейшей отрисовки графика)
    async loadStatsGraphicData() {
        this.view.removeNodes();
        this.view.showLoading();
        this.view.hideError();
        try {
            const data = await this.model.fetchStats();
            this.view.hideNodeSection();
            this.view.createAndDisplayChart(data);
            this.view.showBackButton();
            this.view.hideGraphicButton();
        } catch (error) {
            this.view.showError();
        } finally {
            this.view.hideLoading();
        }
    }

    // инициализация слушателей событий
    initEventListeners(): void {
        if (this.backButton) {
            this.backButton.addEventListener('click', () => this.handleBackButtonClick());
        }
        if (this.homeButton) {
            this.homeButton.addEventListener('click', () => this.handleHomeButtonClick());
        }
        if (this.pathInput) {
            this.pathInput.addEventListener('keyup', (event) => this.handlePathInputKeyPress(event));
        }

        if (this.sortByNameButton) {
            this.sortByNameButton.addEventListener('click', () => this.handleSortButtonClick(NODE_NAME));
        }
        if (this.sortByTypeButton) {
            this.sortByTypeButton.addEventListener('click', () => this.handleSortButtonClick(NODE_TYPE));
        }
        if (this.sortBySizeButton) {
            this.sortBySizeButton.addEventListener('click', () => this.handleSortButtonClick(NODE_SIZE));
        }
        if (this.sortByDateButton) {
            this.sortByDateButton.addEventListener('click', () => this.handleSortButtonClick(NODE_EDITDATE));
        }

        if (this.statButtonTable) {
            this.statButtonTable.addEventListener('click', () => this.handleStatButtonTableClick());
        }
        if (this.statButtonGraphic) {
            this.statButtonGraphic.addEventListener('click', () => this.handleStatButtonGraphicClick());
        }
        if (this.backToDirsButton) {
            this.backToDirsButton.addEventListener('click', () => this.handleStatButtonGraphicBackClick());
        }
    }

    // по нажатию на кнопку вызывает функцию перехода на страницу Apache
    handleStatButtonTableClick(): void {
        this.loadStatsTable();
    }

    // по нажатию на кнопку вызывает функцию отображения директорий и удаления графика
    handleStatButtonGraphicBackClick(): void {
        this.loadNodesData(this.defaultSortField, this.currentSortOrder, this.currentPath);
        this.view.destroyChartAndShowNodeSection();
        this.view.hideBackButton();
        this.view.showGraphicButton();
    }

    // по нажатию на кнопку вызывает функцию загрузки данных о статистике для отрисовки графика
    handleStatButtonGraphicClick(): void {
        this.loadStatsGraphicData();
    }

    // по нажатию на кнопку вызывает функцию загрузки данных о директориях с учетом сотировкиs
    handleSortButtonClick(sortField: string): void {
        this.currentSortOrder === SortOrder.ASC ? (this.currentSortOrder = SortOrder.DESC) : (this.currentSortOrder = SortOrder.ASC);
        this.loadNodesData(sortField, this.currentSortOrder, this.currentPath);
    }

    // по нажатию на кнопку обновляет текущий путь в зависимости от того, куда пользователь хочет перейти (на какой узел нажал),
    // после чего вызывает функцию загрузки данных о директориях без учета сортировки
    handleNodeClick(node: HTMLElement): void {
        const dirName = node.firstElementChild?.textContent || '';
        this.currentPath = this.currentPath[this.currentPath.length - 1] === "/" ? this.currentPath + dirName : `${this.currentPath}/${dirName}`;
        this.view.setCurrentPathToInput(this.currentPath);
        this.loadNodesData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
    }

    // по нажатию на кнопку устанавливает текущий путь равным корневому
    // и вызывает функцию загрузки данных о директориях без учета сортировки
    handleHomeButtonClick(): void {
        if (this.currentPath === this.rootPath) {
            return;
        }
        this.currentPath = this.rootPath;
        this.view.setCurrentPathToInput(this.currentPath);
        this.loadNodesData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
    }

    // по нажатию на кнопку устанавливает текущий путь на уровень выше по вложенности (т.е. ближе к корневому),
    // после чего вызывает функцию загрузки данных о директориях без учета сортировки
    handleBackButtonClick(): void {
        const pathArray = this.currentPath.split('/');
        if (this.currentPath.length <= 1 || (pathArray.length < 2 || pathArray[1] === '')) {
            return;
        } else if (pathArray.length === 2) {
            this.currentPath = `${pathArray[0]}/`;
            this.view.setCurrentPathToInput(this.currentPath);
            this.loadNodesData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
            return;
        } else {
            pathArray.pop();
            this.currentPath = pathArray.join('/');
            this.view.setCurrentPathToInput(this.currentPath);
            this.loadNodesData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
        }
    }

    // по нажатию на Enter устанавливает текущий путь равным введенному пользователем значению в input,
    // после чего вызывает функцию загрузки данных о директориях без учета сортировки
    handlePathInputKeyPress(event: KeyboardEvent): void {
        if (event.key === 'Enter' && this.pathInput) {
            this.currentPath = this.pathInput.value;
            this.view.setCurrentPathToInput(this.currentPath);
            this.loadNodesData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
        }
    }

    // рассчет корневого пути по абсолютному
    calculateRootPath(path: string): void {
        if (path[0] === '/') {
            this.currentPath = this.rootPath = '/';
            this.view.setCurrentPathToInput(this.currentPath);
            return;
        }
        const pathArray = path.split('\\');
        this.currentPath = this.rootPath = pathArray[0] + '/';
        this.view.setCurrentPathToInput(this.currentPath);
    }
}

export default Controller;
