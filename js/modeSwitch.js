// Function to toggle between dark and light mode
function toggleMode() {
    document.body.classList.toggle('dark-mode');
}

// script.js (assuming this script file handles other functionality)
// Add an event listener to the modeToggle button
document.getElementById('modeToggle').addEventListener('click', toggleMode());
