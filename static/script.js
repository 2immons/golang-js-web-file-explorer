document.addEventListener('DOMContentLoaded', function () {
    // Получаем ссылку на элемент ul
    let itemList = document.querySelector('.item-list')

    // Заменяем содержимое списка
    for (let i = 0; i < 5; i++) {
        let newItem = document.createElement('div')
        newItem.classList.add('item-list');
        newItem.textContent = 'New List ' + (i + 1)
        newItem.onclick = function() {
            toggleSubList(newItem)
        };
        itemList.appendChild(newItem)
    }
});

function toggleSubList(item) {
    event.stopPropagation();

    if (item.children.length > 0) {
        while (item.children.length > 0) {
            item.removeChild(item.children[0])
        }
        item.style.paddingBottom = ''
    } else {
        for (let i = 1; i < 4; i++) {
            let subList = document.createElement('div')
            subList.style.paddingLeft = '10px'
            subList.classList.add('item-list')
            subList.textContent = 'New Sub-List ' + i
            subList.onclick = function() {
                toggleSubList(subList)
            };
            item.appendChild(subList)
        }
        item.style.paddingBottom = '10px'
    }
}

var sortParams = {
    field: 'size',
    order: 'asc'
}

function sortTable(sortOrder) {
    let sortOrder
    if (sortParams.order == 'asc') {
        this.sortOrder = 'des'
    } 
    else if (sortParams.order == 'des') {
        this.sortOrder = 'asc'
    }
    event.stopPropagation();

    fetch("/sortData", {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(sortParams)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
        })
        .catch(error => console.log(error))
}


document.addEventListener('DOMContentLoaded', function () {
    let currentPath = "D:/22/11/2/3/4"
    let pathDiv = document.getElementById('path')
    pathDiv.innerHTML = currentPath

    fetch("/paths", {
        method: 'GET',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(sortParams)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
        })
        .catch(error => console.log(error))
});

