// script.js
import Controller from './controller.js';
import View from './view.js';

const controller = new Controller();
const view = new View(controller);
controller.init();
