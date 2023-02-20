@ECHO OFF

:: in working environment python is not installed by default.
:: only on dev workstations user will be prompted if they want to launch direct or compiled version

SETLOCAL ENABLEDELAYEDEXPANSION
:: setup vars
SET dev_env=
SET dev_name="C:/Users/dev/documents/code/aqms/assistant/"
SET dev_location="C:\Users\dev\documents\code\aqms\assistant\"
SET runtime_name="D:/Quality Management/assistant/"
SET runtime_location="D:\Quality Management\assistant\"
SET python_name="Python 3.8"
SET python_location="C:\Program Files\Python38"

IF EXIST %python_location% (
    :: optional change to dev environment, launch .venv, start py-project
    echo [!] I see, you're a person of culture.  %python_name:"=% is available on your machine. 
    SET /P "dev_env=[?] Want to start %python_name:"=%-environment [y/N]? "
    IF /I "!dev_env!"=="y" (
        CD %dev_location:~1,2% >> NUL
        IF NOT "%cd%"=="%dev_location:"=%" (
            CD /D "%dev_location:"=%"
        )
        CALL %dev_location:"=%\.venv\Scripts\activate
        ECHO [*] Virtual environment for python activated, assistant started as PYTHON in developer environment
        START py "%dev_location:"=%\assistant.py" --webfolder %dev_name% --browser edge
        GOTO :end
    )
)

:: launch executable by default. copy to temp in advance to make original file updateable even if launched on several workstations
ECHO [~] %python_name:"=% not available/launched, assistant started as EXE
COPY "%runtime_location:"=%\assistant.exe" %TEMP% >> NUL
START %TEMP%\assistant.exe --webfolder "%runtime_name:"=%" --browser edge
if %errorlevel% GTR 0 (
    :: webview as fallback, even if not recommended for several reasons, documents are still accessible
    echo.
    echo [!] Error starting wrapper application. Please contact application administration for help.
    echo [!] About to start web application without wrapper by default, but there might be reduced functionality.
    echo [!] Your default browser must support HTML5/ECMAScript 6+
    echo.
    pause
    start "" "%runtime_name:"=%html/core.html"
)
:end
EXIT /B 0