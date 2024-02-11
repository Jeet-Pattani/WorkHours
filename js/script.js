let taskIdCounter = 0;

async function addTask() {
    const taskInput = document.getElementById('taskInput');
    const task = taskInput.value.trim();

    if (task !== '') {
        try {
            const currentTime = new Date().toLocaleTimeString();

            // Send the task to the backend
            await sendRequest('add-task', { task, completed: false, timeAdded: currentTime });

            // Fetch and load tasks after adding a task
            await loadTasks();

            taskInput.value = '';
        } catch (error) {
            console.error('Error:', error);
        }
    }
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

function enableLtTaskEditing(taskId) {
    const taskText = document.querySelector(`.taskItem[data-task-id="${taskId}"] > span`);

    // Remove existing event listener
    taskText.removeEventListener('keydown', taskText.keydownListener);

    // Set contenteditable to true
    taskText.contentEditable = true;

    // Focus on the task text
    taskText.focus();

    // Add a keydown event listener to detect Enter key
    taskText.keydownListener = function(event) {
        if (event.key === 'Enter') {
            // Prevent the default Enter behavior (e.g., new line)
            event.preventDefault();

            // Disable contenteditable
            taskText.contentEditable = false;

            // Call the updateTask function with the new task description
            updateLtTask(taskId, taskText.textContent.trim());
        }
    };

    taskText.addEventListener('keydown', taskText.keydownListener);
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
        const response = await axios.get('http://192.168.1.7:3000/get-tasks');
        const tasks = response.data.tasks;

        const taskList = document.getElementById('taskList');
        taskList.innerHTML = ''; // Clear existing content
        //console.log(tasks.length)
        if (tasks && tasks.length > 0) {
            // Load the sorted order from local storage
            const sortedOrder = JSON.parse(localStorage.getItem('taskListOrder'));
            //console.log("sortedOrder from script.js",sortedOrder)
            // Create a map to store task items by their IDs
            const taskItemsMap = new Map();
            tasks.forEach(task => {
                const taskItem = createTaskItem(task);
                taskItemsMap.set(task.id, taskItem);
               // console.log(taskItem)
            });

            // Append task items to the list in the sorted order
            if (sortedOrder) {
                sortedOrder.order.forEach(id => {
                    const taskItem = taskItemsMap.get(id);
                    if (taskItem) {
                        taskList.appendChild(taskItem);
                    }
                });
            } else {
                // If no sorted order found, append task items in the order of tasks array
                tasks.forEach(task => {
                    const taskItem = taskItemsMap.get(task.id);
                    if (taskItem) {
                        taskList.appendChild(taskItem);
                    }
                });
            }
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

async function removeLtTask() {
    const taskId = this.getAttribute('data-task-id');
    await sendRequest('remove-lt-task', { taskId });
    this.closest('.taskItem').remove();
}

async function completeTask() {
    const taskId = this.getAttribute('data-task-id');
    const taskText = this.closest('.taskItem').querySelector('span');

    await sendRequest('complete-task', { taskId, timeCompleted: new Date().toLocaleTimeString(), completed: true });

    taskText.style.textDecoration = 'line-through';
    this.disabled = true;
    // alert('Task completed successfully!');
}

async function completeLtTask() {
    const taskId = this.getAttribute('data-task-id');
    const taskText = this.closest('.taskItem').querySelector('span');

    await sendRequest('complete-lt-task', { taskId, timeCompleted: new Date().toLocaleTimeString(), completed: true });

    taskText.style.textDecoration = 'line-through';
    this.disabled = true;
    // alert('Task completed successfully!');
}

async function getServerTime(timeFormat) {
    try {
        const response = await axios.get(`http://192.168.1.7:3000/get-server-time?format=${timeFormat}`);
        return response.data.serverTime;
    } catch (error) {
        console.error('Error:', error);
        return 'Error getting server time';
    }
}

async function getServerDate(dateFormat){
    try{
        const response = await axios.get(`http://192.168.1.7:3000/get-server-date?format=${dateFormat}`);
        return response.data.serverDate
    } catch(error){
        console.error('Error:',error);
        return 'Error getting server date'
    }
}

let is24HourFormat = true; // Flag to track the current time format

// Function to toggle between 12-hour and 24-hour formats
function toggleTimeFormat() {
    is24HourFormat = !is24HourFormat;
    updateClockDisplay(); // Update the clock display immediately
}

let isLongFormat = true;

function toggleDateFormat(){
    isLongFormat = !isLongFormat;
    updateDateDisplay(); //Update the date display immediately
}

// Add a click event listener to the clockDisplay div
document.getElementById('clockDisplay').addEventListener('click', toggleTimeFormat);
document.getElementById('dateDisplay').addEventListener('click', toggleDateFormat);

async function updateClockDisplay() {
    const timeFormat = is24HourFormat ? '24hr' : '12hr';
    const serverTime = await getServerTime(timeFormat);
    document.getElementById('clockDisplay').innerText = serverTime;
}

async function updateDateDisplay(){
    const dateFormat = isLongFormat ? 'long' : 'short';
    const serverDate = await getServerDate(dateFormat);
    if(dateFormat === 'long'){
        // Regular expression to match the comma after two spaces
        var regex = /(\w{3}, \d{1,2} \w{3}), (\d{4})/;

        // Replace the matched pattern with the desired format
        var outputString = serverDate.replace(regex, "$1 $2");
        document.getElementById('dateDisplay').innerText = outputString;
    } else{
        document.getElementById('dateDisplay').innerText = serverDate;
    }
}




async function sendRequest(action, data = {}) {
    try {
        const response = await axios.post(`http://192.168.1.7:3000/${action}`, data, {
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

        // Find the task item in the DOM and update its text content
        const taskItem = document.querySelector(`.taskItem[data-task-id="${taskId}"] > span`);
        if (taskItem) {
            taskItem.textContent = updatedTask;
        }
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

async function updateLtTask(taskId, updatedTask) {
    try {
        await sendRequest('update-lt-task', { taskId, updatedTask });

        // Find the task item in the DOM and update its text content
        const taskItem = document.querySelector(`.taskItem[data-task-id="${taskId}"] > span`);
        if (taskItem) {
            taskItem.textContent = updatedTask;
        }
    } catch (error) {
        console.error('Error updating task:', error);
    }
}


// Function to open the modal and update its content
function openModal(summary) {
    const modal = document.getElementById('summaryModal');
    modal.style.display = 'grid';

    // Update modal content
    document.getElementById('TotalWorkDuration').textContent = `Total Work Duration: ${summary.TotalWorkDuration || 'N/A'}`;
    document.getElementById('TotalBreakDuration').textContent = `Total Break Duration: ${summary.TotalBreakDuration || 'N/A'}`;
    document.getElementById('NumberOfBreaks').textContent = `Number of Breaks: ${summary.NumberOfBreaks || 'N/A'}`;

    const breakDetailsTable = document.getElementById('breakDetails');
    breakDetailsTable.innerHTML = ''; // Clear existing content

    if (summary.BreakDetails && Array.isArray(summary.BreakDetails) && summary.BreakDetails.length > 0) {
        // Create table header
        const tableHeader = breakDetailsTable.createTHead();
        const headerRow = tableHeader.insertRow();
        const headerSrNo = headerRow.insertCell(0);
        const headerStartBreak = headerRow.insertCell(1);
        const headerEndBreak = headerRow.insertCell(2);
        const headerDuration = headerRow.insertCell(3);

        headerSrNo.textContent = 'Sr. No';
        headerStartBreak.textContent = 'Start Break';
        headerEndBreak.textContent = 'End Break';
        headerDuration.textContent = 'Duration';

        // Create table body
        const tableBody = breakDetailsTable.createTBody();

 // Add break details to the table
// Initialize variables to store the current Start Break and End Break details
let currentStartBreak = null;
let currentEndBreak = null;
let serialNumber = 1;

summary.BreakDetails.forEach((breakDetail, index) => {
    if (breakDetail.type === 'Start Break') {
        // If it's 'Start Break', store the details in currentStartBreak
        currentStartBreak = breakDetail;
    } else if (breakDetail.type === 'End Break') {
        // If it's 'End Break', store the details in currentEndBreak
        currentEndBreak = breakDetail;

        // Create a row with the details of Start Break and End Break
        const currentRow = tableBody.insertRow();
        currentRow.insertCell(0).textContent = serialNumber;
        currentRow.insertCell(1).textContent = currentStartBreak.time;
        currentRow.insertCell(2).textContent = currentEndBreak.time;
        currentRow.insertCell(3).textContent = currentEndBreak.duration || '';

        // Increment the serial number for the next pair
        serialNumber++;

        // Reset the variables for the next pair
        currentStartBreak = null;
        currentEndBreak = null;
    }
});


        

    } else {
        // Handle the case where breakDetails is missing or not an array
        const noBreaksMessage = document.createElement('p');
        noBreaksMessage.textContent = 'No break details available.';
        breakDetailsTable.appendChild(noBreaksMessage);
    }
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById('summaryModal');
    modal.style.display = 'none';
}

document.getElementById('getSummary').addEventListener('click', async () => {
    try {
        const response = await axios.get('http://192.168.1.7:3000/get-summary');
        openModal(response.data);
       // console.log(response)
    } catch (error) {
        console.error('Error getting summary:', error);
    }
});

async function loadLtTasks() {
    try {
         const response = await axios.get('http://192.168.1.7:3000/get-lt-tasks');
         const tasks = response.data;
 
         const taskList = document.getElementById('additionalTaskList');
         taskList.innerHTML = ''; // Clear existing content
         if (tasks && tasks.length > 0) {
             // Load the sorted order from local storage
             const sortedOrder = JSON.parse(localStorage.getItem('additionalTaskListOrder'));
             
             // Create a map to store task items by their IDs
             const taskItemsMap = new Map();
             tasks.forEach(task => {
                 const taskItem = createLtTaskItem(task);
                 taskItemsMap.set(task.id, taskItem);
             });

             // Append task items to the list in the sorted order
             if (sortedOrder) {
                 sortedOrder.forEach(id => {
                     const taskItem = taskItemsMap.get(id);
                     if (taskItem) {
                         taskList.appendChild(taskItem);
                     }
                 });
             } else {
                 // If no sorted order found, append task items in the order of tasks array
                 tasks.forEach(task => {
                     const taskItem = taskItemsMap.get(task.id);
                     if (taskItem) {
                         taskList.appendChild(taskItem);
                     }
                 });
             }
         } else {
             const noTasksMessage = document.createElement('p');
             noTasksMessage.setAttribute('id', 'noTasksMessageId');
             noTasksMessage.textContent = 'No Long-Term Tasks added.';
             taskList.appendChild(noTasksMessage);
         }
     } catch (error) {
         console.error('Error:', error);
     }
 }

 
 
 async function addLtTask() {
     const taskInput = document.getElementById('additionalTaskInput');
     const task = taskInput.value.trim();
 
     if (task !== '') {
         try {
             const currentTime = new Date().toLocaleTimeString();
 
             // Send the task to the backend
             await sendRequest('add-lt-task', { task });
 
             // Fetch and load tasks after adding a task
             await loadLtTasks();
 
             taskInput.value = '';
         } catch (error) {
             console.error('Error:', error);
         }
     }
 }

 document.getElementById("additionalTaskInput").addEventListener("keydown", (e) => {
    // Check if the Enter key is pressed
    if (e.key === "Enter") {
        // Prevent the default form submission behavior
        e.preventDefault();
        
        // Call the addLtTask() function
        addLtTask();
    }
});

document.getElementById("taskInput").addEventListener("keydown", (e) => {
    // Check if the Enter key is pressed
    if (e.key === "Enter") {
        // Prevent the default form submission behavior
        e.preventDefault();
        
        // Call the addLtTask() function
        addTask();
    }
});
 
 function createLtTaskItem(task) {
     const taskItem = document.createElement('div');
     taskItem.className = 'taskItem';
     taskItem.setAttribute('data-task-id', task.id); // Add data-task-id attribute
 
     const taskText = document.createElement('span');
     taskText.textContent = task.description;
     taskText.onclick = () => enableLtTaskEditing(task.id); // Enable editing on click
 
     const taskActions = document.createElement('div');
     taskActions.className = 'taskActions';
 
     const removeButton = document.createElement('button');
     removeButton.textContent = 'Remove';
     removeButton.setAttribute('data-task-id', task.id);
     removeButton.onclick = removeLtTask;
 
     const completeButton = document.createElement('button');
     completeButton.textContent = 'Complete';
     completeButton.setAttribute('data-task-id', task.id);
     completeButton.onclick = completeLtTask;
 
     taskActions.appendChild(removeButton);
     taskActions.appendChild(completeButton);
 
     taskItem.appendChild(taskText);
     taskItem.appendChild(taskActions);
 
     return taskItem;
 }

 window.onload = loadTasks();
 window.onload = loadLtTasks();
 window.onload = updateDateDisplay();
setInterval(updateClockDisplay, 500);
setInterval(updateDateDisplay,300000);





function checkParagraphCount() {
    const additionalTaskList = document.getElementById('additionalTaskList');
    const paragraphCount = additionalTaskList.querySelectorAll('p').length;
    //console.log(paragraphCount);

    if (paragraphCount === 1) {
        additionalTaskList.style.display = 'block';
    } else {
        // additionalTaskList.style.backgroundColor = 'transparent';
        additionalTaskList.style.display = 'grid';
    }
}

window.addEventListener('load', function() {
    loadTasks();
    loadLtTasks();
    updateDateDisplay();
    checkParagraphCount();
});


// on frontend userStatus.js:
const clockInBtn = document.getElementById('clockInButton');
const clockOutBtn = document.getElementById('clockOutButton');
const startBreakBtn = document.getElementById('startBreakButton');
const endBreakBtn = document.getElementById('endBreakButton');

// Function to fetch user status from the server and update the UI
async function updateUserStatus() {
  try {
    const response = await axios.get('http://192.168.1.7:3000/get-user-status');
    const userStatus = transformUserStatus(response.data.userStatus);

    // Update the UI based on the user status
    const statusIndicator = document.getElementById('statusIndicator');
    statusIndicator.textContent = `Status: ${userStatus}`;

    // Save the current state to localStorage
    localStorage.setItem('userStatus', userStatus);
  } catch (error) {
    console.error('Error getting user status:', error);
  }
}

// Function to transform user status text
function transformUserStatus(status) {
  return status
    ? status.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
    : 'Not at Work';
}

// Fetch user status and update UI on page load
updateUserStatus();

// Add a single event listener for all buttons
clockInBtn.addEventListener('click', updateUserStatus);
clockOutBtn.addEventListener('click', updateUserStatus);
startBreakBtn.addEventListener('click', updateUserStatus);
endBreakBtn.addEventListener('click', updateUserStatus);
