@echo off

setlocal EnableDelayedExpansion

REM --- Configuration ---
set "CATALINA_BASE=C:\Temp\Tomcat"
set "CATALINA_HOME=C:\Programs\JavaStack\apache-tomcat-9.0.89"
set "CATALINA_TMPDIR=C:\Temp\Tomcat\temp"
set "JRE_HOME=C:\Programs\JavaStack\jdk1.8.0_131"
set "CLASSPATH=C:\Programs\JavaStack\apache-tomcat-9.0.89\bin\bootstrap.jar;C:\Programs\JavaStack\apache-tomcat-9.0.89\bin\tomcat-juli.jar"
set "JAVA_HOME=C:\Programs\JavaStack\jdk1.8.0_131"

set "TOMCAT_WEBAPPS=C:\Temp\Tomcat\webapps"
set "APP_NAME=BuildingSignalSimulator"

REM --- Set classpath using local lib folder ---
set "CLASSPATH=."
for %%i in (lib\*.jar) do (
    set "CLASSPATH=!CLASSPATH!;%%i"
)

REM --- Compilation ---
echo Compiling Java files...
mkdir "build\classes" 2>nul

REM Compile HelloWorldServlet
echo Compiling HelloWorldServlet...
javac -d build\classes -cp "%CLASSPATH%" src\com\example\HelloWorldServlet.java

REM Compile AccessConnection
echo Compiling AccessConnection...
javac -d build\classes -cp "%CLASSPATH%" src\com\example\AccessConnection.java

REM --- Run AccessConnection test ---
echo Testing database connection...
java -cp "%CLASSPATH%;build\classes" com.example.AccessConnection

REM Compile DatabaseInfoServlet
echo Compiling DatabaseInfoServlet...
javac -d build\classes -cp "%CLASSPATH%" src\com\example\DatabaseInfoServlet.java

REM --- Deployment ---
echo Deploying to Tomcat...

REM Remove the existing application directory if it exists
if exist "%TOMCAT_WEBAPPS%\%APP_NAME%" (
    rd /s /q "%TOMCAT_WEBAPPS%\%APP_NAME%"
)

REM Recreate the application directory
mkdir "%TOMCAT_WEBAPPS%\%APP_NAME%"

REM Copy webapp folder content
xcopy /E /I /Y "webapp\*" "%TOMCAT_WEBAPPS%\%APP_NAME%\"

REM Create WEB-INF\classes directories
mkdir "%TOMCAT_WEBAPPS%\%APP_NAME%\WEB-INF\classes\com\example"

REM Copy the compiled class files
xcopy /E /I /Y "build\classes\*" "%TOMCAT_WEBAPPS%\%APP_NAME%\WEB-INF\classes\"

REM Copy lib folder with all JARs
mkdir "%TOMCAT_WEBAPPS%\%APP_NAME%\WEB-INF\lib"
xcopy /Y "lib\*.jar" "%TOMCAT_WEBAPPS%\%APP_NAME%\WEB-INF\lib\"

REM Copy access database
mkdir "%TOMCAT_WEBAPPS%\%APP_NAME%\WEB-INF\database"
xcopy /Y "database\*.accdb" "%TOMCAT_WEBAPPS%\%APP_NAME%\WEB-INF\database\"

echo Deployment complete.
echo Access your application at http://localhost:8082/%APP_NAME%/

REM --- Restart Tomcat ---
echo Restarting Tomcat...
call "%CATALINA_HOME%\bin\catalina.bat" stop
timeout /t 1 /nobreak > NUL
call "%CATALINA_HOME%\bin\catalina.bat" start
echo Tomcat restarted.

exit