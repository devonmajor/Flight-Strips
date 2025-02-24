document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('close-btn');
    const openBtn = document.getElementById('open-btn');
    const mainContent = document.getElementById('main-content');

    // Toggle sidebar
    closeBtn.addEventListener('click', () => {
        sidebar.classList.add('closed');
        mainContent.classList.add('sidebar-closed');
        openBtn.style.display = 'block';
    });

    openBtn.addEventListener('click', () => {
        sidebar.classList.remove('closed');
        mainContent.classList.remove('sidebar-closed');
        openBtn.style.display = 'none';
    });

    const taskForm = document.getElementById('task-form');
    const projectInput = document.getElementById('project-input');
    const clientInput = document.getElementById('client-input');
    const workInput = document.getElementById('work-input');
    const dateInput = document.getElementById('date-input');
    const flightStripsContainer = document.getElementById('flight-strips-container');

    // Load tasks from local storage (or backend API)
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Function to calculate the difference in days between two dates
    function getDateDifference(taskDate) {
        const currentDate = new Date();
        const taskDateObj = new Date(taskDate);
        const timeDifference = taskDateObj - currentDate;
        return Math.ceil(timeDifference / (1000 * 60 * 60 * 24)); // Convert to days
    }

    // Function to determine the color based on the date difference
    function getColorForDateDifference(days) {
        if (days >= 21) {
            return 'green'; // 3 weeks or more
        } else if (days >= 14) {
            return 'yellow'; // 2 weeks
        } else if (days >= 7) {
            return 'orange'; // 1 week
        } else {
            return 'red'; // Less than 1 week
        }
    }

    // Function to calculate completion percentage
    function calculateCompletion(subtasks) {
        if (subtasks.length === 0) return 0;
        const completed = subtasks.filter(subtask => subtask.completed).length;
        return Math.round((completed / subtasks.length) * 100);
    }

    // Render tasks
    function renderTasks() {
        flightStripsContainer.innerHTML = '';
        tasks.forEach((task, index) => {
            const flightStrip = document.createElement('div');
            flightStrip.className = 'flight-strip';

            // Calculate date difference and get color
            const daysDifference = getDateDifference(task.date);
            const color = getColorForDateDifference(daysDifference);
            flightStrip.classList.add(color); // Add the color class

            flightStrip.innerHTML = `
                <div class="details">
                    <span><strong>Project/Site:</strong> ${task.project}</span>
                    <span><strong>Client:</strong> ${task.client}</span>
                    <span><strong>Required Work:</strong> ${task.work}</span>
                    <span><strong>Date:</strong> ${task.date}</span>
                </div>
                <div class="actions">
                    <button class="edit" onclick="editTask(${index})">Edit</button>
                    <button onclick="deleteTask(${index})">Delete</button>
                </div>
                <button class="toggle-subtasks" onclick="toggleSubtasks(${index})">▼ Subtasks</button>
                <div class="subtasks" id="subtasks-${index}">
                    <div class="add-subtask">
                        <input type="text" placeholder="Add a subtask" id="subtask-input-${index}">
                        <button onclick="addSubtask(${index})">Add</button>
                    </div>
                    <div id="subtasks-list-${index}"></div>
                    <div class="completion" id="completion-${index}"></div>
                </div>
            `;
            flightStripsContainer.appendChild(flightStrip);

            // Render subtasks
            renderSubtasks(index);
        });
    }

    // Render subtasks for a specific task
    function renderSubtasks(index) {
        const subtasksList = document.getElementById(`subtasks-list-${index}`);
        const completionElement = document.getElementById(`completion-${index}`);
        const task = tasks[index];

        // Clear existing subtasks
        subtasksList.innerHTML = '';

        // Render each subtask
        task.subtasks.forEach((subtask, subIndex) => {
            const subtaskElement = document.createElement('div');
            subtaskElement.className = `subtask ${subtask.completed ? 'completed' : ''}`;
            subtaskElement.innerHTML = `
                <input type="checkbox" ${subtask.completed ? 'checked' : ''} onchange="toggleSubtask(${index}, ${subIndex})">
                <span>${subtask.text}</span>
            `;
            subtasksList.appendChild(subtaskElement);
        });

        // Update completion percentage
        const completionPercentage = calculateCompletion(task.subtasks);
        completionElement.textContent = `Completion: ${completionPercentage}%`;
    }

    // Add task
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const task = {
            project: projectInput.value.trim(),
            client: clientInput.value.trim(),
            work: workInput.value.trim(),
            date: dateInput.value,
            subtasks: []
        };
        if (task.project && task.client && task.work && task.date) {
            tasks.push(task);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            taskForm.reset();
            renderTasks();
        }
    });

    // Delete task
    window.deleteTask = (index) => {
        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    };

    // Edit task
    window.editTask = (index) => {
        const task = tasks[index];
        const newProject = prompt('Edit Project/Site:', task.project);
        const newClient = prompt('Edit Client:', task.client);
        const newWork = prompt('Edit Required Work:', task.work);
        const newDate = prompt('Edit Date:', task.date);

        if (newProject !== null && newClient !== null && newWork !== null && newDate !== null) {
            tasks[index] = {
                ...task,
                project: newProject.trim(),
                client: newClient.trim(),
                work: newWork.trim(),
                date: newDate.trim()
            };
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderTasks();
        }
    };

    // Toggle subtasks section
    window.toggleSubtasks = (index) => {
        const subtasksSection = document.getElementById(`subtasks-${index}`);
        subtasksSection.classList.toggle('visible');
    };

    // Add subtask
    window.addSubtask = (index) => {
        const subtaskInput = document.getElementById(`subtask-input-${index}`);
        const subtaskText = subtaskInput.value.trim();
        if (subtaskText) {
            tasks[index].subtasks.push({ text: subtaskText, completed: false });
            localStorage.setItem('tasks', JSON.stringify(tasks));
            renderSubtasks(index); // Only update subtasks section
            subtaskInput.value = ''; // Clear input field
        }
    };

    // Toggle subtask completion
    window.toggleSubtask = (taskIndex, subtaskIndex) => {
        tasks[taskIndex].subtasks[subtaskIndex].completed = !tasks[taskIndex].subtasks[subtaskIndex].completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderSubtasks(taskIndex); // Only update subtasks section
    };

    // Enable drag-and-drop
    const sortable = new Sortable(flightStripsContainer, {
        animation: 150,
        onEnd: () => {
            const newTasks = [];
            flightStripsContainer.querySelectorAll('.flight-strip').forEach((el) => {
                const details = el.querySelector('.details');
                const subtasks = Array.from(el.querySelectorAll('.subtask span')).map(span => ({
                    text: span.innerText,
                    completed: span.parentElement.classList.contains('completed')
                }));
                newTasks.push({
                    project: details.children[0].innerText.replace('Project/Site: ', ''),
                    client: details.children[1].innerText.replace('Client: ', ''),
                    work: details.children[2].innerText.replace('Required Work: ', ''),
                    date: details.children[3].innerText.replace('Date: ', ''),
                    subtasks: subtasks
                });
            });
            tasks = newTasks;
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    });

    // Initial render
    renderTasks();
});