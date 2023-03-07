@ECHO OFF

:: in working environment python is not installed by default.
:: only on dev workstations user will be prompted if they want to launch direct or compiled version

SETLOCAL ENABLEDELAYEDEXPANSION
:: setup vars
SET dev_env=
:: home dev env
SET home_name="C:/Users/dev/documents/code/aqms/assistant/"
SET home_location="C:\Users\dev\documents\code\aqms\assistant\"
:: work dev env
SET dev_name="E:/dev/aqms/assistant/"
SET dev_location="E:\dev\aqms\assistant\"
:: production env
SET runtime_name="D:/Quality Management/assistant/"
SET runtime_location="D:\Quality Management\assistant\"
:: python. existence of .venv is assumed later
SET python_name="Python 3.8"
SET python_location="C:\Program Files\Python38"

IF EXIST %home_location% (
    SET dev_name=%home_name%
    SET dev_location=%home_location%
) 

IF EXIST %python_location% (
    :: optional change to dev environment, launch .venv, start py-project
    ECHO [^^!] I see, you're a person of culture.  %python_name:"=% is available on your machine. 
    SET /P "dev_env=[?] Want to start %python_name:"=%-environment in %dev_location% [y/N]? "
    IF /I "!dev_env!"=="y" (
        IF NOT EXIST %home_location% (
            CD %dev_location:~1,2% >> NUL
            IF NOT "%cd%"=="%dev_location:"=%" (
                CD /D "%dev_location:"=%"
            )
            CALL %dev_location:"=%\.venv\Scripts\activate
            ECHO [*] Virtual environment for python activated, assistant started as PYTHON in developer environment
        )
        START py "%dev_location:"=%assistant.py" --webfolder %dev_name% --browser edge
        GOTO :end
    ) ELSE (
        :: if not reassigned an empty dev_env-value results in errorlevel=1. also the info about exe doesn't concern anyone else
        SET dev_env=n
        ECHO [~] %python_name:"=% not available/launched, assistant started as EXE
    )
)

:: launch executable by default. copy to temp in advance to make original file updateable even if launched on several workstations
IF EXIST %runtime_location% (
    COPY "%runtime_location:"=%assistant.exe" %TEMP% >> NUL
    START %TEMP%\assistant.exe --webfolder "%runtime_name:"=%" --browser edge
    IF %errorlevel% GTR 0 (
        echo %errorlevel%
        :: webview as fallback, even if not recommended for several reasons, documents are still accessible
        ECHO.
        ECHO [^^!] Error starting wrapper application. Please contact application administration for help.
        ECHO [^^!] About to start web application without wrapper by default, but there might be reduced functionality.
        ECHO [^^!] Your default browser must support HTML5/ECMAScript 6+
        ECHO.
        PAUSE
        START "" "%runtime_name:"=%html/core.html"
    )
) ELSE (
    ECHO %runtime_location% not available...
    PAUSE
)
:end
EXIT /B 0