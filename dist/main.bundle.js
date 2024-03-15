/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/JSscripts/controller.js":
/*!*************************************!*\
  !*** ./src/JSscripts/controller.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var _model_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./model.js */ \"./src/JSscripts/model.js\");\n/* harmony import */ var _view_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./view.js */ \"./src/JSscripts/view.js\");\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\n\n\nclass Controller {\n    constructor() {\n        this.ASC = 'asc';\n        this.DESC = 'desc';\n        this.NODE_NAME = 'name';\n        this.NODE_TYPE = 'type';\n        this.NODE_EDITDATE = 'date';\n        this.NODE_SIZE = 'size';\n        this.defaultSortOrder = this.ASC;\n        this.defaultSortField = this.NODE_SIZE;\n        this.rootPath = \"\";\n        this.currentSortOrder = this.ASC;\n        this.currentPath = \"\";\n        this.backButton = document.getElementById('back-button');\n        this.homeButton = document.getElementById('home-button');\n        this.sortByNameButton = document.getElementById('sort-button-name');\n        this.sortByTypeButton = document.getElementById('sort-button-type');\n        this.sortBySizeButton = document.getElementById('sort-button-size');\n        this.sortByDateButton = document.getElementById('sort-button-date');\n        this.statButton = document.getElementById(\"stat-button\");\n        this.pathInput = document.getElementById('path');\n        this.model = new _model_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\n        this.view = new _view_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"](this);\n    }\n    init() {\n        this.loadData(this.defaultSortField, this.defaultSortOrder, this.rootPath);\n        this.initEventListeners();\n    }\n    loadData(sortField, sortOrder, path) {\n        return __awaiter(this, void 0, void 0, function* () {\n            this.view.clearNodes();\n            this.view.showLoading();\n            try {\n                const data = yield this.model.fetchNodes(sortField, sortOrder, path);\n                this.view.hideLoading();\n                this.view.setLoadingTime(data.loadTime);\n                this.view.displayNodes(data.nodes);\n                if (path === '') {\n                    this.calculateRootPath(data.nodes[0].path);\n                }\n                this.view.setCurrentPathToInput(this.currentPath);\n            }\n            catch (error) {\n                this.view.hideLoading();\n                this.view.showError();\n            }\n        });\n    }\n    loadStats() {\n        return __awaiter(this, void 0, void 0, function* () {\n            try {\n                // сокрытие ошибок, загрузка\n                const data = yield this.model.fetchStats();\n                // отображение\n            }\n            catch (error) {\n                console.log(error);\n                // обработка ошибок\n            }\n        });\n    }\n    calculateRootPath(path) {\n        if (path[0] === '/') {\n            this.currentPath = this.rootPath = '/';\n            this.view.setCurrentPathToInput(this.currentPath);\n            return;\n        }\n        const pathArray = path.split('\\\\');\n        this.currentPath = this.rootPath = pathArray[0] + '/';\n        this.view.setCurrentPathToInput(this.currentPath);\n    }\n    initEventListeners() {\n        if (this.backButton) {\n            this.backButton.addEventListener('click', () => this.handleBackButtonClick());\n        }\n        if (this.homeButton) {\n            this.homeButton.addEventListener('click', () => this.handleHomeButtonClick());\n        }\n        if (this.pathInput) {\n            this.pathInput.addEventListener('keyup', (event) => this.handlePathInputKeyPress(event));\n        }\n        if (this.sortByNameButton) {\n            this.sortByNameButton.addEventListener('click', () => this.handleSortButtonClick(this.NODE_NAME));\n        }\n        if (this.sortByTypeButton) {\n            this.sortByTypeButton.addEventListener('click', () => this.handleSortButtonClick(this.NODE_TYPE));\n        }\n        if (this.sortBySizeButton) {\n            this.sortBySizeButton.addEventListener('click', () => this.handleSortButtonClick(this.NODE_SIZE));\n        }\n        if (this.sortByDateButton) {\n            this.sortByDateButton.addEventListener('click', () => this.handleSortButtonClick(this.NODE_EDITDATE));\n        }\n        if (this.statButton) {\n            this.statButton.addEventListener('click', () => this.handleStatButtonClick());\n        }\n    }\n    handleStatButtonClick() {\n        this.loadStats();\n    }\n    handleSortButtonClick(sortField) {\n        this.currentSortOrder === this.ASC ? (this.currentSortOrder = this.DESC) : (this.currentSortOrder = this.ASC);\n        this.loadData(sortField, this.currentSortOrder, this.currentPath);\n    }\n    handleNodeClick(node) {\n        var _a;\n        const dirName = ((_a = node.firstElementChild) === null || _a === void 0 ? void 0 : _a.textContent) || '';\n        this.currentPath = this.currentPath[this.currentPath.length - 1] === \"/\" ? this.currentPath + dirName : `${this.currentPath}/${dirName}`;\n        this.view.setCurrentPathToInput(this.currentPath);\n        this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath);\n    }\n    handleHomeButtonClick() {\n        if (this.currentPath === this.rootPath) {\n            return;\n        }\n        this.view.setCurrentPathToInput(this.rootPath);\n        this.loadData(this.defaultSortField, this.defaultSortOrder, this.rootPath);\n    }\n    handleBackButtonClick() {\n        const pathArray = this.currentPath.split('/');\n        if (this.currentPath.length <= 1 || (pathArray.length < 2 || pathArray[1] === '')) {\n            return;\n        }\n        else if (pathArray.length === 2) {\n            this.currentPath = `${pathArray[0]}/`;\n            this.view.setCurrentPathToInput(this.currentPath);\n            this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath);\n            return;\n        }\n        else {\n            pathArray.pop();\n            this.currentPath = pathArray.join('/');\n            this.view.setCurrentPathToInput(this.currentPath);\n            this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath);\n        }\n    }\n    handlePathInputKeyPress(event) {\n        if (event.key === 'Enter' && this.pathInput) {\n            this.currentPath = this.pathInput.value;\n            this.view.setCurrentPathToInput(this.currentPath);\n            this.loadData(this.defaultSortField, this.defaultSortOrder, this.currentPath);\n        }\n    }\n    handleAddButtonClick() {\n        // реализация обработчика нажатия кнопки \"добавить\"\n    }\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Controller);\n\n\n//# sourceURL=webpack:///./src/JSscripts/controller.js?");

/***/ }),

/***/ "./src/JSscripts/model.js":
/*!********************************!*\
  !*** ./src/JSscripts/model.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\nclass Model {\n    constructor() { }\n    // fetchNodes получает данные с сервера и создает элементы на странице\n    fetchNodes(sortField, sortOrder, path) {\n        return __awaiter(this, void 0, void 0, function* () {\n            const url = `/nodes?sortField=${encodeURIComponent(sortField)}&sortOrder=${encodeURIComponent(sortOrder)}&path=${encodeURIComponent(path)}`;\n            try {\n                const response = yield fetch(url, {\n                    method: 'GET',\n                    headers: {\n                        'Content-Type': 'application/json'\n                    }\n                });\n                if (!response.ok) {\n                    throw new Error('Данные не получены (статус не 200 OK).');\n                }\n                const data = yield response.json();\n                if (!data.serverIsSucceed) {\n                    throw new Error('Данные получены (статус 200 OK), но они пусты. Причина: ' + data.serverErrorText);\n                }\n                return data;\n            }\n            catch (error) {\n                console.error('Ошибка запроса:', error);\n                throw error;\n            }\n        });\n    }\n    // fetchStats получает данные с сервера Apache о статистике: зависимость времени загрузки от объема\n    fetchStats() {\n        return __awaiter(this, void 0, void 0, function* () {\n            const url = `http://localhost:80/index.php`;\n            try {\n                const response = yield fetch(url, {\n                    method: 'GET',\n                    headers: {\n                        'Content-Type': 'application/json'\n                    }\n                });\n                if (!response.ok) {\n                    throw new Error('Данные не получены (статус не 200 OK).');\n                }\n                const data = yield response.json();\n                if (!data.serverIsSucceed) {\n                    throw new Error('Данные получены (статус 200 OK), но они пусты. Причина: ' + data.serverErrorText);\n                }\n                return data;\n            }\n            catch (error) {\n                console.error('Ошибка запроса:', error);\n                throw error;\n            }\n        });\n    }\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Model);\n\n\n//# sourceURL=webpack:///./src/JSscripts/model.js?");

/***/ }),

/***/ "./src/JSscripts/script.js":
/*!*********************************!*\
  !*** ./src/JSscripts/script.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _controller_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./controller.js */ \"./src/JSscripts/controller.js\");\n/* harmony import */ var _view_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./view.js */ \"./src/JSscripts/view.js\");\n// script.js\n\n\nconst controller = new _controller_js__WEBPACK_IMPORTED_MODULE_0__[\"default\"]();\nconst view = new _view_js__WEBPACK_IMPORTED_MODULE_1__[\"default\"](controller);\ncontroller.init();\n\n\n//# sourceURL=webpack:///./src/JSscripts/script.js?");

/***/ }),

/***/ "./src/JSscripts/view.js":
/*!*******************************!*\
  !*** ./src/JSscripts/view.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\nclass View {\n    constructor(controller) {\n        this.nodeList = document.querySelector('.node-list-section');\n        this.errorDiv = document.querySelector('.error-data-not-found');\n        this.loadingDiv = document.querySelector('.loading-data');\n        this.pathInput = document.getElementById('path');\n        this.controller = controller;\n    }\n    // clearNodes удаляет все пути из списка\n    clearNodes() {\n        if (this.nodeList) {\n            while (this.nodeList.firstChild) {\n                this.nodeList.removeChild(this.nodeList.firstChild);\n            }\n        }\n    }\n    // displayNodes отрисовывает полученные с сервера пути в качестве потомков списка\n    displayNodes(nodes) {\n        this.clearNodes();\n        if (this.nodeList) {\n            nodes.forEach(node => {\n                let newNode = document.createElement('div');\n                newNode.classList.add('node-list__item');\n                // если узел является папкой, добавление соответствующего класса и кликабельности для него\n                if (node.type === \"Папка\" && newNode) {\n                    newNode.classList.add('node-list__item_folder');\n                    newNode.addEventListener(\"click\", () => this.controller.handleNodeClick(newNode));\n                }\n                // инициализация составляющих информации о пути: название, тип, размер и дату редактирования\n                const nodeComponents = [\n                    { text: node.name, class: 'node-list__item__component' },\n                    { text: node.type, class: 'node-list__item__component' },\n                    { text: node.itemSize, class: 'node-list__item__component' },\n                    { text: node.editDate, class: 'node-list__item__component' }\n                ];\n                // отрисовка каждого такого составляющего в качестве потомка соответствующего ему пути\n                nodeComponents.forEach(element => {\n                    let newComponent = document.createElement('div');\n                    newComponent.textContent = element.text;\n                    newComponent.classList.add(element.class);\n                    if (newNode) {\n                        newNode.appendChild(newComponent);\n                    }\n                });\n                // добавление созданного элемента пути в список\n                if (this.nodeList && newNode) {\n                    this.nodeList.appendChild(newNode);\n                }\n            });\n        }\n    }\n    setLoadingTime(time) {\n        const timeElement = document.querySelector('.time');\n        if (timeElement) {\n            timeElement.textContent = `Загружено за: ${time} секунд`;\n        }\n    }\n    showError() {\n        if (this.errorDiv) {\n            this.errorDiv.style.display = 'display';\n        }\n    }\n    hideError() {\n        if (this.errorDiv) {\n            this.errorDiv.style.display = 'none';\n        }\n    }\n    showLoading() {\n        if (this.loadingDiv) {\n            this.loadingDiv.style.display = 'flex';\n        }\n    }\n    hideLoading() {\n        if (this.loadingDiv) {\n            this.loadingDiv.style.display = 'none';\n        }\n    }\n    setCurrentPathToInput(path) {\n        if (this.pathInput) {\n            this.pathInput.value = path;\n        }\n    }\n}\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (View);\n\n\n//# sourceURL=webpack:///./src/JSscripts/view.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/JSscripts/script.js");
/******/ 	
/******/ })()
;