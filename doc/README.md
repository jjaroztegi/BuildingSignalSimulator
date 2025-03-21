# Signal Distribution Simulator in Buildings

## Description

This project aims to simulate and optimize signal distribution across multiple floors of a building, ensuring that each floor receives a signal within acceptable quality margins. The main functionalities include:

*   **Signal Level Calculation:** Compute signal levels on each floor based on network configurations, including cables, splitters, and taps.
*   **Network Configuration Optimization:** Identify the most cost-effective configuration that maintains signal quality across all floors.
*   **Interactive Simulation:** Allow real-time adjustments to parameters like cable length and component attenuation, with instant signal level updates.
*   **Graphical Visualization:** Display signal levels through tables and charts, with color-coded indicators for quality assessment.

## Project Structure

The project is organized as follows:

*   `src/`: Contains the Java source code.
    *   `com/signalapp/`: Main application package.
        *   `servlets/`: Servlet files, such as `SignalServlet.java`.
        *   `models/`: Model classes, such as `SignalModel.java`.
        *   `dao/`: Data access classes, such as `SignalDAO.java`.
*   `webapp/`: Contains the web resources.
    *   `index.html`: Main page of the web interface.
    *   `css/`: Styles, such as `style.css`.
    *   `js/`: Scripts, such as `script.js`.
    *   `WEB-INF/`: Server configuration, such as `web.xml`.
*   `lib/`: External libraries, such as `servlet-api.jar` and `jdbc-driver.jar`.

## Prerequisites

To run this project, you need the following:

*   Java JDK 8 or higher.
*   Apache Tomcat 9 or higher as a web server.
*   A database (e.g., Access) to store component and configuration data.
*   JAR libraries located in the `lib/` folder.

## Configuration

Follow these steps to configure the project:

1.  Clone or download the project to your machine.
2.  Compile the code:
    *   Navigate to `src/` and use `javac` to compile the Java files, ensuring the libraries are included in the classpath.
3.  Deploy the application:
    *   Copy the `webapp/` folder to the `webapps/` folder of Tomcat.
    *   Ensure the compiled classes are in `WEB-INF/classes/`.

## Usage

1.  Start the Apache Tomcat server.
2.  Open a browser and access `http://localhost:8080/BuildingSignalSimulator`.
3.  Use the web interface to configure and run your signal distribution simulations.

## License

This project is under the MIT License. See [LICENSE](LICENSE) file for more details.
