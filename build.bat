@echo off

REM --- Configuration ---
set "CATALINA_HOME=C:\Program Files\Apache Software Foundation\Tomcat 11.0"
set "TOMCAT_WEBAPPS=%CATALINA_HOME%\webapps"
set "SERVLET_API_JAR=%CATALINA_HOME%\lib\servlet-api.jar"
set "APP_NAME=BuildingSignalSimulator"

REM --- Compilation ---
echo Compiling HelloWorldServlet...
javac -cp "%SERVLET_API_JAR%" src\com\example\HelloWorldServlet.java

REM --- Deployment ---
echo Deploying to Tomcat...

REM Remove the existing application directory if it exists
if exist "%TOMCAT_WEBAPPS%\%APP_NAME%" (
    rd /s /q "%TOMCAT_WEBAPPS%\%APP_NAME%"
)

REM Recreate the application directory
mkdir "%TOMCAT_WEBAPPS%\%APP_NAME%"

REM Copy just the webapp folder
xcopy /E /I /Y "webapp\*" "%TOMCAT_WEBAPPS%\%APP_NAME%\"

REM Copy the class file
mkdir "%TOMCAT_WEBAPPS%\%APP_NAME%\WEB-INF\classes\com\example"
copy "src\com\example\HelloWorldServlet.class" "%TOMCAT_WEBAPPS%\%APP_NAME%\WEB-INF\classes\com\example\"

echo Deployment complete.
echo Access your application at http://localhost:8080/%APP_NAME%/

REM --- Restart Tomcat ---
echo Restarting Tomcat...
call "%CATALINA_HOME%\bin\catalina.bat" stop
timeout /t 1 /nobreak > NUL
call "%CATALINA_HOME%\bin\catalina.bat" start
echo Tomcat restarted.

exit
