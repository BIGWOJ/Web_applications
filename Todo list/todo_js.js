const task_list = document.getElementById('task_list');
const search_input = document.getElementById('search');
const new_task_input = document.getElementById('new_task');
const task_date_input = document.getElementById('task_date');
const add_task_button = document.getElementById('add_task_button');

//Initially loading tasks from local storage
document.addEventListener('DOMContentLoaded', load_tasks_from_local_storage);

//Adding task after clicking add task button
add_task_button.addEventListener('click', add_task);

//Searching tasks after typing in search input
search_input.addEventListener('input', search_tasks);

function add_task() {
    const task_text = new_task_input.value.trim();
    const task_date = task_date_input.value;

    if (task_text.length < 3 || task_text.length > 255) {
        alert("Task description should be 3-255 characters long.");
        return;
    }

    const task = {
        text: task_text,
        date: task_date || null,
        //Date.now returns milliseconds since 01.01.1970
        id: Date.now()
    };

    save_task_to_local_storage(task);

    //Clearing input fields after adding task
    new_task_input.value = '';
    task_date_input.value = '';

    write_task(task);
}

function write_task(task) {
    const new_task = document.createElement('single_task');
    new_task.dataset.id = task.id;
    new_task.innerHTML = `
        <span class="task_text">${task.text}</span>
        ${task.date ? `<span class="task_date"> ${new Date(task.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>` : ''}
        <button class="edit_task_date">📅</button>
        <button class="delete_button">🗑️</button>`;

    new_task.querySelector('.task_text').addEventListener('click', () => edit_task_text(new_task));
    new_task.querySelector('.delete_button').addEventListener('click', () => delete_task(task.id));
    new_task.querySelector('.edit_task_date').addEventListener('click', () => edit_task_date(new_task));
    task_list.appendChild(new_task);
}

function save_task_to_local_storage(task) {
    //Parse changes string into object
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    //Stringify changes object into string to correctly save it in local storage
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function load_tasks_from_local_storage() {
    //Getting tasks from local storage or empty array if there are no tasks
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => write_task(task));
}

function delete_task(id) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    //Filtering out task with id equal to id of deleting task
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    //Deleting based on id
    document.querySelector(`single_task[data-id="${id}"]`).remove();
}

function edit_task_text(editing_task) {
    const task_text_html = editing_task.querySelector('.task_text');
    const old_text = task_text_html.textContent;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = old_text;

    input.className = 'edit_task_text_input';
    input.style.width = `${task_text_html.offsetWidth}px`;

    editing_task.replaceChild(input, task_text_html);

    //Saving changes after clicking outside of the input field
    input.addEventListener('blur', () => {
        const new_text = input.value.trim();
        if (new_text.length >= 3 && new_text.length <= 255) {
            task_text_html.textContent = new_text;
            editing_task.replaceChild(task_text_html, input);

            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            //Finding task with id equal to id of editing task
            //ParseInt converts string into int
            const task = tasks.find(task => task.id === parseInt(editing_task.dataset.id));
            task.text = new_text;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        else {
            alert("Task description should be 3-255 characters long.");
            task_text_html.textContent = old_text;
            editing_task.replaceChild(task_text_html, input);
        }
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            input.blur();
        }
    });

    input.focus();
}

function edit_task_date(editing_task) {
    let task_date_html = editing_task.querySelector('.task_date')

    //Adding date if it doesn't exist
    if (!task_date_html) {
        task_date_html = document.createElement('span');
        task_date_html.className = 'task_date';
        //Adding date before edit button
        editing_task.insertBefore(task_date_html, editing_task.querySelector('.edit_task_date'));
    }

    const old_date = task_date_html.textContent.trim();
    const input = document.createElement('input');
    input.type = 'date';
    input.value = old_date;

    editing_task.replaceChild(input, task_date_html);

    input.addEventListener('blur', () => {
        const new_date = input.value;
        if (new_date) {
            const [year, month, day] = new_date.split('-');
            //Input format is DD-MM-YYYY, so it needs to be changed to DD.MM.YYYY
            const formatted_date = `${day}.${month}.${year}`;

            task_date_html.textContent = `${formatted_date}`;
            editing_task.replaceChild(task_date_html, input);

            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            const task = tasks.find(task => task.id === parseInt(editing_task.dataset.id));
            task.date = new_date;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        //Deleting date if input is empty
        else {
            task_date_html.textContent = '';
            editing_task.replaceChild(task_date_html, input);

            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            const task = tasks.find(task => task.id === parseInt(editing_task.dataset.id));
            task.date = null;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            input.blur();
        }
    });

    input.focus();
}

function search_tasks() {
    const searching_term = search_input.value.toLowerCase();
    const tasks = document.querySelectorAll('single_task');

    tasks.forEach(task => {
        const task_text_html = task.querySelector('.task_text');
        const task_text = task_text_html.textContent.toLowerCase();

        if (searching_term.length >= 2) {
            if (task_text.includes(searching_term)) {
                task.style.display = 'flex';
                const original_text = task_text_html.textContent;

                if (!task_text_html.dataset.original_text) {
                    task_text_html.dataset.original_text = original_text;
                }

                const highlighted_text = original_text.replace(
                    //g - global, i - case insensitive
                    new RegExp(`(${searching_term})`, 'gi'),
                    match => `<mark>${match}</mark>`
                );
                task_text_html.innerHTML = highlighted_text;
            }

            else {
                task.style.display = 'none';
            }
        }

        else {
            task.style.display = 'flex';
            task_text_html.innerHTML = task_text_html.dataset.original_text || task_text_html.textContent;
        }
    });
}