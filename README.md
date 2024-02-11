## WorkHours

WorkHours is a simple time and task tracking application built using Node.js and Express. It allows users to record clock-in/out times, breaks, and manage their tasks throughout the day.

### Features

Directly run the app using the batch script.

1. No Database
2. Runs Locally
3. Simple Click and Run
4. Detailed Summary of time logs
5. CRUD operations for tasks
6. Change Theme with RCtrl
7. Change Clock and Date format by Clicking
8. Sort Tasks by Dragging
9. Order of Daily and Long-Term Tasks saved in LocalStorage
10. CRUD operations for Long-Term Tasks
11. Update Tasks by clicking and hitting enter

### Table of Contents

- [Installation](#installation)
- [Warning](#Warning)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Folder Structure](#folder-structure)
- [Dependencies](#dependencies)


### Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/Jeet-Pattani/WorkHours.git
   ```
2. Install the packages and run the server
    ```npm i
    node server
    ```
3. Or Simply run the RunServer.bat file   


### Warning
For proper functionality, ensure you modify the IP address in script.js to match your machine's IP or use 'localhost' if running locally. Replace '192.168.1.7' with 'localhost' if you're working solely on your laptop. Use the local IP for mobile devices and machines on the same network to access the app.

#### Run using the shortcut

Directly run the app using the batch script.

1. Change the location inside `RunServer.bat` and save it.
2. Double-click on `RunServer.bat`.
3. The server will start, and you can access the application in your web browser at [http://localhost:3000/](http://localhost:3000/).

### Usage

- Open the application in a web browser.
- Use the provided buttons to record clock-in/out times, start/end breaks, and manage tasks.
- Add tasks using the "Add Task" button and remove them as needed.

### Endpoints

- **POST /clock-in:**
  Record the clock-in time.

- **POST /start-break:**
  Start a break.

- **POST /end-break:**
  End a break.

- **POST /clock-out:**
  Record the clock-out time.

- **GET /get-summary:**
  Get summary of work including work duration, break duration, and number of breaks.

- **GET /get-user-status:**
  Get the user's current status (e.g., clocked-in, on break, clocked-out).

- **GET /get-tasks:**
  Get the list of tasks for the current day.

- **POST /add-task:**
  Add a new task for the current day.

- **POST /remove-task:**
  Remove a task.

- **POST /complete-task:**
  Mark a task as completed.

- **POST /update-task:**
  Update the description of a task.

- **POST /add-lt-task:**
  Add a long-term task or note.

- **POST /update-lt-task:**
  Update the description of a long-term task.

- **POST /remove-lt-task:**
  Remove a long-term task or note.

- **POST /complete-lt-task:**
  Mark a long-term task as completed.

- **GET /get-lt-tasks:**
  Get the list of long-term tasks or notes.

- **GET /get-server-time:**
  Get the Time from server in 24/12hr format.

- **GET /get-server-date:**
  Get the date in different descriptive/numeric format.

### Folder Structure

```
WorkHours
|-- data.json
|-- server.js
|-- index.html
|-- package.json
|-- package-lock.json
|-- RunServer.bat
|-- css
|   `-- style.css
|-- js
|   |-- axios.min.js
|   |-- Sortable.min.js
|   |-- SortableConfig.js
|   `-- script.js
|   `-- modeSwitch.js
|-- images
|   |-- light.jpg
|   `-- dark.jpg
|   `-- sun.jpg
|   `-- moon.jpg
|   `-- clock-in.jpg
|   `-- clock-out.jpg
|   `-- start-break.jpg
|   `-- end-break.jpg
```

### Dependencies

- **Express.js:** Web application framework.
- **Axios:** HTTP client for making requests.
- **Body-parser:** Middleware to parse HTTP request bodies.
- **Cors:** Middleware to enable CORS.