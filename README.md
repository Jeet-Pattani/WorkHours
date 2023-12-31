## WorkHours

WorkHours is a simple time and task tracking application built using Node.js and Express. It allows users to record clock-in/out times, breaks, and manage their tasks throughout the day.

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

### Usage

- Open the application in a web browser.
- Use the provided buttons to record clock-in/out times, start/end breaks, and manage tasks.
- Add tasks using the "Add Task" button and remove them as needed.

### Endpoints

- **GET /get-server-date-time:**
  Get the current server date and time.

- **POST /clock-in:**
  Record the clock-in time.

- **POST /start-break:**
  Start a break.

- **POST /end-break:**
  End the ongoing break.

- **POST /clock-out:**
  Record the clock-out time.

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
```

### Dependencies

- **Express.js:** Web application framework.
- **Axios:** HTTP client for making requests.
- **Body-parser:** Middleware to parse HTTP request bodies.
- **Cors:** Middleware to enable CORS.
