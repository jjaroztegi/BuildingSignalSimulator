FROM tomcat:9.0.104-jdk8-corretto

# Set environment variables
ENV CATALINA_HOME=/usr/local/tomcat
ENV JAVA_HOME=/usr/lib/jvm/java-1.8.0-amazon-corretto
ENV APP_NAME=BuildingSignalSimulator
ENV PACKAGE_NAME=com/signalapp

# Create application directory
RUN mkdir -p ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/classes
RUN mkdir -p ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/lib
RUN mkdir -p ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/database
RUN mkdir -p /tmp/src/${PACKAGE_NAME}

# Copy the Derby database
COPY database/DistribucionDeSenal/ ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/database/DistribucionDeSenal/

# Copy only the Derby JAR
COPY lib/derby.jar ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/lib/

# Copy source files for compilation
COPY src/${PACKAGE_NAME}/ /tmp/src/${PACKAGE_NAME}/

# Copy the web application files
COPY webapp/ ${CATALINA_HOME}/webapps/${APP_NAME}/

# Remove input.css
RUN rm -f ${CATALINA_HOME}/webapps/${APP_NAME}/css/input.css

# Create classpath for compilation
RUN echo -n ".:${CATALINA_HOME}/lib/servlet-api.jar" > /tmp/classpath.txt && \
    find ${CATALINA_HOME}/webapps/${APP_NAME}/WEB-INF/lib -name "*.jar" -exec printf ":%s" {} \; >> /tmp/classpath.txt

# List all Java files to compile, excluding tests
RUN find /tmp/src/${PACKAGE_NAME} -name "*.java" ! -path "*/tests/*" > /tmp/sources.txt

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