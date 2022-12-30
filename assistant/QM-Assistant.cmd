@echo off
if exist "D:\Quality Management\assistant\" start "digital assistant - do not close this window!" assistant --webfolder "D:/Quality Management/assistant/" --browser edge
if exist "C:\Users\dev\documents\code\aqms\assistant\" start "digital assistant - do not close this window!" assistant --webfolder "C:/Users/dev/documents/code/aqms/assistant/" --browser edge
rem py assistant.py --webfolder "C:/Users/dev/documents/code/aqms/assistant/" --browser edge

if %errorlevel% GTR 0 (
    echo.
    echo Error starting wrapper application. Please contact application administration for help.
    echo About to start web application without wrapper by default, but there might be reduced functionality!
    echo Your default browser must support HTML5/ECMAScript 6+
    echo.
    pause
    start "" "D:\Quality Management\assistant\html\core.html"
)
