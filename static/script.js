let globalSortOrder = 'asc'
const defaultPath = 'D:/Git Reps/test'
let currentPath = 'D:/Git Reps/test'

function setDefaultPath() {
    currentPath = defaultPath
    let sortField = 'size'
    const url = `/paths?sortField=${encodeURIComponent(sortField)}&sortOrder=${encodeURIComponent(globalSortOrder)}&path=${encodeURIComponent(currentPath)}`;
    getPaths(url)
    let pathInput = document.getElementById('path')
    pathInput.value = currentPath
}

function setPreviousPath() {
    let pathArray = currentPath.split('/');
    pathArray.pop();
    currentPath = pathArray.join('/');
    let sortField = 'size'
    const url = `/paths?sortField=${encodeURIComponent(sortField)}&sortOrder=${encodeURIComponent(globalSortOrder)}&path=${encodeURIComponent(currentPath)}`;
    getPaths(url)
    let pathInput = document.getElementById('path')
    pathInput.value = currentPath
}

function setNewPath(dir) {
    currentPath = currentPath + '/' +dir
    let sortField = 'size'
    const url = `/paths?sortField=${encodeURIComponent(sortField)}&sortOrder=${encodeURIComponent(globalSortOrder)}&path=${encodeURIComponent(currentPath)}`;
    getPaths(url)
    let pathInput = document.getElementById('path')
    pathInput.value = currentPath
}

function setNewPathByInput() {
    if (event.key === "Enter") {
        let inputValue = document.getElementById("path").value
        if (inputValue.charAt(inputValue.length - 1) === "/") {
            inputValue = inputValue.slice(0, -1);
        }
        currentPath = inputValue
        const url = `/paths?sortOrder=${encodeURIComponent(globalSortOrder)}&path=${encodeURIComponent(currentPath)}`;
        getPaths(url)
        let pathInput = document.getElementById('path')
        pathInput.value = currentPath
    }
}

function getPaths(url) {
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
        })
        .then(response => {
            if (!response.ok) {
                let itemList = document.querySelector('.list-section')
                while (itemList.firstChild) {
                    itemList.removeChild(itemList.firstChild);
                }
                let errorDiv = document.querySelector('.error-data-not-found')
                errorDiv.classList.add('error-data-not-found-active')
                return
            }
            let errorDiv = document.querySelector('.error-data-not-found')
            errorDiv.classList.remove('error-data-not-found-active')
            return response.json();
        })
        // почему он идет дальше?
        .then(data => {
            let itemList = document.querySelector('.list-section');

            while (itemList.firstChild) {
                itemList.removeChild(itemList.firstChild);
            }

            for (let i = 0; i < data.length; i++) {
                let newPath = document.createElement('div');
                newPath.classList.add('item-list');
                if (data[i].type == "Папка" && data[i].itemSize[0] !== "0") {
                    newPath.classList.add('item-list-folder');
                    
                    newPath.onclick = function () {
                        setNewPath(data[i].relPath)
                    }
                }

                const elements = [
                    { text: data[i].relPath, class: 'item-option' },
                    { text: data[i].type, class: 'item-option' },
                    { text: data[i].itemSize, class: 'item-option' },
                    { text: data[i].editDate, class: 'item-option' }
                ];

                elements.forEach(element => {
                    let newElement = document.createElement('div')
                    newElement.textContent = element.text
                    newElement.classList.add(element.class)
                    newPath.appendChild(newElement)
                });

                itemList.appendChild(newPath)
            }
        })
        .catch(error => {
            console.error('Ошибка запроса:', error);
        });
}

function sortTable(sortField) {
    let sortOrder
    if (globalSortOrder === "asc") {
        sortOrder = "des"
        globalSortOrder = "des"
    } else if (globalSortOrder === "des"){
        sortOrder = "asc"
        globalSortOrder = "asc"
    }
    const url = `/paths?sortField=${encodeURIComponent(sortField)}&sortOrder=${encodeURIComponent(sortOrder)}&path=${encodeURIComponent(currentPath)}`;
    getPaths(url)
}

document.addEventListener('DOMContentLoaded', function () {
    let pathInput = document.getElementById('path')
    pathInput.value = currentPath

    const sortOrder = 'asc';
    const url = `/paths?sortOrder=${encodeURIComponent(sortOrder)}&path=${encodeURIComponent(currentPath)}`;

    getPaths(url)
});

