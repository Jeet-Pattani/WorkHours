const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000; // Replace with your desired port

// Use bodyParser middleware to parse JSON requests
app.use(bodyParser.json());
const fs = require('fs');
const path = require('path');
const { log } = require('console');

app.use(express.static(__dirname));
//data.json saves the timelogs(timestamps) as well as the daily tasks
const dataFilePath = path.join(__dirname, 'data.json');
//task.json saves the long-term tasks separately without any timestamps
const taskFilePath = path.join(__dirname, 'data1.json');

// Function to load data from a JSON file
function loadData(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
}

// Function to save data to a JSON file
function saveData(data, filePath) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Function to get the current date and time
function getCurrentDateTime() {
    const now = new Date();

    // Extracting date components
    const day = now.getDate();
    const month = now.getMonth() + 1; // Months are zero-based
    const year = now.getFullYear();

    // Extracting time components
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Pad single-digit values with leading zeros
    const formattedDate = padZero(day) + '/' + padZero(month) + '/' + year;
    const formattedTime = padZero(hours) + ':' + padZero(minutes) + ':' + padZero(seconds);

    return formattedDate + ' ' + formattedTime;
}

// Function to pad single-digit values with leading zeros
function padZero(value) {
    return value < 10 ? '0' + value : value;
}

// Function to parse a date-time string
function parseDateTimeString(dateTimeString) {
    if (!dateTimeString) {
        console.error('Error: DateTimeString is null or undefined.');
        return null;
    }
    const [date, time] = dateTimeString.split(' ');
    const [day, month, year] = date.split('/').map(Number);
    const [hours, minutes, seconds] = time.split(':').map(Number);

    if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        return null;
    }

    return new Date(year, month - 1, day, hours, minutes, seconds);
}

// Function to calculate the time difference between two date-time strings
function calculateTimeDifferenceWithDate(startTime, endTime) {
    const start = parseDateTimeString(startTime);
    const end = parseDateTimeString(endTime);

    if (!start || !end) {
        return 'Invalid date-time format';
    }

    const difference = end - start;
    const hours = Math.floor(difference / 1000 / 60 / 60);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
}

// Function to format time values
function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

// Function to handle clock-in requests
function clockIn(req, res) {
    const currentDateTime = getCurrentDateTime();
    const data = loadData(dataFilePath);
    const today = new Date().toLocaleDateString();

    if (!data[today]) {
        data[today] = { time: { clockInTime: currentDateTime, breaks: [], clockOutTime: null }, tasks: [], userStatus: 'clocked-in' };
    } else {
        data[today].time.clockInTime = currentDateTime;
        data[today].userStatus = 'clocked-in';
    }

    saveData(data, dataFilePath);
    console.log('Clock In recorded.');
    res.send('Clock In recorded.');
}

// Function to handle starting a break
function startBreak(req, res) {
    const currentDateTime = getCurrentDateTime();
    const data = loadData(dataFilePath);
    const today = new Date().toLocaleDateString();

    if (!data[today]) {
        data[today] = { time: { clockInTime: null, breaks: [], clockOutTime: null }, tasks: [], userStatus: 'not on work' };
    }

    const timeData = data[today].time;

    // Check if a break has already started
    if (timeData && timeData.breaks && timeData.breaks.length > 0 && timeData.breaks[timeData.breaks.length - 1].type === 'Start Break') {
        console.log('Error: Break already started.');
        res.send('Error: Break already started.');
    } else {
        // Start a new break
        data[today].time.breaks.push({ type: 'Start Break', time: currentDateTime });
        data[today].userStatus = 'on-break';
        saveData(data, dataFilePath);
        console.log('Break started.');
        res.send('Break started.');
    }
}

// Function to handle ending a break
function endBreak(req, res) {
    const currentDateTime = getCurrentDateTime();
    const data = loadData(dataFilePath);
    const today = new Date().toLocaleDateString();
    const timeData = data[today] ? data[today].time : null;

    if (timeData && timeData.breaks && timeData.breaks.length > 0) {
        const lastBreakStart = timeData.breaks[timeData.breaks.length - 1];
        const breakDuration = calculateTimeDifferenceWithDate(lastBreakStart.time, currentDateTime);

        timeData.breaks.push({ type: 'End Break', time: currentDateTime, duration: breakDuration });
        data[today].userStatus = 'back-to-work';
        saveData(data, dataFilePath);
        console.log(`Break ended. Break duration: ${breakDuration}`);
        res.send(`Break ended. Break duration: ${breakDuration}`);
    } else {
        console.log('Error: Break not started.');
        res.send('Error: Break not started.');
    }
}

// Function to handle clock-out requests
function clockOut(req, res) {
    const currentDateTime = getCurrentDateTime();
    const data = loadData(dataFilePath);
    const today = new Date().toLocaleDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = yesterday.toLocaleDateString();

    const timeDataToday = data[today] ? data[today].time : null;
    const timeDataYesterday = data[yesterdayFormatted] ? data[yesterdayFormatted].time : null;

    if (timeDataToday && timeDataToday.clockInTime) {
        const totalBreakDuration = calculateTotalBreakDuration(timeDataToday.breaks);
        const workDuration = calculateTimeDifferenceWithDate(timeDataToday.clockInTime, currentDateTime);
        timeDataToday.clockOutTime = currentDateTime;
        data[today].userStatus = 'clocked-out';
        saveData(data, dataFilePath);
        console.log(`Clock Out recorded. Work duration: ${workDuration}, Total Break duration: ${totalBreakDuration}`);
        res.send(`Clock Out recorded. Work duration: ${workDuration}, Total Break duration: ${totalBreakDuration}`);
    } else if (timeDataYesterday && timeDataYesterday.clockInTime && timeDataYesterday.clockOutTime === null) {
        // Allow clock-out for users who clocked in on the previous day
        const totalBreakDuration = calculateTotalBreakDuration(timeDataYesterday.breaks);
        const workDuration = calculateTimeDifferenceWithDate(timeDataYesterday.clockInTime, currentDateTime);
        timeDataYesterday.clockOutTime = currentDateTime;
        data[yesterdayFormatted].userStatus = 'clocked-out';
        saveData(data, dataFilePath);
        console.log(`Clock Out recorded. Work duration: ${workDuration}, Total Break duration: ${totalBreakDuration}`);
        res.send(`Clock Out recorded. Work duration: ${workDuration}, Total Break duration: ${totalBreakDuration}`);
    } else {
        console.log('Error: Clock In not recorded.');
        res.send('Error: Clock In not recorded.');
    }
}

// Function to get summary of work
function getSummary(req, res) {
    const data = loadData(dataFilePath);
    const today = new Date().toLocaleDateString();
    const timeData = data[today] ? data[today].time : null;

    if (timeData) {
        // Use calculateTimeDifferenceWithDate instead of calculateTimeDifference
        const totalWorkDuration = calculateTimeDifferenceWithDate(timeData.clockInTime, timeData.clockOutTime);
        const totalBreakDuration = calculateTotalBreakDuration(timeData.breaks);
        const numberOfBreaks = timeData.breaks.length / 2;

        const breakDetails = timeData.breaks.map((breakEntry) => ({
            type: breakEntry.type,
            time: breakEntry.time,
            duration: breakEntry.duration,
        }));

        console.log({
            totalWorkDuration,
            totalBreakDuration,
            numberOfBreaks,
            breakDetails,
        });
        res.send({ TotalWorkDuration: totalWorkDuration, TotalBreakDuration: totalBreakDuration, NumberOfBreaks: numberOfBreaks, BreakDetails: breakDetails });
    } else {
        console.log('Error: No data available for today.');
        res.send('Error: No data available for today.');
    }
}

// Function to calculate total break duration
function calculateTotalBreakDuration(breaks) {
    let totalDuration = 0;

    for (let i = 0; i < breaks.length; i++) {
        const breakEntry = breaks[i];

        if (breakEntry.type === 'End Break' && breakEntry.duration) {
            const durationParts = breakEntry.duration.split(':').map(Number);
            const durationMilliseconds =
                durationParts[0] * 3600000 + durationParts[1] * 60000 + durationParts[2] * 1000;
            totalDuration += durationMilliseconds;
        }
    }

    const totalHours = Math.floor(totalDuration / 1000 / 60 / 60);
    const totalMinutes = Math.floor((totalDuration / 1000 / 60) % 60);
    const totalSeconds = Math.floor((totalDuration / 1000) % 60);

    return `${formatTime(totalHours)}:${formatTime(totalMinutes)}:${formatTime(totalSeconds)}`;
}

// Function to get the server time
function getServerTime(req, res) {
    // Check if the frontend specified the time format
    const is24HourFormat = req.query.format === '24hr';

    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: !is24HourFormat,
    };

    const currentTime = new Date().toLocaleString(undefined, options);

    res.json({ serverTime: currentTime });
}

// Function to get the server date
function getServerDate(req, res) {
    const isLongFormat = req.query.format === 'long';
    const options = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
    }
    const currentDate = new Date().toLocaleString(undefined, isLongFormat ? options : { dateStyle: "short" });

    res.json({ serverDate: currentDate });
}

// Function to add long term tasks
function addLtTask(req, res) {
    const currentTime = new Date().toLocaleTimeString();
    const data = loadData(taskFilePath)
    const taskInput = req.body.task;

    // Determine the taskIdCounter based on existing tasks
    let lastTaskIdCounter = 0;
    const lastTask = data[data.length - 1];

    if (lastTask) {
        const lastTaskId = lastTask.id;
        const lastTaskIdParts = lastTaskId.split('LtT');
        lastTaskIdCounter = parseInt(lastTaskIdParts[1]) + 1;
    } else {
        // If tasks array is empty, set taskIdCounter to 1
        lastTaskIdCounter = 1;
    }

    // Set the taskIdCounter for generating the new taskId
    taskIdCounter = lastTaskIdCounter;

    const today_ForTaskID = new Date();
    const formattedDate = `${today_ForTaskID.getDate()}${today_ForTaskID.getMonth() + 1}${today_ForTaskID.getFullYear()}`;
    const taskId = `${formattedDate}LtT${taskIdCounter}`;

    data.push({ id: taskId, description: taskInput, timeAdded: currentTime, timeCompleted: null, completed: false });
    saveData(data, taskFilePath);

    res.send("Long Term Notes/Tasks Added.")
}

// Function to remove long term tasks
function removeLtTask(req, res) {
    const taskId = req.body.taskId;
    let data = loadData(taskFilePath);

    // Check if the task with the specified ID exists
    const taskIndex = data.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
        // Remove the task with the specified ID
        data.splice(taskIndex, 1);
        console.log(`Task with ID ${taskId} removed successfully.`);
        res.send("Task removed !")
    } else {
        console.log(`Task with ID ${taskId} not found.`);
        res.send("Error: Task ID not found !")
    }

    // Save the updated data back to the file
    saveData(data, taskFilePath);
}

// Function to get long term tasks
function getLtTasks(req, res) {
    const data = loadData(taskFilePath);
    res.json(data)
}

// Function to mark long term task as completed
function completeLtTask(req, res) {
    const taskId = req.body.taskId;
    const data = loadData(taskFilePath);

    // Find the task with the specified ID
    const task = data.find(task => task.id === taskId);

    if (task) {
        task.completed = true;
        saveData(data, taskFilePath);
        res.send("Task completed Successfully.")
    } else {
        console.log('Task not found!');
        res.send('Task not found!');
    }
}

// Function to update long term task
function updateLtTask(req, res) {
    const taskId = req.body.taskId;
    const data = loadData(taskFilePath);

    // Find the task with the specified ID
    const task = data.find(task => task.id === taskId);

    if (task) {
        task.description = req.body.updatedTask;
        console.log("Task Description Updated.")
        saveData(data, taskFilePath);
        res.send("Long-Term Task Updated")
    } else {
        res.send("Task not found!")
        console.log('Task not found!');
    }
}

// Function to add task
function addTask(req, res) {
    const currentTime = new Date().toLocaleTimeString();
    const data = loadData(dataFilePath);
    const today = new Date().toLocaleDateString();

    if (!data[today]) {
        data[today] = { time: { clockInTime: null, breaks: [], clockOutTime: null }, tasks: [] };
    }

    const task = req.body.task;

    // Determine the taskIdCounter based on existing tasks
    let lastTaskIdCounter = 0;
    const lastTask = data[today].tasks[data[today].tasks.length - 1];

    if (lastTask) {
        const lastTaskId = lastTask.id;
        const lastTaskIdParts = lastTaskId.split('t');
        lastTaskIdCounter = parseInt(lastTaskIdParts[1]) + 1;
    } else {
        // If tasks array is empty, set taskIdCounter to 1
        lastTaskIdCounter = 1;
    }

    // Set the taskIdCounter for generating the new taskId
    taskIdCounter = lastTaskIdCounter;

    const today_ForTaskID = new Date();
    const formattedDate = `${today_ForTaskID.getDate()}${today_ForTaskID.getMonth() + 1}${today_ForTaskID.getFullYear()}`;
    const taskId = `${formattedDate}t${taskIdCounter}`;

    data[today].tasks.push({ id: taskId, timeAdded: currentTime, task, timeCompleted: null, completed: false });
    saveData(data, dataFilePath);

    res.send('Task added.');
}

// Function to update task
function updateTask(req, res) {
    const { taskId, updatedTask } = req.body;
    const data = loadData(dataFilePath);
    const today = new Date().toLocaleDateString();

    if (!data[today]) {
        data[today] = { time: { clockInTime: null, breaks: [], clockOutTime: null }, tasks: [] };
    }

    const task = data[today].tasks.find((t) => t.id === taskId);

    if (task) {
        task.task = updatedTask;
        saveData(data, dataFilePath);
        // res.send('Task updated.');
    } else {
        res.status(400).send('Error: Task not found.');
    }
}

// Function to mark task as completed
function completeTask(req, res) {
    const currentTime = new Date().toLocaleTimeString();
    const data = loadData(dataFilePath);
    const today = new Date().toLocaleDateString();

    if (!data[today]) {
        data[today] = { time: { clockInTime: null, breaks: [], clockOutTime: null }, tasks: [] };
    }

    const taskId = req.body.taskId;
    const task = data[today].tasks.find((t) => t.id === taskId);

    if (task) {
        task.completed = true;
        task.timeCompleted = currentTime;
        saveData(data, dataFilePath);
        res.send('Task completed.');
    } else {
        res.status(400).send('Error: Task not found.');
    }
}

// Function to remove task
async function removeTask(req, res) {
    try {
        const { taskId } = req.body;

        // Load tasks from data.json with utf8 encoding
        const data = await loadData(dataFilePath);

        // Find the task and remove it
        let taskFound = false;
        Object.keys(data).forEach(dateKey => {
            data[dateKey].tasks = data[dateKey].tasks.filter(task => {
                if (task.id === taskId) {
                    taskFound = true;
                    return false; // Exclude the task from the array
                }
                return true; // Keep other tasks in the array
            });
        });

        if (!taskFound) {
            return res.status(400).json('Error: Task not found.');
        }

        // Save the updated tasks to data.json
        await saveData(data, dataFilePath);

        res.json('Task removed successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json('Error removing task');
    }
}

// Function to get user status
function getUserStatus(req, res) {
    const data = loadData(dataFilePath);
    const today = new Date().toLocaleDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = yesterday.toLocaleDateString();

    if (data[today] && data[today].userStatus) {
        const userStatus = data[today].userStatus;
        res.json({ userStatus });
    } else if (data[yesterdayFormatted] && data[yesterdayFormatted].userStatus) {
        // Check yesterday's status if today's status is not found
        const userStatus = data[yesterdayFormatted].userStatus;
        res.json({ userStatus });
    } else {
        res.json({ userStatus: 'Not at Work' }); // Default status if not found
    }
}

// Function to get tasks
function getTasks(req, res) {
    const data = loadData(dataFilePath);
    const today = new Date().toLocaleDateString();

    if (data[today] && data[today].tasks) {
        const tasks = data[today].tasks;
        res.json({ tasks });
    } else {
        res.json({ tasks: [] });
    }
}

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`Received ${req.method} request for ${req.url}`);
    next();
});

// Routes
app.get('/get-server-time', getServerTime);
app.get('/get-server-date', getServerDate);
app.post('/clock-in', clockIn);
app.post('/start-break', startBreak);
app.post('/end-break', endBreak);
app.post('/clock-out', clockOut);
app.get('/get-summary', getSummary);
app.get('/get-user-status', getUserStatus);
app.get('/get-tasks', getTasks);
app.post('/add-task', addTask);
app.post('/remove-task', removeTask);
app.post('/complete-task', completeTask);
app.post('/update-task', updateTask);
app.post('/add-lt-task', addLtTask);
app.post('/update-lt-task', updateLtTask);
app.post('/remove-lt-task', removeLtTask);
app.post('/complete-lt-task', completeLtTask);
app.get('/get-lt-tasks', getLtTasks);

// Middleware to log errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
