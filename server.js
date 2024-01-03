const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

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

function parseTimeString(timeString) {
    const [time, period] = timeString.split(' ');
    const [hours, minutes, seconds] = time.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
        return null;
    }

    const isPM = period === 'pm' || period === 'PM';

    return new Date(2000, 0, 1, isPM && hours !== 12 ? hours + 12 : hours, minutes, seconds);
}

function calculateTimeDifference(startTime, endTime) {
    const start = parseTimeString(startTime);
    const end = parseTimeString(endTime);

    if (!start || !end) {
        return 'Invalid time format';
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

app.use(express.static(__dirname));

app.get('/get-server-date-time', (req, res) => {
    const currentDateTime = new Date().toLocaleString();
    res.json({ serverDateTime: currentDateTime });
});

app.post('/clock-in', (req, res) => {
    const currentTime = new Date().toLocaleTimeString();
    const data = loadData();
    const today = new Date().toLocaleDateString();

    if (!data[today]) {
        data[today] = { time: { clockInTime: currentTime, breaks: [], clockOutTime: null }, tasks: [], userStatus: 'clocked-in' };
    } else {
        data[today].time.clockInTime = currentTime;
        data[today].userStatus = 'clocked-in';
    }

    saveData(data);
    res.send('Clock In recorded.');
});


app.post('/start-break', (req, res) => {
    const currentTime = new Date().toLocaleTimeString();
    const data = loadData();
    const today = new Date().toLocaleDateString();

    if (!data[today]) {
        data[today] = { time: { clockInTime: null, breaks: [], clockOutTime: null }, tasks: [], userStatus: 'not on work' };
    }

    data[today].time.breaks.push({ type: 'Start Break', time: currentTime });
    data[today].userStatus = 'on-break'; // Update user status
    saveData(data);
    res.send('Break started.');
});

app.post('/end-break', (req, res) => {
    const currentTime = new Date().toLocaleTimeString();
    const data = loadData();
    const today = new Date().toLocaleDateString();
    const timeData = data[today] ? data[today].time : null;

    if (timeData && timeData.breaks && timeData.breaks.length > 0) {
        const lastBreakStart = timeData.breaks[timeData.breaks.length - 1];
        const breakDuration = calculateTimeDifference(lastBreakStart.time, currentTime);

        timeData.breaks.push({ type: 'End Break', time: currentTime, duration: breakDuration });
        data[today].userStatus = 'back-to-work'; // Update user status
        saveData(data);
        res.send(`Break ended. Break duration: ${breakDuration}`);
    } else {
        res.status(400).send('Error: Break not started.');
    }
});

app.post('/clock-out', (req, res) => {
    const currentTime = new Date().toLocaleTimeString();
    const data = loadData();
    const today = new Date().toLocaleDateString();
    const timeData = data[today] ? data[today].time : null;

    if (timeData && timeData.clockInTime) {
        const totalBreakDuration = calculateTotalBreakDuration(timeData.breaks);
        const workDuration = calculateTimeDifference(timeData.clockInTime, currentTime);
        timeData.clockOutTime = currentTime;
        data[today].userStatus = 'clocked-out'; // Update user status
        saveData(data);
        res.send(`Clock Out recorded. Work duration: ${workDuration}, Total Break duration: ${totalBreakDuration}`);
    } else {
        res.status(400).send('Error: Clock In not recorded.');
    }
});


app.get('/get-summary', (req, res) => {
    const data = loadData();
    const today = new Date().toLocaleDateString();
    const timeData = data[today] ? data[today].time : null;

    if (timeData) {
        const totalWorkDuration = calculateTimeDifference(timeData.clockInTime, timeData.clockOutTime);
        const totalBreakDuration = calculateTotalBreakDuration(timeData.breaks);
        const numberOfBreaks = (timeData.breaks.length)/2;//divide by because start and end break are recorded separately in data.json

        // Extract start and end times of each break
        const breakDetails = timeData.breaks.map((breakEntry) => ({
            type: breakEntry.type,
            time: breakEntry.time,
            duration: breakEntry.duration,
        }));

        res.json({
            totalWorkDuration,
            totalBreakDuration,
            numberOfBreaks,
            breakDetails,
        });
    } else {
        res.status(400).json('Error: No data available for today.');
    }
});

app.post('/add-task', (req, res) => {
    const currentTime = new Date().toLocaleTimeString();
    const data = loadData();
    const today = new Date().toLocaleDateString();

    if (!data[today]) {
        data[today] = { time: { clockInTime: null, breaks: [], clockOutTime: null }, tasks: [] };
    }

    const task = req.body.task;
    const taskId = generateTaskId();
    data[today].tasks.push({ id: taskId, timeAdded: currentTime, task, timeCompleted: null, completed: false });
    saveData(data);

    res.send('Task added.');
});

app.post('/update-task', (req, res) => {
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
        res.send('Task updated.');
    } else {
        res.status(400).send('Error: Task not found.');
    }
});

app.post('/complete-task', (req, res) => {
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
});

app.post('/remove-task', async (req, res) => {
    try {
        const { taskId } = req.body;

        // Load tasks from data.json with utf8 encoding
        const data = await fs.promises.readFile(dataFilePath, 'utf8');
        const jsonData = JSON.parse(data);

        // Find the task and remove it
        let taskFound = false;
        Object.keys(jsonData).forEach(dateKey => {
            jsonData[dateKey].tasks = jsonData[dateKey].tasks.filter(task => {
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
        await fs.promises.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), 'utf8');

        res.json('Task removed successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json('Error removing task');
    }
});

app.get('/get-user-status', (req, res) => {
    const data = loadData();
    const today = new Date().toLocaleDateString();

    if (data[today] && data[today].userStatus) {
        const userStatus = data[today].userStatus;
        res.json({ userStatus });
    } else {
        res.json({ userStatus: 'Not on Work' }); // Default status if not found
    }
});


app.get('/get-tasks', (req, res) => {
    const data = loadData();
    const today = new Date().toLocaleDateString();

    if (data[today] && data[today].tasks) {
        const tasks = data[today].tasks;
        res.json({ tasks });
    } else {
        res.json({ tasks: [] });
    }
});

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

let taskIdCounter = 1; // Counter for generating task IDs

function generateTaskId() {
    const today = new Date();
    const formattedDate = `${today.getDate()}${today.getMonth() + 1}${today.getFullYear()}`;
    const taskId = `${formattedDate}t${taskIdCounter}`;
    taskIdCounter++;
    return taskId;
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
