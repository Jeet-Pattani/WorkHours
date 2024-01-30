const fs = require('fs');
const path = require('path');

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

function getCurrentDateTime() {
    const now = new Date();

    const day = now.getDate();
    const month = now.getMonth() + 1; // Months are zero-based
    const year = now.getFullYear();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Pad single-digit values with leading zeros
    const formattedDate = padZero(day) + '/' + padZero(month) + '/' + year;
    const formattedTime = padZero(hours) + ':' + padZero(minutes) + ':' + padZero(seconds);

    return formattedDate + ' ' + formattedTime;
}

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

function clockIn() {
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
}

function startBreak() {
    const currentDateTime = getCurrentDateTime();
    const data = loadData();
    const today = new Date().toLocaleDateString();

    if (!data[today]) {
        data[today] = { time: { clockInTime: null, breaks: [], clockOutTime: null }, tasks: [], userStatus: 'not on work' };
    }

    data[today].time.breaks.push({ type: 'Start Break', time: currentDateTime });
    data[today].userStatus = 'on-break';
    saveData(data);
    console.log('Break started.');
}

function endBreak() {
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
    } else {
        console.log('Error: Break not started.');
    }
}

function clockOut() {
    const currentDateTime = getCurrentDateTime();
    const data = loadData();
    const today = new Date().toLocaleDateString();
    const timeData = data[today] ? data[today].time : null;

    if (timeData && timeData.clockInTime) {
        // Use calculateTotalBreakDuration instead of calculateTotalBreakDurationWithDate
        const totalBreakDuration = calculateTotalBreakDuration(timeData.breaks);
        const workDuration = calculateTimeDifferenceWithDate(timeData.clockInTime, currentDateTime);
        timeData.clockOutTime = currentDateTime;
        data[today].userStatus = 'clocked-out';
        saveData(data);
        console.log(`Clock Out recorded. Work duration: ${workDuration}, Total Break duration: ${totalBreakDuration}`);
    } else {
        console.log('Error: Clock In not recorded.');
    }
}

function getSummary() {
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
    } else {
        console.log('Error: No data available for today.');
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


function prompt(question) {
    const readline = require('readline-sync');
    return readline.question(question);
}

function main() {
    console.log('Welcome to the Time Tracking Console App!');
    let exit = false;

    while (!exit) {
        console.log('\nChoose an option:');
        console.log('1. Clock In');
        console.log('2. Start Break');
        console.log('3. End Break');
        console.log('4. Clock Out');
        console.log('5. Get Summary');
        console.log('0. Exit');

        const choice = prompt('Enter your choice: ');

        switch (choice) {
            case '1':
                clockIn();
                break;
            case '2':
                startBreak();
                break;
            case '3':
                endBreak();
                break;
            case '4':
                clockOut();
                break;
            case '5':
                getSummary();
                break;
            case '0':
                exit = true;
                break;
            default:
                console.log('Invalid choice. Please try again.');
        }
    }
}

main();
