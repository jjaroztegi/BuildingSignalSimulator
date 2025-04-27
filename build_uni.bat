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
set "PACKAGE_NAME=com\signalapp"

REM --- Set classpath using local lib folder ---
set "CLASSPATH=src"
for %%i in (lib\*.jar) do (
    set "CLASSPATH=!CLASSPATH!;%%i"
)

REM --- Compilation ---
echo Compiling Java files...
if exist "build\classes" rd /s /q "build\classes"
mkdir "build\classes"

REM Compile Java files dynamically based on the package name
for /R "src\%PACKAGE_NAME%" %%f in (*.java) do (
    @REM echo Compiling %%~nxf...
    "%JAVA_HOME%\bin\javac" -d build\classes -cp "%CLASSPATH%" "%%f"
)

REM --- Run AccessConnection test ---
@REM echo Testing database connection...
@REM java -cp "%CLASSPATH%;build\classes" %PACKAGE_NAME:\=.%.tests.AccessTest

REM --- Run DerbyConnection test ---
@REM echo Testing database connection...
@REM java -cp "%CLASSPATH%;build\classes" %PACKAGE_NAME:\=.%.tests.DerbyTest

REM --- Deployment ---
echo Deploying to Tomcat...

REM Stop Tomcat before deployment
echo Stopping Tomcat...
call "%CATALINA_HOME%\bin\catalina.bat" stop > NUL 2>&1
timeout /t 2 /nobreak > NUL

REM Remove the existing application directory if it exists
if exist "%TOMCAT_WEBAPPS%\%APP_NAME%" (
    echo Removing existing application directory...
    rd /s /q "%TOMCAT_WEBAPPS%\%APP_NAME%"
    timeout /t 1 /nobreak > NUL
)

REM Create fresh directories
echo Creating application directories...
mkdir "%TOMCAT_WEBAPPS%\%APP_NAME%"
mkdir "%TOMCAT_WEBAPPS%\%APP_NAME%\WEB-INF\classes\%PACKAGE_NAME%"
mkdir "%TOMCAT_WEBAPPS%\%APP_NAME%\WEB-INF\lib"
mkdir "%TOMCAT_WEBAPPS%\%APP_NAME%\WEB-INF\database"

REM Copy webapp folder content
echo Copying webapp files...
xcopy /E /I /Y "webapp\*" "%TOMCAT_WEBAPPS%\%APP_NAME%\" > NUL

REM Copy the compiled class files
echo Copying compiled classes...
xcopy /E /I /Y "build\classes\*" "%TOMCAT_WEBAPPS%\%APP_NAME%\WEB-INF\classes\" > NUL

REM Copy the source .java files
echo Copying source files...
xcopy /E /I /Y "src\%PACKAGE_NAME%\*.java" "%TOMCAT_WEBAPPS%\%APP_NAME%\WEB-INF\classes\%PACKAGE_NAME%" > NUL

REM Copy lib folder with all JARs
echo Copying library files...
xcopy /Y "lib\derby.jar" "%TOMCAT_WEBAPPS%\%APP_NAME%\WEB-INF\lib\" > NUL

@REM REM Copy access database
@REM echo Copying database files...
@REM xcopy /Y "database\*.accdb" "%TOMCAT_WEBAPPS%\%APP_NAME%\WEB-INF\database\" > NUL

REM Copy derby database
echo Copying database files...
xcopy /Y /E /I "database\DistribucionDeSenal\*" "%TOMCAT_WEBAPPS%\%APP_NAME%\WEB-INF\database\DistribucionDeSenal\" > NUL

echo Deployment complete.

echo Creating WAR file with compression...
"%JAVA_HOME%\bin\jar" -cf BuildingSignalSimulator.war -C "%TOMCAT_WEBAPPS%\%APP_NAME%" . > NUL
echo WAR file created successfully with compression.

REM --- Start Tomcat ---
echo Starting Tomcat...
call "%CATALINA_HOME%\bin\catalina.bat" start
echo Tomcat started.

echo Access your application at http://localhost:8082/%APP_NAME%/
exit