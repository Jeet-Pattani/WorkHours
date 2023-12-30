# WorkHours

WorkHours Tracker is a simple time and task tracking application built using Node.js and Express. It allows users to record clock-in/out times, breaks, and manage their tasks throughout the day.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Folder Structure](#folder-structure)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/your-username/workhours-tracker.git
   npm install
   node server

## Usage
- Open the application in a web browser.
- Use the provided buttons to record clock-in/out times, start/end breaks, and manage tasks.
- Add tasks using the "Add Task" button and remove them as needed.

## Endpoints
- GET /get-server-time: Get the current server time.
- POST /clock-in: Record the clock-in time.
- POST /start-break: Start a break.
- POST /end-break: End the ongoing break.
- POST /clock-out: Record the clock-out time.
- POST /add-task: Add a new task.
- POST /complete-task: Mark a task as completed.
- POST /remove-task: Remove a task.


## Dependencies
- Express.js: Web application framework.
- Axios: HTTP client for making requests.
- Body-parser: Middleware to parse HTTP request bodies.
- Cors: Middleware to enable CORS.
   
