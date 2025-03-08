#!/bin/bash

# --- Configuration ---
TOMCAT_VERSION="11.0.4"
TOMCAT_WEBAPPS="/opt/homebrew/Cellar/tomcat/$TOMCAT_VERSION/libexec/webapps"
APP_NAME="BuildingSignalSimulator"

# --- Set classpath using project lib folder ---
CLASSPATH="."
for jar in lib/*.jar; do
  CLASSPATH="$CLASSPATH:$jar"
done

# --- Compilation ---
echo "Compiling Java files..."
mkdir -p build/classes

# Compile HelloWorldServlet
echo "Compiling HelloWorldServlet..."
javac -d build/classes -cp "$CLASSPATH" src/com/example/HelloWorldServlet.java

# Compile AccessConnection
echo "Compiling AccessConnection..."
javac -d build/classes -cp "$CLASSPATH" src/com/example/AccessConnection.java

# --- Run AccessConnection test ---
echo "Testing database connection..."
java -cp "$CLASSPATH:build/classes" com.example.AccessConnection

# Compile DatabaseInfoServlet
echo "Compiling DatabaseInfoServlet..."
javac -d build/classes -cp "$CLASSPATH" src/com/example/DatabaseInfoServlet.java

# --- Deployment ---
echo "Deploying to Tomcat..."

# Create application directory if it doesn't exist
mkdir -p "$TOMCAT_WEBAPPS/$APP_NAME"

# Remove everything in the existing deploy folder
rm -rf "$TOMCAT_WEBAPPS/$APP_NAME/*"

# Copy webapp folder content
cp -r webapp/* "$TOMCAT_WEBAPPS/$APP_NAME/"

# Create WEB-INF/classes directory
mkdir -p "$TOMCAT_WEBAPPS/$APP_NAME/WEB-INF/classes"

# Copy all compiled class files
cp -r build/classes/* "$TOMCAT_WEBAPPS/$APP_NAME/WEB-INF/classes/"

# Copy lib folder with all JARs
mkdir -p "$TOMCAT_WEBAPPS/$APP_NAME/WEB-INF/lib"
cp lib/*.jar "$TOMCAT_WEBAPPS/$APP_NAME/WEB-INF/lib/"

echo "Deployment complete."
echo "Access your application at http://localhost:8080/$APP_NAME/"

# --- Restart Tomcat ---
echo "Restarting Tomcat..."
brew services restart tomcat