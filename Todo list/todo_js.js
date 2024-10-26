const task_list = document.getElementById('task_list');
const search_input = document.getElementById('search');
const new_task_input = document.getElementById('new_task');
const task_date_input = document.getElementById('task_date');
const add_task_button = document.getElementById('add_task_button');

document.addEventListener('DOMContentLoaded', load_tasks);
add_task_button.addEventListener('click', add_task);
search_input.addEventListener('input', search_tasks);

function add_task() {
    console.log('add_task');
    const task_text = new_task_input.value.trim();
    const task_date = task_date_input.value;

    if (task_text.length < 3 || task_text.length > 255) {
        alert('Zadanie musi mieć od 3 do 255 znaków.');
        return;
    }

    const task = {
        text: task_text,
        date: task_date || null,
        id: Date.now()
    };

    save_task_to_local_storage(task);

    //Wyczyszczenie pola tekstowego
    new_task_input.value = '';
    task_date_input.value = '';

    write_task(task);
}

//
function write_task(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;
    li.innerHTML = `
        <span class="task-text">${task.text}</span>
        ${task.date ? `<span class="task-date"> ${new Date(task.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>` : ''}
        <button class="edit_task_date">📅</button>
        <button class="delete-btn">🗑️</button>`;

    li.querySelector('.task-text').addEventListener('click', () => edit_task_text(li));
    li.querySelector('.delete-btn').addEventListener('click', () => delete_task(task.id));
    li.querySelector('.edit_task_date').addEventListener('click', () => edit_task_date(li));
    task_list.appendChild(li);
}

function save_task_to_local_storage(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function load_tasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => write_task(task));
}

function delete_task(id) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    document.querySelector(`li[data-id="${id}"]`).remove();
}

function edit_task_text(li) {
    const task_textEl = li.querySelector('.task-text');
    const oldText = task_textEl.textContent;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = oldText;

    //Dopasowanie stylów
    input.className = 'task-edit-input'; // Klasa dla stylów input
    input.style.width = `${task_textEl.offsetWidth}px`; // Dopasowanie szerokości

    li.replaceChild(input, task_textEl);

    //Zapisanie zmian po kliknięciu poza pole edycji
    input.addEventListener('blur', () => {
        const newText = input.value.trim();
        if (newText.length >= 3 && newText.length <= 255) {
            task_textEl.textContent = newText;
            li.replaceChild(task_textEl, input);

            // Aktualizacja w LocalStorage
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            const task = tasks.find(task => task.id === parseInt(li.dataset.id));
            task.text = newText;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        } else {
            alert('Zadanie musi mieć od 3 do 255 znaków.');
            task_textEl.textContent = oldText;
            li.replaceChild(task_textEl, input);
        }
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            input.blur();
        }
    });

    input.focus();
}

function edit_task_date(li) {
    const task_dateEl = li.querySelector('.task-date')
    if(!task_dateEl) {
        console.log('Brak daty');
        return;
    }

    const oldDateText = task_dateEl.textContent.trim();

    const [day, month, year] = oldDateText.split('.'); // Zakładamy, że data jest w formacie DD.MM.YYYY
    const oldDate = `${year}-${month}-${day}`;

    const input = document.createElement('input');
    input.type = 'date';
    input.value = oldDate; // Ustawienie wartości inputa na YYYY-MM-DD

    li.replaceChild(input, task_dateEl);

    //Zapisanie zmian po kliknięciu poza pole edycji
    input.addEventListener('blur', () => {
        const newDate = input.value;
        if (newDate) {
            const [year, month, day] = newDate.split('-');
            const formattedDate = `${day}.${month}.${year}`;

            task_dateEl.textContent = `${formattedDate}`;
            li.replaceChild(task_dateEl, input);

            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            const task = tasks.find(task => task.id === parseInt(li.dataset.id));
            task.date = newDate; // Przechowujemy datę w formacie YYYY-MM-DD do łatwego odczytu
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        else {
            alert('Wybierz poprawną datę.');
            li.replaceChild(task_dateEl, input);
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
    const searchTerm = search_input.value.toLowerCase();
    const tasks = document.querySelectorAll('#task_list li');

    tasks.forEach(task => {
        const task_textEl = task.querySelector('.task-text');
        const task_text = task_textEl.textContent.toLowerCase();

        if (searchTerm.length >= 2) {
            if (task_text.includes(searchTerm)) {
                task.style.display = 'flex';
                const originalText = task_textEl.textContent;

                if (!task_textEl.dataset.originalText) {
                    task_textEl.dataset.originalText = originalText;
                }

                const highlightedText = originalText.replace(
                    new RegExp(`(${searchTerm})`, 'gi'),
                    match => `<mark>${match}</mark>`
                );
                task_textEl.innerHTML = highlightedText;
            }

            else {
                task.style.display = 'none';
            }
        }

        else {
            //Poprzednie formatowanie po usunięciu tekstu z pola wyszukiwania
            task.style.display = 'flex';
            task_textEl.innerHTML = task_textEl.dataset.originalText || task_textEl.textContent;
        }
    });
}

