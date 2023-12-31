@echo off
cd K:\Fine_Tune_LLM\WorkHours
start /B node server.js
timeout /t 2 /nobreak > nul
start chrome http://localhost:3000/
