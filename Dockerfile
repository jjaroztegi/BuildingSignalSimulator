FROM tomcat:9.0.104-jdk8-corretto

# Set environment variables
ENV CATALINA_HOME=/usr/local/tomcat
ENV JAVA_HOME=/usr/lib/jvm/java-1.8.0-amazon-corretto
ENV APP_NAME=BuildingSignalSimulator

# Create application directory
RUN mkdir -p ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/classes
RUN mkdir -p ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/lib
RUN mkdir -p ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/database
RUN mkdir -p /tmp/src/com/signalapp

# # Copy the MS Access database
# COPY database/DistribucionDeSenal.accdb ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/database/

# Copy the Derby database
COPY database/DistribucionDeSenal/ ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/database/DistribucionDeSenal/

# Copy the JAR dependencies
COPY lib/*.jar ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/lib/

# Copy the web application files
COPY webapp/* ${CATALINA_HOME}/webapps/${APP_NAME}/
COPY webapp/WEB-INF/* ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/
COPY webapp/js ${CATALINA_HOME}/webapps/${APP_NAME}/js/
COPY webapp/css ${CATALINA_HOME}/webapps/${APP_NAME}/css/
COPY webapp/img ${CATALINA_HOME}/webapps/${APP_NAME}/img/

# Copy Java source files
COPY src/com/signalapp /tmp/src/com/signalapp/

# Create classpath for compilation
RUN echo -n "." > /tmp/classpath.txt && \
    find ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/lib -name "*.jar" -exec printf ":%s" {} \; >> /tmp/classpath.txt

# List all Java files to compile
RUN find /tmp/src -name "*.java" > /tmp/sources.txt

# Compile Java classes
RUN javac -cp $(cat /tmp/classpath.txt) \
    -d ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/classes \
    @/tmp/sources.txt

# Clean up
RUN rm -rf /tmp/src /tmp/classpath.txt /tmp/sources.txt

# Create WAR file
RUN cd ${CATALINA_HOME}/webapps && \
    jar -cf ${APP_NAME}.war -C ${APP_NAME} . && \
    rm -rf ${APP_NAME}

# Expose port 8080
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]