// model.js
class Model {
    constructor() {}

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
                throw new Error('Данные не получены (статус не 200 OK).')
            }
            
            const data = await response.json()
    
            if (!data.serverIsSucceed) {
                throw new Error('Данные получены (статус 200 OK), но они пусты. Причина: ' + data.serverErrorText)
            }
    
            return data;
        } catch (error) {
            console.error('Ошибка запроса:', error)
            throw error
        }
    }
}

export default Model;
