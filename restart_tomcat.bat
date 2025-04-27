@echo off

REM --- Configuration ---
set "CATALINA_BASE=C:\Temp\Tomcat"
set "CATALINA_HOME=C:\Programs\JavaStack\apache-tomcat-9.0.89"
set "CATALINA_TMPDIR=C:\Temp\Tomcat\temp"

echo Stopping Tomcat...
call "%CATALINA_HOME%\bin\catalina.bat" stop > NUL 2>&1
timeout /t 2 /nobreak > NUL

echo Starting Tomcat...
call "%CATALINA_HOME%\bin\catalina.bat" start

echo Tomcat has been restarted successfully.