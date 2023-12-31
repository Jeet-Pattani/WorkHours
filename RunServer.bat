@echo off
cd D:\Project_Dir\WorkHours
start /B node server.js
timeout /t 2 /nobreak > nul
start chrome http://localhost:3000/
