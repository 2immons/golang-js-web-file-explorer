import Model from './model.js';
import View from './view.js';

class Controller {
    private model: Model;
    private view: View;

    private ASC: string = 'asc';
    private DESC: string = 'desc';

    private NODE_NAME: string = 'name';
    private NODE_TYPE: string = 'type';
    private NODE_EDITDATE: string = 'date';
    private NODE_SIZE: string = 'size';

    private defaultSortOrder: string = this.ASC;
    private defaultSortField: string = this.NODE_SIZE;
    private rootPath: string = "";

    private currentSortOrder: string = this.ASC;
    private currentPath: string = "";

    private backButton: HTMLElement | null = document.getElementById('back-button');
    private homeButton: HTMLElement | null = document.getElementById('home-button');
    private sortByNameButton: HTMLElement | null = document.getElementById('sort-button-name');
    private sortByTypeButton: HTMLElement | null = document.getElementById('sort-button-type');
    private sortBySizeButton: HTMLElement | null = document.getElementById('sort-button-size');
    private sortByDateButton: HTMLElement | null = document.getElementById('sort-button-date');
    private statButtonTable: HTMLElement | null = document.getElementById("stat-button-table");
    private statButtonGraphic: HTMLElement | null = document.getElementById("stat-button-graphic");
    private pathInput = document.getElementById('path') as HTMLInputElement;

    constructor() {
        this.model = new Model();
        this.view = new View(this);
    }

    init(): void {
        this.loadData(this.defaultSortField, this.defaultSortOrder, this.rootPath);
        this.initEventListeners();
    }

    async loadData(sortField: string, sortOrder: string, path: string) {
        this.view.clearNodes();
        this.view.showLoading();
        try {
            const data = await this.model.fetchNodes(sortField, sortOrder, path);
            this.view.hideLoading();
            this.view.setLoadingTime(data.loadTime);
            this.view.displayNodes(data.nodes);
            if (path === '') {
                this.calculateRootPath(data.nodes[0].path);
            }
            this.view.setCurrentPathToInput(this.currentPath);
        } catch (error) {
            this.view.hideLoading();
            this.view.showError();
        }
    }

    loadStatsTable() {
        this.model.redirectToStat()
    }

    async loadStatsGraphic() {
        this.view.clearNodes();
        this.view.showLoading();
        try {
            const data = await this.model.fetchStats();
            this.view.hideLoading();
            console.log(data)
            this.view.displayChart(data);
            // this.view.setCurrentPathToInput(this.currentPath);
        } catch (error) {
            this.view.hideLoading();
            this.view.showError();
        }
    }

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

        if (this.statButtonTable) {
            this.statButtonTable.addEventListener('click', () => this.handleStatButtonTableClick());
        }
        if (this.statButtonGraphic) {
            this.statButtonGraphic.addEventListener('click', () => this.handleStatButtonGraphicClick());
        }
    }

    handleStatButtonTableClick(): void {
        this.loadStatsTable();
    }

    handleStatButtonGraphicClick(): void {
        this.loadStatsGraphic();
    }

    handleSortButtonClick(sortField: string): void {
        this.currentSortOrder === this.ASC ? (this.currentSortOrder = this.DESC) : (this.currentSortOrder = this.ASC);
        this.loadData(sortField, this.currentSortOrder, this.currentPath);
    }

    handleNodeClick(node: HTMLElement): void {
        const dirName = node.firstElementChild?.textContent || '';
        this.currentPath = this.currentPath[this.currentPath.length - 1] === "/" ? this.currentPath + dirName : `${this.currentPath}/${dirName}`;
        this.view.setCurrentPathToInput(this.currentPath);
        this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
    }

    handleHomeButtonClick(): void {
        if (this.currentPath === this.rootPath) {
            return;
        }
        this.currentPath = this.rootPath;
        this.view.setCurrentPathToInput(this.currentPath);
        this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
    }

    handleBackButtonClick(): void {
        const pathArray = this.currentPath.split('/');
        if (this.currentPath.length <= 1 || (pathArray.length < 2 || pathArray[1] === '')) {
            return;
        } else if (pathArray.length === 2) {
            this.currentPath = `${pathArray[0]}/`;
            this.view.setCurrentPathToInput(this.currentPath);
            this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
            return;
        } else {
            pathArray.pop();
            this.currentPath = pathArray.join('/');
            this.view.setCurrentPathToInput(this.currentPath);
            this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
        }
    }

    handlePathInputKeyPress(event: KeyboardEvent): void {
        if (event.key === 'Enter' && this.pathInput) {
            this.currentPath = this.pathInput.value;
            this.view.setCurrentPathToInput(this.currentPath);
            this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath);
        }
    }

    handleAddButtonClick(): void {
        // реализация обработчика нажатия кнопки "добавить"
    }
}

export default Controller;
