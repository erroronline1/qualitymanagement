@echo off
call assistant --webfolder: "D:/Quality Management/assistant/"
rem py assistant.py --webfolder: "D:/Quality Management/assistant/"

if %errorlevel% == 1 (
    echo.
    echo Error starting wrapper application. Please contact application administration for help.
    echo About to start web application without wrapper by default, but there might be reduced functionality!
    echo.
    pause
    start "" "D:\Quality Management\assistant\html\core.html"
)​
