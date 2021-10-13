@echo off
call assistant --webfolder: "D:/Quality Management/assistant/" --browser: Edge
rem py assistant.py --webfolder: "D:/Quality Management/assistant/"

if %errorlevel% GTR 0 (
    echo.
    echo Error starting wrapper application. Please contact application administration for help.
    echo About to start web application without wrapper by default, but there might be reduced functionality!
    echo Your default browser must support HTML5/ECMAScript 6+
    echo.
    pause
    start "" "D:\Quality Management\assistant\html\core.html"
)
