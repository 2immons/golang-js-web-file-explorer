var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Model {
    constructor() { }
    // fetchNodes получает данные с сервера и создает элементы на странице
    fetchNodes(sortField, sortOrder, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `/nodes?sortField=${encodeURIComponent(sortField)}&sortOrder=${encodeURIComponent(sortOrder)}&path=${encodeURIComponent(path)}`;
            try {
                const response = yield fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    throw new Error('Данные не получены (статус не 200 OK).');
                }
                const data = yield response.json();
                if (!data.serverIsSucceed) {
                    throw new Error('Данные получены (статус 200 OK), но они пусты. Причина: ' + data.serverErrorText);
                }
                return data;
            }
            catch (error) {
                console.error('Ошибка запроса:', error);
                throw error;
            }
        });
    }
    // fetchStats получает данные с сервера Apache о статистике: зависимость времени загрузки от объема
    fetchStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `http://localhost:80/statGetGraphic.php`;
            try {
                const response = yield fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    console.log(response.status);
                    throw new Error('Данные не получены (статус не 200 OK).');
                }
                const data = yield response.json();
                return data;
            }
            catch (error) {
                console.error('Ошибка запроса:', error);
                throw error;
            }
        });
    }
    redirectToStat() {
        const url = "http://localhost/statGet.php";
        window.location.href = url;
    }
}
export default Model;
