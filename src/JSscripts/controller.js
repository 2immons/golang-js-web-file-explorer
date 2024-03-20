var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Model from './model.js';
import View from './view.js';
const ASC = 'asc';
const DESC = 'desc';
const NODE_NAME = 'name';
const NODE_TYPE = 'type';
const NODE_EDITDATE = 'date';
const NODE_SIZE = 'size';
class Controller {
    constructor() {
        this.defaultSortOrder = ASC;
        this.defaultSortField = NODE_SIZE;
        this.rootPath = "";
        this.currentSortOrder = ASC;
        this.currentPath = "";
        this.backButton = document.getElementById('back-button');
        this.homeButton = document.getElementById('home-button');
        this.sortByNameButton = document.getElementById('sort-button-name');
        this.sortByTypeButton = document.getElementById('sort-button-type');
        this.sortBySizeButton = document.getElementById('sort-button-size');
        this.sortByDateButton = document.getElementById('sort-button-date');
        this.statButtonTable = document.getElementById("stat-button-table");
        this.statButtonGraphic = document.getElementById("stat-button-graphic");
        this.backToDirsButton = document.getElementById("stat-button-graphic-back");
        this.pathInput = document.getElementById('path');
        this.model = new Model();
        this.view = new View(this);
    }
    init() {
        this.loadNodesData(this.defaultSortField, this.defaultSortOrder, this.rootPath);
        this.initEventListeners();
    }
    // вызывает загрузку и обрабатывает данные о директориях
    loadNodesData(sortField, sortOrder, path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.view.removeNodes();
            this.view.showLoading();
            this.view.hideError();
            try {
                const data = yield this.model.fetchNodes(sortField, sortOrder, path);
                this.view.hideLoading();
                this.view.showLoadingTime(data.loadTime);
                this.view.displayNodes(data.nodes);
                if (path === '') {
                    this.calculateRootPath(data.nodes[0].path);
                }
                this.view.setCurrentPathToInput(this.currentPath);
            }
            catch (error) {
                this.view.hideLoading();
                this.view.showError();
            }
        });
    }
    // вызывает переход на страницу сервера Apache со статистикой загрузок данных
    loadStatsTable() {
        this.model.redirectToStat();
    }
    // вызывает загрузку и обрабатывает данные о статистике загрузок данных (для дальнейшей отрисовки графика)
    loadStatsGraphicData() {
        return __awaiter(this, void 0, void 0, function* () {
            // this.view.showLoading();
            try {
                const data = yield this.model.fetchStats();
                // this.view.hideLoading();
                this.view.hideNodeSection();
                this.view.createAndDisplayChart(data);
                this.view.showBackButton();
                this.view.hideGraphicButton();
            }
            catch (error) {
                this.view.hideLoading();
                this.view.showError();
            }
        });
    }
    // инициализация слушателей событий
    initEventListeners() {
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
    handleStatButtonTableClick() {
        this.loadStatsTable();
    }
    // по нажатию на кнопку вызывает функцию отображения директорий и удаления графика
    handleStatButtonGraphicBackClick() {
        this.loadNodesData(this.defaultSortField, this.currentSortOrder, this.currentPath);
        this.view.destroyChartAndShowNodeSection();
        this.view.hideBackButton();
        this.view.showGraphicButton();
    }
    // по нажатию на кнопку вызывает функцию загрузки данных о статистике для отрисовки графика
    handleStatButtonGraphicClick() {
        this.loadStatsGraphicData();
    }
    // по нажатию на кнопку вызывает функцию загрузки данных о директориях с учетом сотировкиs
    handleSortButtonClick(sortField) {
        this.currentSortOrder === ASC ? (this.currentSortOrder = DESC) : (this.currentSortOrder = ASC);
        this.loadNodesData(sortField, this.currentSortOrder, this.currentPath);
    }
    // по нажатию на кнопку обновляет текущий путь в зависимости от того, куда пользователь хочет перейти (на какой узел нажал),
    // после чего вызывает функцию загрузки данных о директориях без учета сортировки
    handleNodeClick(node) {
        var _a;
        const dirName = ((_a = node.firstElementChild) === null || _a === void 0 ? void 0 : _a.textContent) || '';
        this.currentPath = this.currentPath[this.currentPath.length - 1] === "/" ? this.currentPath + dirName : `${this.currentPath}/${dirName}`;
        this.view.setCurrentPathToInput(this.currentPath);
        this.loadNodesData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
    }
    // по нажатию на кнопку устанавливает текущий путь равным корневому
    // и вызывает функцию загрузки данных о директориях без учета сортировки
    handleHomeButtonClick() {
        if (this.currentPath === this.rootPath) {
            return;
        }
        this.currentPath = this.rootPath;
        this.view.setCurrentPathToInput(this.currentPath);
        this.loadNodesData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
    }
    // по нажатию на кнопку устанавливает текущий путь на уровень выше по вложенности (т.е. ближе к корневому),
    // после чего вызывает функцию загрузки данных о директориях без учета сортировки
    handleBackButtonClick() {
        const pathArray = this.currentPath.split('/');
        if (this.currentPath.length <= 1 || (pathArray.length < 2 || pathArray[1] === '')) {
            return;
        }
        else if (pathArray.length === 2) {
            this.currentPath = `${pathArray[0]}/`;
            this.view.setCurrentPathToInput(this.currentPath);
            this.loadNodesData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
            return;
        }
        else {
            pathArray.pop();
            this.currentPath = pathArray.join('/');
            this.view.setCurrentPathToInput(this.currentPath);
            this.loadNodesData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
        }
    }
    // по нажатию на Enter устанавливает текущий путь равным введенному пользователем значению в input,
    // после чего вызывает функцию загрузки данных о директориях без учета сортировки
    handlePathInputKeyPress(event) {
        if (event.key === 'Enter' && this.pathInput) {
            this.currentPath = this.pathInput.value;
            this.view.setCurrentPathToInput(this.currentPath);
            this.loadNodesData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
        }
    }
    // рассчет корневого пути по абсолютному
    calculateRootPath(path) {
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
