 document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('registrar');
    const input = form.querySelector('input');
    const ul = document.getElementById('invitedList');
    const button = document.createElement('button');
    const div = document.querySelector('.main');
    let atLeastOne = false;

    function createBtn(nm, classNm='') {
    const button = document.createElement('button');
    button.textContent = nm;
    button.className = classNm;
    return button;
    }

    function addInvitee(text) {

        function createElement(elementNm, prop='', val='') {
            const element = document.createElement(elementNm);
            element[prop] = val;
            return element;
        }

        const label = createElement('label', 'textContent', 'Completed');
        const input = createElement('input', 'type', 'checkbox');
        const edit = createBtn('edit', 'edit');
        const remove = createBtn('remove', 'remove');

        function appendToLI(elementNm, prop='', val='') {
            const li = createElement('li');
            const element = createElement(elementNm, prop, val);
            li.appendChild(element);

            label.appendChild(input);
            li.appendChild(label);
            li.appendChild(edit);
            li.appendChild(remove);
            return li;
        }

        return appendToLI('span', 'textContent', text);
        
    }

    form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value;
    input.value = '';
    console.log('just added a task!!');
    const li = addInvitee(text);
    ul.appendChild(li);
    });

    ul.addEventListener('change', (e) => {
    if(e.target.type === 'checkbox') {  
        let liList = document.getElementsByClassName('responded');
        const li = e.target.parentNode.parentNode;
        
        if(li.className === 'responded') {
        li.className = '';
        if(liList.length < 1) {
            atLeastOne = false;
            const filter = div.firstElementChild;
            div.removeChild(filter);
            console.log("back to false.");
        }
        } else {
        li.className = 'responded';
        if(liList.length === 1 && !atLeastOne) { 
            const h2 = document.querySelector('h2'); 
            const filter = document.createElement('label');
            filter.textContent = "see only completed tasks";
            filter.className = 'filter';
            filter.style.float = 'right';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            filter.appendChild(checkbox);
            div.insertBefore(filter, h2);
            console.log('this is the first one!');
        }
        atLeastOne = true;
        }
    }
    
    });

    ul.addEventListener('click', (e) => {
    
    if(e.target.tagName === "BUTTON") {
        const button = e.target;
        const li = button.parentNode;
        const ul = li.parentNode;
        
        if(button.textContent === "remove") {
        ul.removeChild(li);
        } else if(button.textContent === "edit") {
        const span = li.firstElementChild;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = span.textContent;
        button.textContent = 'save';
        li.insertBefore(input, span);
        li.removeChild(span);
        } else if(button.textContent === 'save') {
        const input = li.firstElementChild;
        const span = document.createElement('span');
        span.textContent = input.value;
        button.textContent = 'edit';
        
        li.insertBefore(span, input);
        li.removeChild(input);
        } else {
        console.log('something is wrong!!');
        }
        
    }
    });

    div.addEventListener('change', (e) => {
    const input = e.target;
    const label = input.parentNode;
    const liList = ul.children;
    if(label.className === 'filter') {
        if(input.checked) {
        for(let i=0; i < liList.length; i++) {
            if(liList[i].className !== 'responded') {
            liList[i].style.display = 'none';
            }
        }
        console.log("you've filtered the list!!!");
        } else {
        for(let i=0; i < liList.length; i++) {
            liList[i].style.display = 'block';
        }
        console.log("You've deselected the filter.");
        }
    }
    });
});