# Building Signal Simulator

## Overview

Building Signal Simulator is a web-based application that simulates and optimizes signal distribution across multiple floors in buildings. This Java-based system helps calculate signal levels, optimize network configurations, and ensure signal quality meets predefined standards while maintaining cost-effectiveness.

## Key Features

-   **Signal Level Calculation**: Computes signal levels floor-by-floor based on network components
-   **Real-time Simulation**: Interactive adjustment of parameters with instant signal level updates
-   **Cost Optimization**: Identifies most cost-effective component configuration while maintaining signal quality
-   **Quality Validation**: Ensures signal levels meet predefined margins at each floor
-   **Visual Feedback**: Clear visualization of signal levels with color-coded quality indicators
-   **Dark Mode Support**: Built-in dark mode for better visibility in low-light conditions

## Technical Stack

-   **Backend**: Java 1.8 (JDK 1.8.0_131)
-   **Server**: Apache Tomcat 9.0.89
-   **Frontend**: HTML, Vanilla JavaScript (ES6 modules), Tailwind CSS
-   **Database**: MS Access via JDBC
-   **Build**: Manual compilation via script or Docker containerization

## Project Structure

```
├── src/                    # Java source files
│   └── com/
│       └── signalapp/      # Main application code
│           ├── dao/        # Data Access Objects
│           ├── models/     # Data models
│           ├── servlets/   # Servlet controllers
│           └── tests/      # Unit tests
├── webapp/                 # Web application files
│   ├── js/                 # JavaScript files
│   │   ├── script.js       # Main application logic
│   │   └── modules/        # JavaScript modules
│   ├── WEB-INF/            # Web configuration
│   └── index.html          # Main application page
├── database/               # Database files and SQL scripts
│   └── DistribucionDeSenal.accdb    # MS Access database
├── doc/                    # Documentation
├── lib/                    # Required JAR dependencies
├── tools/                  # Jakarta migration tool
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── build.sh                # Build and deployment script for Mac/Linux
└── build_uni.bat           # Build and deployment script for Windows (university environment)
```

## Prerequisites

### Manual Setup

-   Java JDK 1.8.0_131
-   Apache Tomcat 9.0.89
-   MS Access database
-   Web browser with JavaScript enabled

### Docker Setup

-   Docker
-   Docker Compose
-   Web browser with JavaScript enabled

## Setup and Deployment

### Option 1: Manual Setup

#### Windows University Environment

1. Clone the repository
2. Run the build script:

    ```batch
    build_uni.bat
    ```

    This script handles:

    - Environment variables configuration
    - Java compilation
    - Deployment to Tomcat

3. Access the application at: http://localhost:8082/BuildingSignalSimulator

#### Linux/Mac Environment

1. Clone the repository
2. Ensure Java and Tomcat are installed and JAVA_HOME is set
3. Modify the build.sh script to set the correct TOMCAT_WEBAPPS path
4. Make the build script executable and run it:

    ```bash
    chmod +x build.sh
    ./build.sh
    ```

    This script handles:

    - Java compilation
    - Compiling with Java 8 compatibility and migrating to Jakarta EE
    - Deployment to Tomcat

5. Access the application at: http://localhost:8080/BuildingSignalSimulator

### Option 2: Docker Setup

1. Clone the repository
2. Navigate to the project directory
3. Build and start the container:

    ```bash
    docker compose up -d
    ```

4. Access the application at: http://localhost:1313/BuildingSignalSimulator

The Docker setup provides an isolated environment with all dependencies pre-configured.

## Database Configuration

The application supports MS Access database:

-   MS Access database file: `database/DistribucionDeSenal.accdb`
-   SQL scripts used for setup: `database/sentencias_sql/`

## Features in Detail

### Configuration Management

-   Create and manage building configurations
-   Set headend level and number of floors
-   View and modify existing configurations

### Component Management

-   Add and manage network components:
    -   Coaxial Cables
    -   Splitters (Derivadores)
    -   Distributors
    -   Outlets (Tomas)
-   Set component properties and costs

### Signal Simulation

-   Signal level calculation
-   Quality margin validation
-   Visual feedback with color-coded indicators

### Optimization (TODO)

-   Cost-effective component selection
-   Quality margin compliance
-   Automatic configuration suggestions

## Documentation

Detailed documentation available in `doc/` directory:

-   [Database Schema](doc/Database.md)
-   [Structure Details](doc/Estructura.md)

## License

This project is under the MIT License. See [LICENSE](LICENSE) file for details.
