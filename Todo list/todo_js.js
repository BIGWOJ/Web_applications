const taskList = document.getElementById('taskList');
const searchInput = document.getElementById('search');
const newTaskInput = document.getElementById('newTask');
const taskDateInput = document.getElementById('taskDate');
const addTaskBtn = document.getElementById('addTaskBtn');


addTaskBtn.onclick = () => console.log('Button clicked');

// Załadowanie zadań z LocalStorage po załadowaniu strony
document.addEventListener('DOMContentLoaded', loadTasks);

// Obsługa kliknięcia przycisku "Dodaj zadanie"
addTaskBtn.addEventListener('click', addTask);

// Obsługa wyszukiwania
searchInput.addEventListener('input', searchTasks);

// Dodawanie zadania
function addTask() {
    console.log('addTask');
    const taskText = newTaskInput.value.trim();
    const taskDate = taskDateInput.value;

    // Walidacja zadania
    if (taskText.length < 3 || taskText.length > 255) {
        alert('Zadanie musi mieć od 3 do 255 znaków.');
        return;
    }

    const task = {
        text: taskText,
        date: taskDate || null,
        id: Date.now()
    };

    // Zapisanie zadania do LocalStorage
    saveTaskToLocalStorage(task);

    // Wyczyszczenie pola tekstowego
    newTaskInput.value = '';
    taskDateInput.value = '';

    // Dodanie zadania do listy
    renderTask(task);
}

// Renderowanie zadania na liście
function renderTask(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;
    li.innerHTML = `
        <span class="task-text">${task.text}</span>
        ${task.date ? `<span class="task-date"> ${new Date(task.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>` : ''}
        <button class="change_date">📅</button>
        <button class="delete-btn">🗑️</button>`;

        // Obsługa kliknięcia na zadanie (edycja)
        li.querySelector('.task-text').addEventListener('click', () => editTask(li));

        // Obsługa usuwania zadania
        li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

        li.querySelector('.change_date').addEventListener('click', () => change_date(li));

        taskList.appendChild(li);
}

// Zapisywanie zadania do LocalStorage
function saveTaskToLocalStorage(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Ładowanie zadań z LocalStorage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => renderTask(task));
}

// Usuwanie zadania
function deleteTask(id) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    document.querySelector(`li[data-id="${id}"]`).remove();
}

// Edytowanie zadania
function editTask(li) {
    const taskTextEl = li.querySelector('.task-text');
    const oldText = taskTextEl.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = oldText;
    li.replaceChild(input, taskTextEl);

    // Zapisanie zmian po kliknięciu poza pole edycji
    input.addEventListener('blur', () => {
        const newText = input.value.trim();
        if (newText.length >= 3 && newText.length <= 255) {
            taskTextEl.textContent = newText;
            li.replaceChild(taskTextEl, input);

            // Aktualizacja w LocalStorage
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            const task = tasks.find(task => task.id === parseInt(li.dataset.id));
            task.text = newText;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        } else {
            alert('Zadanie musi mieć od 3 do 255 znaków.');
            taskTextEl.textContent = oldText;
            li.replaceChild(taskTextEl, input);
        }
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            input.blur();
        }
    });
    input.focus();
}

function change_date(li) {
    const taskDateEl = li.querySelector('.task-date');
    const oldDateText = taskDateEl.textContent.trim();

    // Konwersja daty z formatu DD.MM.YYYY na YYYY-MM-DD do input.value
    const [day, month, year] = oldDateText.split('.'); // Zakładamy, że data jest w formacie DD.MM.YYYY
    const oldDate = `${year}-${month}-${day}`;

    const input = document.createElement('input');
    input.type = 'date';
    input.value = oldDate; // Ustawienie wartości inputa na YYYY-MM-DD

    li.replaceChild(input, taskDateEl);

    // Zapisanie zmian po kliknięciu poza pole edycji
    input.addEventListener('blur', () => {
        const newDate = input.value; // Nowa data w formacie YYYY-MM-DD
        if (newDate) {
            // Konwersja z formatu YYYY-MM-DD na DD.MM.YYYY
            const [year, month, day] = newDate.split('-');
            const formattedDate = `${day}.${month}.${year}`;

            taskDateEl.textContent = `${formattedDate}`;
            li.replaceChild(taskDateEl, input);

            // Aktualizacja w LocalStorage
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            const task = tasks.find(task => task.id === parseInt(li.dataset.id));
            task.date = newDate; // Przechowujemy datę w formacie YYYY-MM-DD do łatwego odczytu
            localStorage.setItem('tasks', JSON.stringify(tasks));
        } else {
            alert('Wybierz poprawną datę.');
            li.replaceChild(taskDateEl, input);
        }
    });

    // Obsługa klawisza Enter do zapisania
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            input.blur();
        }
    });

    input.focus();
}



// Wyszukiwanie zadań
function searchTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    const tasks = document.querySelectorAll('#taskList li');

    tasks.forEach(task => {
        const taskTextEl = task.querySelector('.task-text');
        const taskText = taskTextEl.textContent.toLowerCase();

        if (searchTerm.length >= 2) {
            if (taskText.includes(searchTerm)) {
                task.style.display = 'flex'; // Upewniamy się, że element jest wyświetlany w stylu flex
                const originalText = taskTextEl.textContent;

                // Zachowaj oryginalny tekst w atrybucie data, aby móc go przywrócić
                if (!taskTextEl.dataset.originalText) {
                    taskTextEl.dataset.originalText = originalText;
                }

                // Wyróżnij frazę bez zmiany struktury HTML całego tekstu
                const highlightedText = originalText.replace(
                    new RegExp(`(${searchTerm})`, 'gi'),
                    match => `<mark>${match}</mark>`
                );
                taskTextEl.innerHTML = highlightedText;
            } else {
                task.style.display = 'none';
            }
        } else {
            // Przywróć oryginalny tekst po usunięciu szukanej frazy
            task.style.display = 'flex';
            taskTextEl.innerHTML = taskTextEl.dataset.originalText || taskTextEl.textContent;
        }
    });
}

