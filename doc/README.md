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
-   **Frontend**: HTML, Vanilla JavaScript, Tailwind CSS
-   **Database**: MS Access/Derby via JDBC
-   **Build**: Manual compilation via script

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
│   │   └── script.js       # Main application logic
│   ├── WEB-INF/           # Web configuration
│   └── index.html         # Main application page
├── database/              # Database files and SQL scripts
│   └── signal_distribution.accdb    # MS Access database
├── doc/                   # Documentation
├── lib/                   # Required JAR dependencies
└── build.bat             # Build and deployment script
```

## Prerequisites

-   Java JDK 1.8.0_131
-   Apache Tomcat 9.0.89
-   MS Access database
-   Web browser with JavaScript enabled

## Setup and Deployment

1. Clone the repository
2. Ensure Java 1.8.0_131 is installed and JAVA_HOME is set
3. Install Apache Tomcat 9.0.89
4. Run the build script:

    ```bash
    build.bat
    ```

    This script handles:

    - Java compilation
    - Database connection testing
    - Deployment to Tomcat

5. Access the application at: http://localhost:8080/BuildingSignalSimulator

## Database Configuration

The application supports both MS Access and Derby databases:

-   MS Access database file: `database/signal_distribution.accdb`
-   Derby database: `database/signal_distribution/`
-   SQL scripts used for setup: `database/sentencias_sql/`

## Features in Detail

### Configuration Management

-   Create and manage building configurations
-   Set headend level and number of floors
-   View and modify existing configurations

### Component Management

-   Add and manage network components:
    -   Cables
    -   Splitters (Derivadores)
    -   Distributors
    -   Amplifiers
    -   Outlets (Tomas)
-   Set component properties and costs

### Signal Simulation

-   Real-time signal level calculation
-   Quality margin validation
-   Visual feedback with color-coded indicators
-   Interactive parameter adjustment

### Optimization

-   Cost-effective component selection
-   Quality margin compliance
-   Automatic configuration suggestions

## Documentation

Detailed documentation available in `doc/` directory:

-   [Database Schema](doc/Database.md)
-   [Structure Details](doc/Estructura.md)

## License

This project is under the MIT License. See [LICENSE](LICENSE) file for details.
