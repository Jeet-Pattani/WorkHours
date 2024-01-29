// on frontend userStatus.js:
const clockInBtn = document.getElementById('clockInButton');
const clockOutBtn = document.getElementById('clockOutButton');
const startBreakBtn = document.getElementById('startBreakButton');
const endBreakBtn = document.getElementById('endBreakButton');

// Function to fetch user status from the server and update the UI
async function updateUserStatus() {
  try {
    const response = await axios.get('http://localhost:3000/get-user-status');
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
