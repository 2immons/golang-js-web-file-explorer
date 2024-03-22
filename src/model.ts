
import configFile from '../server.config.json';

class Model {
    constructor() {}

    // fetchNodes получает данные с сервера и создает элементы на странице
    async fetchNodes(sortField: string, sortOrder: string, path: string): Promise<any> {
        const url = `/nodes?sortField=${encodeURIComponent(sortField)}&sortOrder=${encodeURIComponent(sortOrder)}&path=${encodeURIComponent(path)}`
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Данные не получены (статус не 200 OK).');
            }
            
            const data = await response.json();
    
            if (!data.serverIsSucceed) {
                throw new Error('Данные получены (статус 200 OK), но они пусты. Причина: ' + data.serverErrorText);
            }
    
            return data;
        } catch (error) {
            console.error('Ошибка запроса:', error);
            throw error;
        }
    }

    // fetchStats получает данные с сервера Apache о статистике: зависимость времени загрузки от объема
    async fetchStats(): Promise<any> {
        const url = configFile.apacheGraphicURL
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.log(response.status)
                throw new Error('Данные не получены (статус не 200 OK).');
            }
            
            const data = await response.json();
    
            return data;
        } catch (error) {
            console.error('Ошибка запроса:', error);
            throw error;
        }
    }

    // перенаправление на страницу сервера Apache со статистикой загрузок данных
    redirectToStat() {
        const url = configFile.apacheTableURL
        window.location.href = url
    }
}

export default Model;
