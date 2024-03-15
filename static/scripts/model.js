// model.js
class Model {
    constructor() {
        // инициализация данных модели
    }

    // getPaths получает данные с сервера и создает элементы на странице
    async fetchNodes(sortField, sortOrder, path) {
        const url = `/paths?sortField=${encodeURIComponent(sortField)}&sortOrder=${encodeURIComponent(sortOrder)}&path=${encodeURIComponent(path)}`
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            
            if (!response.ok) {
                throw new Error('Ошибка. Данные не получены (статус не 200 OK). Причина:')
            }
            
            const data = await response.json()
    
            // if (!data.serverIsSucceed) {
            //     throw new Error('Ошибка. Данные получены (статус 200 OK), но они пусты. Причина: ' + data.serverErrorText)
            // }
    
            return data;
        } catch (error) {
            console.error('Ошибка запроса:', error)
            throw error
        }
    }
    

    processData(data) {
        // обработка полученных данных
    }

    // другие методы для работы с данными
}

export default Model;
