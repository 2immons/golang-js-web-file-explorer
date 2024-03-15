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
class Controller {
    constructor() {
        this.ASC = 'asc';
        this.DESC = 'desc';
        this.NODE_NAME = 'name';
        this.NODE_TYPE = 'type';
        this.NODE_EDITDATE = 'date';
        this.NODE_SIZE = 'size';
        this.defaultSortOrder = this.ASC;
        this.defaultSortField = this.NODE_SIZE;
        this.rootPath = "";
        this.currentSortOrder = this.ASC;
        this.currentPath = "";
        this.backButton = document.getElementById('back-button');
        this.homeButton = document.getElementById('home-button');
        this.sortByNameButton = document.getElementById('sort-button-name');
        this.sortByTypeButton = document.getElementById('sort-button-type');
        this.sortBySizeButton = document.getElementById('sort-button-size');
        this.sortByDateButton = document.getElementById('sort-button-date');
        this.pathInput = document.getElementById('path');
        this.model = new Model();
        this.view = new View(this);
    }
    init() {
        this.loadData(this.defaultSortField, this.defaultSortOrder, this.rootPath);
        this.initEventListeners();
    }
    loadData(sortField, sortOrder, path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.view.clearNodes();
            this.view.showLoading();
            try {
                const data = yield this.model.fetchNodes(sortField, sortOrder, path);
                this.view.hideLoading();
                this.view.setLoadingTime(data.loadTime);
                this.view.displayNodes(data.nodes);
                if (path === '') {
                    this.calculateRootPath(data.nodes[0].path);
                }
                this.view.setCurrentPathToInput(this.currentPath);
            }
            catch (error) {
                console.log(error);
                this.view.hideLoading();
                this.view.showError();
            }
        });
    }
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
            this.sortByNameButton.addEventListener('click', () => this.handleSortButtonClick(this.NODE_NAME));
        }
        if (this.sortByTypeButton) {
            this.sortByTypeButton.addEventListener('click', () => this.handleSortButtonClick(this.NODE_TYPE));
        }
        if (this.sortBySizeButton) {
            this.sortBySizeButton.addEventListener('click', () => this.handleSortButtonClick(this.NODE_SIZE));
        }
        if (this.sortByDateButton) {
            this.sortByDateButton.addEventListener('click', () => this.handleSortButtonClick(this.NODE_EDITDATE));
        }
    }
    handleSortButtonClick(sortField) {
        this.currentSortOrder === this.ASC ? (this.currentSortOrder = this.DESC) : (this.currentSortOrder = this.ASC);
        this.loadData(sortField, this.currentSortOrder, this.currentPath);
    }
    handleNodeClick(node) {
        var _a;
        const dirName = ((_a = node.firstElementChild) === null || _a === void 0 ? void 0 : _a.textContent) || '';
        this.currentPath = this.currentPath[this.currentPath.length - 1] === "/" ? this.currentPath + dirName : `${this.currentPath}/${dirName}`;
        this.view.setCurrentPathToInput(this.currentPath);
        this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
    }
    handleHomeButtonClick() {
        if (this.currentPath === this.rootPath) {
            return;
        }
        this.view.setCurrentPathToInput(this.rootPath);
        this.loadData(this.defaultSortField, this.defaultSortOrder, this.rootPath);
    }
    handleBackButtonClick() {
        const pathArray = this.currentPath.split('/');
        if (this.currentPath.length <= 1 || (pathArray.length < 2 || pathArray[1] === '')) {
            return;
        }
        else if (pathArray.length === 2) {
            this.currentPath = `${pathArray[0]}/`;
            this.view.setCurrentPathToInput(this.currentPath);
            this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
            return;
        }
        else {
            pathArray.pop();
            this.currentPath = pathArray.join('/');
            this.view.setCurrentPathToInput(this.currentPath);
            this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
        }
    }
    handlePathInputKeyPress(event) {
        if (event.key === 'Enter' && this.pathInput) {
            this.currentPath = this.pathInput.value;
            this.view.setCurrentPathToInput(this.currentPath);
            this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
        }
    }
    handleAddButtonClick() {
        // реализация обработчика нажатия кнопки "добавить"
    }
}
export default Controller;
