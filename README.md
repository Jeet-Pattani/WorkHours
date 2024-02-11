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
9. Save the order of Daily and Long-Term Tasks
10. CRUD operations for Long-Term Tasks
11. Update Tasks by clicking and hitting enter

### Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Folder Structure](#folder-structure)
- [Dependencies](#dependencies)


### Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/your-username/workhours-tracker.git
   npm install
   node server
   ```

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

- **GET /get-server-date-time:**
  Get the current server date and time.

- **GET /get-summary:**
  Get a summary of the work session, including total work duration, total break duration, number of breaks, and break details.

- **POST /clock-in:**
  Record the clock-in time.

- **POST /start-break:**
  Start a break.

- **POST /end-break:**
  End the ongoing break.

- **POST /clock-out:**
  Record the clock-out time.

- **GET /get-user-status:**
  Know if user is clocked-in,clocked-out,on-break,back-to-work,not-on-work

- **POST /add-task:**
  Add a new task.

- **POST /update-task:**
  Update an existing task.

- **POST /complete-task:**
  Mark a task as completed.

- **POST /remove-task:**
  Remove a task.

- **GET /get-tasks:**
  Get the list of tasks.

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