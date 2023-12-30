function updateClockDisplay() {
    const currentTime = new Date();
    document.getElementById('clockDisplay').innerText = currentTime.toLocaleTimeString();
}

// Add event listeners to the buttons directly
document.getElementById('clockInButton').addEventListener('click', () => 
sendRequest('clock-in'));
document.getElementById('startBreakButton').addEventListener('click', () => sendRequest('start-break'));
document.getElementById('endBreakButton').addEventListener('click', () => sendRequest('end-break'));
document.getElementById('clockOutButton').addEventListener('click', () => sendRequest('clock-out'));

function sendRequest(action) {
    fetch(`http://localhost:3000/${action}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.text())
    .then(message => {
        console.log(message);
        alert(message);
        updateClockDisplay();
    })
    .catch(error => console.error('Error:', error));
}

// Update clock display every second
setInterval(updateClockDisplay, 1000);


