#!/bin/bash

# --- Configuration ---
TOMCAT_VERSION="11.0.4"
TOMCAT_WEBAPPS="/opt/homebrew/Cellar/tomcat/$TOMCAT_VERSION/libexec/webapps"
SERVLET_API_JAR="lib/servlet-api.jar"
APP_NAME="BuildingSignalSimulator"

# --- Compilation ---
echo "Compiling HelloWorldServlet..."
javac -cp "$SERVLET_API_JAR" src/com/example/HelloWorldServlet.java

# --- Deployment ---
echo "Deploying to Tomcat..."
# Remove everything in the existing deploy folder
rm -rf "$TOMCAT_WEBAPPS/$APP_NAME/*"

#Copy just the webapp folder
cp -r webapp/* "$TOMCAT_WEBAPPS/$APP_NAME/"

# Copy the class file
mkdir -p "$TOMCAT_WEBAPPS/$APP_NAME/WEB-INF/classes/com/example"
cp src/com/example/HelloWorldServlet.class "$TOMCAT_WEBAPPS/$APP_NAME/WEB-INF/classes/com/example/"

echo "Deployment complete. Access your application at http://localhost:8080/$APP_NAME/"

# --- Restart Tomcat ---
echo "Restarting Tomcat..."
brew services restart tomcat