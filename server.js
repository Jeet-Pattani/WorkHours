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
const dataFilePath = path.join(__dirname, 'data.json');

function loadData() {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
}


function saveData(data) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
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

function parseDateTimeString(dateTimeString) {
    const [date, time] = dateTimeString.split(' ');
    const [day, month, year] = date.split('/').map(Number);
    const [hours, minutes, seconds] = time.split(':').map(Number);

    if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        return null;
    }

    return new Date(year, month - 1, day, hours, minutes, seconds);
}

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

function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

function clockIn(req, res) {
    const currentDateTime = getCurrentDateTime();
    const data = loadData();
    const today = new Date().toLocaleDateString();

    if (!data[today]) {
        data[today] = { time: { clockInTime: currentDateTime, breaks: [], clockOutTime: null }, tasks: [], userStatus: 'clocked-in' };
    } else {
        data[today].time.clockInTime = currentDateTime;
        data[today].userStatus = 'clocked-in';
    }

    saveData(data);
    console.log('Clock In recorded.');
    res.send('Clock In recorded.');
}

function startBreak(req, res) {
    const currentDateTime = getCurrentDateTime();
    const data = loadData();
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
        saveData(data);
        console.log('Break started.');
        res.send('Break started.');
    }
}


function endBreak(req, res) {
    const currentDateTime = getCurrentDateTime();
    const data = loadData();
    const today = new Date().toLocaleDateString();
    const timeData = data[today] ? data[today].time : null;

    if (timeData && timeData.breaks && timeData.breaks.length > 0) {
        const lastBreakStart = timeData.breaks[timeData.breaks.length - 1];
        const breakDuration = calculateTimeDifferenceWithDate(lastBreakStart.time, currentDateTime);

        timeData.breaks.push({ type: 'End Break', time: currentDateTime, duration: breakDuration });
        data[today].userStatus = 'back-to-work';
        saveData(data);
        console.log(`Break ended. Break duration: ${breakDuration}`);
        res.send(`Break ended. Break duration: ${breakDuration}`);
    } else {
        console.log('Error: Break not started.');
        res.send('Error: Break not started.');
    }
}

function clockOut(req, res) {
    const currentDateTime = getCurrentDateTime();
    const data = loadData();
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
        saveData(data);
        console.log(`Clock Out recorded. Work duration: ${workDuration}, Total Break duration: ${totalBreakDuration}`);
        res.send(`Clock Out recorded. Work duration: ${workDuration}, Total Break duration: ${totalBreakDuration}`);
    } else if (timeDataYesterday && timeDataYesterday.clockInTime && timeDataYesterday.clockOutTime === null) {
        // Allow clock-out for users who clocked in on the previous day
        const totalBreakDuration = calculateTotalBreakDuration(timeDataYesterday.breaks);
        const workDuration = calculateTimeDifferenceWithDate(timeDataYesterday.clockInTime, currentDateTime);
        timeDataYesterday.clockOutTime = currentDateTime;
        data[yesterdayFormatted].userStatus = 'clocked-out';
        saveData(data);
        console.log(`Clock Out recorded. Work duration: ${workDuration}, Total Break duration: ${totalBreakDuration}`);
        res.send(`Clock Out recorded. Work duration: ${workDuration}, Total Break duration: ${totalBreakDuration}`);
    } else {
        console.log('Error: Clock In not recorded.');
        res.send('Error: Clock In not recorded.');
    }
}



function getSummary(req, res) {
    const data = loadData();
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
        res.send({ TotalWorkDuration: totalWorkDuration,TotalBreakDuration: totalBreakDuration,NumberOfBreaks:numberOfBreaks,BreakDetails: breakDetails });
    } else {
        console.log('Error: No data available for today.');
        res.send('Error: No data available for today.');
    }
}


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

function getServerDateTime(req, res) {
    // Check if the frontend specified the time format
    const is24HourFormat = req.query.format === '24hr';

    const options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: !is24HourFormat,
    };

    const currentDateTime = new Date().toLocaleString(undefined, options);//In the toLocaleString method, the first argument is a locale string, which is typically used to specify the language and region for formatting purposes. However, in your code, the undefined is passed as the first argument. When undefined is used, the method uses the default locale of the JavaScript runtime environment.
    
    
    res.json({ serverDateTime: currentDateTime });
}



function addTask(req, res){
    const currentTime = new Date().toLocaleTimeString();
    const data = loadData();
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
    saveData(data);

    res.send('Task added.');
}


function updateTask(req, res){
    const { taskId, updatedTask } = req.body;
    const data = loadData();
    const today = new Date().toLocaleDateString();

    if (!data[today]) {
        data[today] = { time: { clockInTime: null, breaks: [], clockOutTime: null }, tasks: [] };
    }

    const task = data[today].tasks.find((t) => t.id === taskId);

    if (task) {
        task.task = updatedTask;
        saveData(data);
        // res.send('Task updated.');
    } else {
        res.status(400).send('Error: Task not found.');
    }
}

function completeTask(req, res){
    const currentTime = new Date().toLocaleTimeString();
    const data = loadData();
    const today = new Date().toLocaleDateString();

    if (!data[today]) {
        data[today] = { time: { clockInTime: null, breaks: [], clockOutTime: null }, tasks: [] };
    }

    const taskId = req.body.taskId;
    const task = data[today].tasks.find((t) => t.id === taskId);

    if (task) {
        task.completed = true;
        task.timeCompleted = currentTime;
        saveData(data);
        res.send('Task completed.');
    } else {
        res.status(400).send('Error: Task not found.');
    }
}

async function removeTask(req, res) {
    try {
        const { taskId } = req.body;

        // Load tasks from data.json with utf8 encoding
        const data = await loadData();

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
        await saveData(data);

        res.json('Task removed successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json('Error removing task');
    }
}


function getUserStatus(req, res){
    const data = loadData();
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



function getTasks(req, res){
    const data = loadData();
    const today = new Date().toLocaleDateString();

    if (data[today] && data[today].tasks) {
        const tasks = data[today].tasks;
        res.json({ tasks });
    } else {
        res.json({ tasks: [] });
    }
}

app.get('/get-server-date-time', getServerDateTime);
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
