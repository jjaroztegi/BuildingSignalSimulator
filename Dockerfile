FROM tomcat:9.0.104-jdk8-corretto

# Install required dependencies for UCanAccess
RUN yum update -y && yum install -y \
    unzip \
    wget \
    && yum clean all

# Set environment variables
ENV CATALINA_HOME=/usr/local/tomcat
ENV JAVA_HOME=/usr/lib/jvm/java-1.8.0-amazon-corretto
ENV APP_NAME=BuildingSignalSimulator

# Create application directory
RUN mkdir -p ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/classes/com/signalapp
RUN mkdir -p ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/lib
RUN mkdir -p ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/database

# Copy the MS Access database
COPY database/DistribucionDeSenal.accdb ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/database/

# Copy the JAR dependencies
COPY lib/*.jar ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/lib/

# Copy the web application files
COPY webapp/* ${CATALINA_HOME}/webapps/${APP_NAME}/
COPY webapp/WEB-INF/* ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/
COPY webapp/js ${CATALINA_HOME}/webapps/${APP_NAME}/js/
COPY webapp/css ${CATALINA_HOME}/webapps/${APP_NAME}/css/

# Copy the compiled Java classes
COPY build/classes/com/signalapp ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/classes/com/signalapp/

# Create a WAR file for proper deployment
RUN cd ${CATALINA_HOME}/webapps && \
    jar -cf ${APP_NAME}.war -C ${APP_NAME} . && \
    rm -rf ${APP_NAME}

# Expose port 8080
EXPOSE 8080

# Start Tomcat
CMD ["catalina.sh", "run"]