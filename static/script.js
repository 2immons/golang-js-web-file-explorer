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

