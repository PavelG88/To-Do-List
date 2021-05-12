class toDoList {
    constructor(task) {
        this.list = [...task];
        this.countTask = this.list.length + 1;
        this.sortDirection = 0;
    }
    /** 
     * Инициализации методов класса
    */
    init() {
        this.setEventListenerForButton();
        this.setEventListenerForSort();
        document.querySelectorAll('.task__img').forEach((element) => {
            this.setEventListenerForRemove(element);
        });
        this.setEventListenerForDragAndDrop();
        this.setEventListenerForBin();     
        // console.log(this.list);
    }

    /**
     * Обработчик события при нажатии на кнопку Добавить
     */
     setEventListenerForButton() {
        let button = document.querySelector('.button__img');
        button.addEventListener('click', () => {
            let input = document.querySelector('.task__input');
            //Добавление строки в список
            this.addTask(input.value);
            //Очистка введенного значения в поле ввода
            input.value = '';
        });
    }

    /**
     * Обработчик события при наведении или нажатии на сортировку
     */
    setEventListenerForSort() {
        let sort = document.querySelector('.sort__img');
        //Событие при наведении курсора на сортировку
        sort.addEventListener('mouseover', () => {
            sort.src = this.sortDirection !== -1 ? 'images/4.svg' : 'images/2.svg';
        });
        //Событие при убирании курсора с сортировки
        sort.addEventListener('mouseout', () => {
            sort.src = this.sortDirection !== -1 ? 'images/3.svg' : 'images/1.svg';
        });
        //Событие при нажатии на сортировку
        sort.addEventListener('click', () => {
            this.sort();
            this.sortDirection = this.sortDirection === 1 ? -1 : 1;
            sort.src = this.sortDirection === 1 ? 'images/4.svg' : 'images/2.svg';
        });
    }
 
    /**
     * Обработчик событий при наведении или нажатии на крестик
     * @param {*} item Указатель на элемент, к которому добавляем данное событие
     */
    setEventListenerForRemove(item) {
        //Событие при наведении курсора на крестик
        item.addEventListener('mouseover', () => {
            item.src = 'images/button-remove-hover.svg';
        });
        //Событие при убирании курсора с крестика
        item.addEventListener('mouseout', () => {
            item.src = 'images/button-remove.svg';
        });
        //Событие при нажатии на крестик
        item.addEventListener('click', (event) => {
            this.removeTask(event.target.previousElementSibling.name);
        });
    }
     /**
      * Обработчик событий при наведении или нажатии на корзину
      */
    setEventListenerForBin() {
        let bin = document.querySelector('.button__img-bin');
        let tooltip = document.querySelector('.button__tooltip')
        //Событие при наведении курсора на корзину
        bin.addEventListener('mouseover', (event) => {
            bin.src = 'images/bin-hover.svg';
            tooltip.style.display = 'block';
        });
        bin.addEventListener('mousemove', (event) => {
            tooltip.style.top = event.layerY + 'px';
            tooltip.style.left = event.layerX + 10 + 'px';
        });
        //Событие при убирании курсора с корзины
        bin.addEventListener('mouseout', () => {
            bin.src = 'images/bin.svg';
            tooltip.style.display = 'none';
            tooltip.style.top = 0;
            tooltip.style.left = 0;
        });
        //Событие при нажатии на корзину (удалить все задачи)
        bin.addEventListener('click', () => {
            this.list.splice(1);
            this.list[0].firstElementChild.value = '';
            this.updateList();
        });
    }

    /**
     * Обработчик DragAndDrop событий (перемещение по списку элементов, удаление при перетаскивании в корзину)
     */
    setEventListenerForDragAndDrop() {
        let DragAndDropElements = document.querySelector('.input-field');
        let bin = document.querySelector('.button__img-bin');

        DragAndDropElements.addEventListener('dragstart', (event) => {
            //Добавляем класс Selected к перемещаемому элементу
            event.target.classList.add('selected');
        });
        DragAndDropElements.addEventListener('dragend', (event) => {
            //Удаляем класс Selected при отпускании элемента
            event.target.classList.remove('selected');
        });
        DragAndDropElements.addEventListener(`dragover`, (event) => {
            // Разрешаем сбрасывать элементы в область ввода
            event.preventDefault();
            // Находим перемещаемый элемент и элекмент, над которым курсор
            let activeElement = DragAndDropElements.querySelector(`.selected`);
            let currentElement = event.target.parentElement;
            //Проверяем, что перемещаемый элемент не над собой и над задачей
            let isMoveable = activeElement !== currentElement && currentElement.classList.contains(`task`);
            // Если элемент над собой или вне списка задач прерываем выполнение функции
            if (!isMoveable) {
                return;
            }
            // Находим элемент, перед которым будем вставлять перемещаемый
            let nextElement = () => {
                // Получаем объект с размерами и координатами
                let currentElementCoord = currentElement.getBoundingClientRect();
                // Находим вертикальную координату центра текущего элемента
                let currentElementCenter = currentElementCoord.y + currentElementCoord.height / 2;
                // Проверяем положение курсора относительно центра текущего элемента
                let nextElement = (event.clientY < currentElementCenter) ? currentElement : currentElement.nextElementSibling;
                return nextElement;
            };
            // Перемещаем активный элемент
            if (!nextElement()) {
                currentElement.after(activeElement);;
            } else {
                nextElement().before(activeElement);
            }
        });
        bin.addEventListener(`dragover`, (event) => {
            // Разрешаем сбрасывать элементы в корзину
            event.preventDefault();
        });
        bin.addEventListener(`dragenter`, () => {
            // Изменяем картинку корзины при наведении
            bin.src = 'images/bin-hover.svg';
        });
        bin.addEventListener(`dragleave`, () => {
            // Возвращаем первоначальную картинку корзины
            bin.src = 'images/bin.svg';
        });
        bin.addEventListener(`drop`, () => {
            // Находим перемещаемый элемент
            let activeElement = DragAndDropElements.querySelector(`.selected`);
            // Удаляем его
            this.removeTask(activeElement.firstElementChild.name);
            // Возвращаем первоначальную картинку корзины
            bin.src = 'images/bin.svg';
        });
    }

    /**
     * Добавление задачи в список.
     * @param {*} value Введенная задача
     */
    addTask(valueTask) {
        let div = document.createElement('div');
        div.classList.add('task');
        div.draggable = 'true';

        let input = document.createElement('input');
        input.classList.add('task__input');
        input.value = valueTask;
        input.name = 'task' + this.countTask;
        input.placeholder = 'Введите задачу';
        div.append(input);

        let img = document.createElement('img');
        img.classList.add('task__img');
        img.src = 'images/button-remove.svg';
        img.draggable = !img.draggable;
        this.setEventListenerForRemove(img);
        div.append(img);

        this.list.push(div);
        this.countTask ++;

        this.updateList();
    }
    
    /**
     * Удаление элемента из списка задач
     * @param {*} element Имя удаляемого поля input
     */
    removeTask(element) {
        //Удаляем элемент из массива списка задач
        if (this.list.length !== 1){
            this.list = this.list.filter((item) => {
                return item.firstElementChild.name !== element;
            });
        } else {
            this.list[0].firstElementChild.value = '';
        }
        
        //Обновляем список задач на странице
        this.updateList();
    }

    /**
     * Сортировка
     */
    sort() {
        //Сортируем массив от меньшего к большему
        this.list = this.list.sort((task1, task2) => {
            let value1 = task1.firstElementChild.value;
            let value2 = task2.firstElementChild.value;

            if(isNaN(value1)) {
                if (value2 > value1) {
                    return -1;
                } else {
                    return 1;
                }
            }
            return value1 - value2;
        });

        //Разворчаиваем массив, если нужно от большего к меньшему
        if (this.sortDirection === 1) {
            this.list.reverse();
        }

        //Обновляем список задач на странице
        this.updateList();
    }

    /**
     * Обновление списка задач на странице 
     * */
    updateList() {
        //Удаляем текущий список задач со страницы
        let newInputField = document.querySelector('.input-field');
        newInputField.innerHTML = '';     

        //Добавляем введенные задачи
        this.list.forEach((element) => {
            newInputField.append(element);
        });

        //Размещаем область ввода на странице
        let sort = document.querySelector('.sort');
        sort.after(newInputField);

    }
}

let task = document.querySelectorAll('.task')
let list = new toDoList(task);
list.init();