@echo off
cd K:\Fine_Tune_LLM\WorkHours
start /B node server.js
timeout /t 1 /nobreak > nul
# Retrieve the local IP address
local_ip=$(hostname -I | awk '{print $1}')
start chrome "http://$local_ip:3000/"
