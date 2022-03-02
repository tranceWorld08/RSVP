document.addEventListener('DOMContentLoaded', () => {

    const listsContainer = document.querySelector('[data-lists]');
    const listForm = document.getElementById('list_form');
    const listInput = listForm.querySelector('input');

    const deleteListButton = document.querySelector('[data-delete-list-button]');
    const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]');

    const listDisplayContainer = document.querySelector('[data-list-display-container]');
    const listTitleElement = document.querySelector('[data-list-title]');
    const listCountElement = document.querySelector('[data-list-count]');
    const tasksContainer = document.querySelector('[data-tasks]');
    const taskTemplate = document.getElementById('task-template');

    const taskForm = document.querySelector('[data-new-task-form]');
    const input = taskForm.querySelector('input');

    const ul = document.getElementById('invitedList');
    const button = document.createElement('button');
    const div = document.querySelector('.main');

    const completeCheckbox = document.querySelector('[data-checkbox-complete]');
    let atLeastOne = false;

    function createBtn(nm, classNm = '') {
        const button = document.createElement('button');
        button.textContent = nm;
        button.className = classNm;
        return button;
    }

    //=====LOCAL STORAGE SETUP=======//
    const LOCAL_STORAGE_LIST_KEY = 'task.lists';
    const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId';
    let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
    let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

    //======RENDER APP======//
    function render() {
        clearElement(listsContainer);
        renderLists();

        const selectedList = lists.find(list => list.id === selectedListId);

        if (selectedList) {
            listTitleElement.innerText = selectedList.name;

            selectedList.tasks.forEach(task => {
                if (task.complete == true) {
                    atLeastOne = true;

                } else {
                    console.log("no completed tasks found!");
                }

            })

            // render filter
            const filter = document.getElementsByClassName('filter').length;

            if (atLeastOne && !filter) {
                const h2 = document.querySelector('h2');
                const filter = document.createElement('label');
                filter.textContent = "see only incomplete tasks";
                filter.className = 'filter';
                filter.style.float = 'right';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                filter.appendChild(checkbox);
                div.insertBefore(filter, h2);
            }

            renderTaskCount(selectedList);
            clearElement(tasksContainer);
            renderTasks(selectedList);
        }


    }

    function renderTaskCount(selectedList) {
        if (selectedList) {
            let incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length;
            const taskString = (incompleteTaskCount === 1) ? "task" : "tasks";
            listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`;
        }
    }

    function renderLists() {
        lists.forEach(list => {
            const listElement = document.createElement('li');
            listElement.dataset.listId = list.id;
            listElement.classList.add("list-name");
            listElement.innerText = list.name;

            if (list.id === selectedListId)
                listElement.classList.add('active-list');

            listsContainer.appendChild(listElement);
        })
    }

    function renderTasks(selectedList) {
        selectedList.tasks.forEach(task => {
            const taskElement = document.importNode(taskTemplate.content, true);
            const checkbox = taskElement.querySelector('input');
            checkbox.id = task.id;
            checkbox.checked = task.complete;
            const label = taskElement.querySelector('span');
            const description = taskElement.querySelector('pre');
            label.htmlFor = task.id;
            label.append(task.name)
            description.append(task.description);

            if (task.complete) {
                const li = taskElement.querySelector('li');
                li.className = 'responded';
            }

            tasksContainer.appendChild(taskElement);
        })
    }

    function clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild)
        }
    }

    render();

    //=====LISTS LOGIC=====//
    function addList(text) {

        function createList(text) {
            return { id: Date.now().toString(), name: text, tasks: [] }
        }
        return createList(text);

    }

    // ADD LIST LISTENER
    listForm.addEventListener('submit', (e) => {
        e.preventDefault(); // prevents page refresh
        const text = listInput.value;
        if (text == null || text === '') return;

        listInput.value = ''; // clear input field
        let listObj = addList(text);
        lists.push(listObj); // adds object to list array
        saveAndRender(); // output array of objects

    });

    //=====TASKS LOGIC=====//
    function addTask(text) {

        function createTask(text) {
            return { id: Date.now().toString(), name: text, description: '', completed: false }
        }
        return createTask(text);

    }

    // ADD TASK
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskName = input.value;
        if (taskName == null || taskName === '') return
        input.value = '';
        const taskObj = addTask(taskName);
        const selectedList = lists.find(list => list.id === selectedListId);
        selectedList.tasks.push(taskObj);
        saveAndRender();

    });

    //======LIST EVENT LISTENER========//
    listsContainer.addEventListener('click', (e) => {
        if (e.target.tagName.toLowerCase() === 'li') {
            selectedListId = e.target.dataset.listId;
            saveAndRender();
        }
    })

    //======DELETE BUTTON LISTENER======//
    deleteListButton.addEventListener('click', (e) => {
        lists = lists.filter(list => list.id !== selectedListId)
        selectedListId = null;
        saveAndRender();
    })

    clearCompleteTasksButton.addEventListener('click', e => {
        const selectedList = lists.find(list => list.id === selectedListId);
        selectedList.tasks = selectedList.tasks.filter(task => !task.complete)
        saveAndRender();
    })

    //======COMPLETED CHECKBOX LISTENER==========//
    tasksContainer.addEventListener('click', e => {
        let buttonText = '';
        try {
            console.log("Tag: " + e.target.parentNode.children[3].innerText);
            buttonText = e.target.parentNode.children[3].innerText;
        } catch (e) {
            console.log(e);
        }

        if (e.target.tagName.toLowerCase() === 'input' && buttonText !== 'save') {
            const selectedList = lists.find(list => list.id === selectedListId);
            const selectedTask = selectedList.tasks.find(task => task.id === e.target.id);
            if (selectedTask)
                selectedTask.complete = e.target.checked;
            const li = e.target.parentNode.parentNode;
            if (e.target.checked) {
                const audio = new Audio();
                audio.src = "https://www.fesliyanstudios.com/play-mp3/5259";
                li.className = 'responded';
                audio.play();
            } else {
                li.className = '';
            }

            save();
            renderTaskCount(selectedList);

            //----Render Modal----//
            renderModalQueueSound();
        }
    })

    const modal = document.querySelector('.modal');
    const hideIcon = document.querySelector('.modal #hideIcon');
    const hideButton = document.querySelector('.modal #hideButton');
    
    function renderModalQueueSound() {
        const audio = new Audio();

        audio.src = "https://www.fesliyanstudios.com/play-mp3/6981";
        //audio.src = "https://freesound.org/s/320657";
        let allComplete = true;
        const selectedList = lists.find(list => list.id === selectedListId);
        selectedList.tasks.forEach(task => {
            console.log("Completed: " + task.complete + " | " + task.name);
            if (!task.complete) {
                allComplete = false;
            }
        })
        if (allComplete) {
            audio.play();
            modal.id = 'show';
            //alert("All tasks complete!");
        }

        console.log("All Complete: " + allComplete);
    }

    hideIcon.addEventListener('click', hideModal);

    hideButton.addEventListener('click', hideModal);

    function hideModal() {
        modal.id = 'hide';
    }

    //=======HIDE/SHOW FILTER======//
    tasksContainer.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            let liList = document.getElementsByClassName('responded');

            if (liList.length < 1) {
                atLeastOne = false;
                const filter = div.firstElementChild;
                div.removeChild(filter);

            } else {

                if (liList.length === 1 && !atLeastOne) {
                    const h2 = document.querySelector('h2');
                    const filter = document.createElement('label');
                    filter.textContent = "see only incomplete tasks";
                    filter.className = 'filter';
                    filter.style.float = 'right';
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    filter.appendChild(checkbox);
                    div.insertBefore(filter, h2);
                }
                atLeastOne = true;
            }
        }

    });

    //======DRAG LISTENERS=========//
    const draggables = document.querySelectorAll('.draggable');

    draggables.forEach(draggable => {

        draggable.addEventListener('dragstart', () => {
            console.log("Dragging...");
            //draggable.className = 'dragging';
            draggable.classList.add('dragging');
        })

        draggable.addEventListener('dragend', () => {
            console.log("Dragging stopped...");
            draggable.classList.remove('dragging');
        })

    })

    tasksContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(tasksContainer, e.clientX, e.clientY);
        const draggable = document.querySelector('.dragging');
        console.log("draggable obj id: "+draggable.children[2].firstElementChild.id);
        console.log("After element: "+afterElement.children[2].firstElementChild.id);
        if (afterElement == null || afterElement == undefined) {
            tasksContainer.appendChild(draggable);
            //save();
            //saveAndRender();
        } else {
            //tasksContainer.appendChild(draggable, afterElement);
            
            //const selectedTask = selectedList.tasks.find(task => task.id === draggable.children[2].firstElementChild.id);
            tasksContainer.insertBefore(draggable, afterElement);
            
            save();
            //console.log("appending...");
            //saveAndRender();
        }
        const selectedList = lists.find(list => list.id === selectedListId);
            selectedList.tasks.forEach(task => {
                console.log(task.name);
            })
    })

    function getDragAfterElement(container, x, y) {
        const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            console.log(box);
            const offsetX = x - box.left - box.width / 2;
            const offsetY = y - box.top - box.height / 2;
            
            if ((offsetX < 0 && offsetX > closest.offsetX) && (offsetY < 0 && offsetY > closest.offsetY)) {
                return { offsetX: offsetX, offsetY: offsetY, element: child };
            } else {
                return closest;
            }
        }, {offsetX: Number.NEGATIVE_INFINITY,offsetY: Number.NEGATIVE_INFINITY}).element;
    }
    

    //======TASK BUTTON LISTENERS========//
    ul.addEventListener('click', (e) => {

        if (e.target.tagName === "BUTTON") {
            const button = e.target;
            const li = button.parentNode;
            //const ul = li.parentNode;

            if (button.textContent === "remove") {
                const selectedList = lists.find(list => list.id === selectedListId);
                const selectedTask = selectedList.tasks.find(task => task.id === e.target.parentNode.children[2].firstElementChild.id);
                const itemIndex = selectedList.tasks.indexOf(selectedTask);
                selectedList.tasks.splice(itemIndex, 1);
                saveAndRender();

            } else if (button.textContent === "edit") {
                const span = li.firstElementChild;
                const pre = li.children[1];
                const input = document.createElement('input');
                input.type = 'text';
                input.value = span.textContent;
                const description = document.createElement('textarea');
                description.rows = 4;
                description.cols = 40;
                description.wrap = 'soft';

                if (pre.textContent == '')
                    description.placeholder = "Description:";
                else
                    description.value = pre.textContent;

                button.textContent = 'save';
                li.insertBefore(input, span);
                li.insertBefore(description, pre);
                li.removeChild(span);
                li.removeChild(pre);

            } else if (button.textContent === 'save') {
                const selectedList = lists.find(list => list.id === selectedListId);
                const selectedTask = selectedList.tasks.find(task => task.id === e.target.parentNode.children[2].firstElementChild.id);
                const input = li.firstElementChild;
                const desc = li.children[1];
                const span = document.createElement('span');
                const pre = document.createElement('pre');
                span.textContent = input.value;
                pre.textContent = desc.value;
                button.textContent = 'edit';
                li.insertBefore(span, input);
                li.insertBefore(pre, desc);
                li.removeChild(input);
                li.removeChild(desc);
                selectedTask.name = span.textContent;
                selectedTask.description = pre.textContent;
                saveAndRender();

            } else {
                console.log('something is wrong!!');
            }

        }
    });

    //=======FILTER LOGIC==========//
    div.addEventListener('change', (e) => {
        const input = e.target;
        const label = input.parentNode;
        const liList = ul.children;
        if (label.className === 'filter') {
            if (input.checked) {
                for (let i = 0; i < liList.length; i++) {
                    if (liList[i].className == 'responded') {
                        liList[i].style.display = 'none';
                    }
                }
            } else {
                for (let i = 0; i < liList.length; i++) {
                    liList[i].style.display = 'block';
                }
            }
        }

    });

    function saveAndRender() {
        save();
        render();
    }

    function save() {
        localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
        localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
    }
});