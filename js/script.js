let taskIdCounter = 0;

async function addTask() {
    const taskInput = document.getElementById('taskInput');
    const task = taskInput.value.trim();

    if (task !== '') {
        try {
            const currentTime = new Date().toLocaleTimeString();
            const taskId = generateTaskId();

            await sendRequest('add-task', { taskId, task, timeAdded: currentTime, completed: false });

            const taskItem = createTaskItem({ id: taskId, task });

            document.getElementById('taskList').appendChild(taskItem);

            taskInput.value = '';
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

function generateTaskId() {
    const today = new Date();
    const formattedDate = `${today.getDate()}${today.getMonth() + 1}${today.getFullYear()}`;

    // Check if taskIdCounter is defined and a number
    if (typeof taskIdCounter !== 'number' || isNaN(taskIdCounter)) {
        taskIdCounter = 1; // Initialize taskIdCounter if not a valid number
    }

    taskIdCounter += 1;
    const taskId = `${formattedDate}t${taskIdCounter}`;

    return taskId;
}
// Add this function to handle the contenteditable behavior
function enableTaskEditing(taskId) {
    const taskText = document.querySelector(`.taskItem[data-task-id="${taskId}"] > span`);

    // Set contenteditable to true
    taskText.contentEditable = true;

    // Focus on the task text
    taskText.focus();

    // Add a keydown event listener to detect Enter key
    taskText.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            // Prevent the default Enter behavior (e.g., new line)
            event.preventDefault();

            // Disable contenteditable
            taskText.contentEditable = false;

            // Call the updateTask function with the new task description
            updateTask(taskId, taskText.textContent.trim());
        }
    });
}

// Modify the createTaskItem function to include the onclick event for editing
function createTaskItem(task) {
    const taskItem = document.createElement('div');
    taskItem.className = 'taskItem';
    taskItem.setAttribute('data-task-id', task.id); // Add data-task-id attribute

    const taskText = document.createElement('span');
    taskText.textContent = task.task;
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



async function loadTasks() {
    try {
        const response = await axios.get('http://localhost:3000/get-tasks');
        const tasks = response.data.tasks;
        console.log(response.data);
        
        const taskList = document.getElementById('taskList');
        taskList.innerHTML = ''; // Clear existing content

        if (tasks && tasks.length > 0) {
            taskIdCounter = tasks.length + 1;
            tasks.forEach(task => {
                const taskItem = createTaskItem(task);
                
                // Check if the task is completed
                if (task.completed) {
                    // Apply style with strike-through
                    const taskDescription = taskItem.querySelector('.taskItem span');
                    taskDescription.style.textDecoration = 'line-through';
                }

                taskList.appendChild(taskItem);
            });
        } else {
            const noTasksMessage = document.createElement('p');
            noTasksMessage.textContent = 'No tasks added.';
            taskList.appendChild(noTasksMessage);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


async function removeTask() {
    const taskId = this.getAttribute('data-task-id');
    await sendRequest('remove-task', { taskId });
    this.closest('.taskItem').remove();
}

async function completeTask() {
    const taskId = this.getAttribute('data-task-id');
    const taskText = this.closest('.taskItem').querySelector('span');

    await sendRequest('complete-task', { taskId, timeCompleted: new Date().toLocaleTimeString(), completed: true });

    taskText.style.textDecoration = 'line-through';
    this.disabled = true;
    alert('Task completed successfully!');
}

async function getServerTime() {
    try {
        const response = await axios.get('http://localhost:3000/get-server-date-time');
        return response.data.serverDateTime;
    } catch (error) {
        console.error('Error:', error);
        return 'Error getting server time';
    }
}

async function updateClockDisplay() {
    const serverDateTime = await getServerTime();

    // Parse the serverDateTime string
    const [date, time] = serverDateTime.split(', ');

    // Update date display
    document.getElementById('dateDisplay').innerText = date;

    // Update time display
    document.getElementById('clockDisplay').innerText = time;
}


async function sendRequest(action, data = {}) {
    try {
        const response = await axios.post(`http://localhost:3000/${action}`, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Show alert message instead of appending a paragraph
        alert(response.data);

        updateClockDisplay();

        return response.data;
    } catch (error) {
        console.error('Error:', error);
    }
}


async function updateTask(taskId, updatedTask) {
    try {
        await sendRequest('update-task', { taskId, updatedTask });
        // Reload tasks after updating
        //await loadTasks();
        window.location.reload(); //refreshing the page to show the updated values
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

// function updateTaskDescription() {
//     const updatedTaskInput = document.getElementById('updatedTaskInput');
//     const updatedTask = updatedTaskInput.value.trim();

//     if (updatedTask !== '') {
//         // Assuming you have a variable taskId that represents the ID of the task you want to update
//         const taskId = 'your-task-id-here';

//         // Call the updateTask function
//         updateTask(taskId, updatedTask);

//         // Clear the input field
//         updatedTaskInput.value = '';
//     }
// }


window.onload = loadTasks;
setInterval(updateClockDisplay, 500);