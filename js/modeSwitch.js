/*
// LIGHT MODE BY DEFAULT
// Function to toggle between dark and light mode
function toggleMode() {
    document.body.classList.toggle('dark-mode');
}

// Add an event listener to the modeToggle button
document.getElementById('modeToggle').addEventListener('click', toggleMode);
document.addEventListener(
    "keydown",
    (event) => {
        if (event.key === 'Control' && event.code === 'ControlRight') {
            console.log("Right Control is Pressed")
            toggleMode();
        }
    },
); */

//  DARK MODE BY DEFAULT
// Function to toggle between dark and light mode
function toggleMode() {
    document.body.classList.toggle('dark-mode');
}

// Add dark mode by default
document.body.classList.add('dark-mode');

// Add an event listener to the modeToggle button
document.getElementById('modeToggle').addEventListener('click', toggleMode);
document.addEventListener(
    "keydown",
    (event) => {
        if (event.key === 'Control' && event.code === 'ControlRight') {
            console.log("Right Control is Pressed")
            toggleMode();
        }
    },
);


