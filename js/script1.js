async function loadLtTasks() {
   try {
        const response = await axios.get('http://localhost:3000/get-lt-tasks');
        const tasks = response.data;

        const taskList = document.getElementById('additionalTaskList');
        taskList.innerHTML = ''; // Clear existing content
        if (tasks && tasks.length > 0) {
            //taskIdCounter = tasks.length + 1;
            tasks.forEach((task,index) => {
                const taskItem = createLtTaskItem(task);
                // Check if the task is completed
                if (task.completed) {
                    // Apply style with strike-through
                    const taskDescription = taskItem.querySelector('.taskItem span');
                    taskDescription.style.textDecoration = 'line-through';
                }

                taskList.appendChild(taskItem);
            });
            console.log("Long Term Tasks Loaded");
        } else {
            const noTasksMessage = document.createElement('p');
            noTasksMessage.textContent = 'No tasks added.';
            taskList.appendChild(noTasksMessage);
            console.log("Cannot Load Tasks. No Tasks Added")
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


async function addAdditionalTask() {
    const taskInput = document.getElementById('additionalTaskInput');
    const task = taskInput.value.trim();

    if (task !== '') {
        try {
            const currentTime = new Date().toLocaleTimeString();

            // Send the task to the backend
            await sendRequest('add-lt-task', { task });

            // Fetch and load tasks after adding a task
            await loadTasks();

            taskInput.value = '';
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

function createLtTaskItem(task) {
    const taskItem = document.createElement('div');
    taskItem.className = 'taskItem';
    taskItem.setAttribute('data-task-id', task.id); // Add data-task-id attribute

    const taskText = document.createElement('span');
    taskText.textContent = task.description;
    taskText.onclick = () => enableTaskEditing(task.id); // Enable editing on click

    const taskActions = document.createElement('div');
    taskActions.className = 'taskActions';

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.setAttribute('data-task-id', task.id);
    removeButton.onclick = removeTask;

    const completeButton = document.createElement('button');
    completeButton.textContent = 'Complete';
    completeButton.setAttribute('data-task-id', task.id);
    completeButton.onclick = completeTask;

    taskActions.appendChild(removeButton);
    taskActions.appendChild(completeButton);

    taskItem.appendChild(taskText);
    taskItem.appendChild(taskActions);

    return taskItem;
}

window.onload = loadLtTasks;
