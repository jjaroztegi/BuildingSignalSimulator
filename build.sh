#!/bin/bash

# --- Configuration ---
BUILD_TESTS=0
if [ "$1" = "--with-tests" ]; then
    BUILD_TESTS=1
fi

TOMCAT_WEBAPPS="/opt/homebrew/opt/tomcat/libexec/webapps"
APP_NAME="BuildingSignalSimulator"
PACKAGE_NAME="com/signalapp"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JAKARTA_MIGRATOR="$SCRIPT_DIR/tools/jakartaee-migration-1.0.9-shaded.jar"
WAR_ORIG="$APP_NAME.war"
WAR_MIGRATED="$APP_NAME-jakarta.war"

# --- Set classpath using local lib folder ---
CLASSPATH="src"
for jar in lib/*.jar; do
    CLASSPATH="$CLASSPATH:$jar"
done

# --- Compilation ---
echo "Compiling Java files..."
mkdir -p "build/classes"

# Compile Java files dynamically based on the package name, excluding tests by default
find "src/$PACKAGE_NAME" -name "*.java" | while read -r file; do
    if [ $BUILD_TESTS -eq 0 ]; then
        if [[ "$file" != *"/tests/"* ]]; then
            # echo "Compiling $(basename "$file")..."
            javac --release 8 -Xlint:-options -d build/classes -cp "$CLASSPATH" "$file"
        fi
    else
        # echo "Compiling $(basename "$file")..."
        javac --release 8 -Xlint:-options -d build/classes -cp "$CLASSPATH" "$file"
    fi
done

# --- Run tests if enabled ---
if [ $BUILD_TESTS -eq 1 ]; then
    echo "Running tests..."
    # --- Run AccessConnection test ---
    echo "Testing database connection..."
    java -cp "$CLASSPATH:build/classes" com.signalapp.tests.AccessTest

    # --- Run DerbyConnection test ---
    echo "Testing database connection..."
    java -cp "$CLASSPATH:build/classes" com.signalapp.tests.DerbyTest
fi

# --- Deployment ---
echo "Deploying to Tomcat..."

# Remove the existing application directory if it exists
rm -rf "$TOMCAT_WEBAPPS/$APP_NAME"

# Recreate the application directory
mkdir -p "$TOMCAT_WEBAPPS/$APP_NAME"

# Copy webapp folder content
cp -R webapp/* "$TOMCAT_WEBAPPS/$APP_NAME/"
if [ -f "$TOMCAT_WEBAPPS/$APP_NAME/css/input.css" ]; then
    rm "$TOMCAT_WEBAPPS/$APP_NAME/css/input.css"
fi

# Create WEB-INF/classes directories
mkdir -p "$TOMCAT_WEBAPPS/$APP_NAME/WEB-INF/classes/$PACKAGE_NAME"

# Copy the compiled class files
cp -R build/classes/* "$TOMCAT_WEBAPPS/$APP_NAME/WEB-INF/classes/"

# Copy the source .java files
echo "Copying source files..."
SRC_DIR="src/$PACKAGE_NAME"
DST_DIR="$TOMCAT_WEBAPPS/$APP_NAME/WEB-INF/classes/$PACKAGE_NAME"

if [ $BUILD_TESTS -eq 0 ]; then
    rsync -a --include='*/' --include='*.java' --exclude='*Test.java' --exclude='tests/' --exclude='*' "$SRC_DIR/" "$DST_DIR/" >/dev/null
else
    rsync -a --include='*/' --include='*.java' --exclude='*' "$SRC_DIR/" "$DST_DIR/" >/dev/null
fi

# Copy Derby JAR
echo "Copying Derby JAR..."
mkdir -p "$TOMCAT_WEBAPPS/$APP_NAME/WEB-INF/lib"
cp lib/derby.jar "$TOMCAT_WEBAPPS/$APP_NAME/WEB-INF/lib/"

# Copy derby database
mkdir -p "$TOMCAT_WEBAPPS/$APP_NAME/WEB-INF/database/DistribucionDeSenal"
cp -R database/DistribucionDeSenal/* "$TOMCAT_WEBAPPS/$APP_NAME/WEB-INF/database/DistribucionDeSenal/"

# --- Create WAR and Run Migration ---
echo "Packaging WAR from exploded deployment..."
cd "$TOMCAT_WEBAPPS/$APP_NAME" || exit 1
jar -cf "$SCRIPT_DIR/$WAR_ORIG" .

echo "Running Jakarta EE Migration Tool..."
java -jar "$JAKARTA_MIGRATOR" \
    -profile=EE \
    "$SCRIPT_DIR/$WAR_ORIG" "$SCRIPT_DIR/$WAR_MIGRATED" >/dev/null 2>&1

echo "Deploying migrated WAR to Tomcat..."
rm -rf "$TOMCAT_WEBAPPS/$APP_NAME"
cp "$SCRIPT_DIR/$WAR_MIGRATED" "$TOMCAT_WEBAPPS/$WAR_ORIG"

cd "$SCRIPT_DIR" || exit 1

echo "Deployment complete."

# --- Restart Tomcat ---
echo "Restarting Tomcat..."
brew services restart tomcat
echo "Tomcat restarted."

echo "Access your application at http://localhost:8080/$APP_NAME/"
