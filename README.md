# Building Signal Simulator

## Overview

Building Signal Simulator is a sophisticated web-based application designed to model, analyze, and optimize signal distribution networks in multi-story buildings. The system provides a comprehensive solution for telecommunications engineers and network designers to ensure optimal signal quality across all floors while maintaining cost-effectiveness.

The application features an intuitive web interface with a powerful schematic editor that allows users to design and visualize network layouts. It supports various network components including coaxial cables, splitters, distributors, and outlets, each with detailed technical specifications. The system calculates signal levels at each floor, validates them against quality standards, and provides real-time feedback on network performance.

## Key Features

-   **Signal Level Calculation**: Computes signal levels floor-by-floor based on network components
-   **Real-time Simulation**: Interactive adjustment of parameters with instant signal level updates
-   **Cost Optimization**: Identifies most cost-effective component configuration while maintaining signal quality
-   **Quality Validation**: Ensures signal levels meet predefined margins at each floor
-   **Visual Feedback**: Clear visualization of signal levels with color-coded quality indicators
-   **Dark Mode Support**: Built-in dark mode for better visibility in low-light conditions
-   **Schematic Editor**: Interactive visual editor for designing network layouts
-   **Simulation History**: Save, load, and manage previous simulations
-   **Component Management**: Comprehensive management of network components (cables, splitters, distributors, outlets)

## Technical Stack

-   **Backend**: Java 1.8 (JDK 1.8.0_131)
-   **Server**: Apache Tomcat 9.0.89
-   **Frontend**: HTML, Vanilla JavaScript (ES6 modules), Tailwind CSS
-   **Database**: Apache Derby via JDBC
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
│   │       ├── servlet.js  # API communication
│   │       ├── ui.js       # UI management
│   │       ├── forms.js    # Form handling
│   │       ├── tabs.js     # Tab navigation
│   │       ├── theme.js    # Theme management
│   │       ├── utils.js    # Utility functions
│   │       └── schematic.js # Schematic editor
│   ├── WEB-INF/            # Web configuration
│   ├── index.html          # Main landing page
│   └── simulator.html      # Main application page
├── database/               # Database files and SQL scripts
│   └── DistribucionDeSenal/    # Derby database folder
├── doc/                    # Documentation
├── lib/                    # Required JAR dependencies
├── tools/                  # Jakarta migration tool
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
├── build.sh                # Build and deployment script for Mac/Linux
├── build_uni.bat           # Build and deployment script for Windows (university environment)
└── restart_tomcat.bat      # Tomcat restart script Windows (university environment)
```

## Prerequisites

### Manual Setup

#### Windows University Environment

-   Java JDK 1.8.0_131
-   Apache Tomcat 9.0.89
-   Web browser with JavaScript enabled

#### Linux/Mac Environment

-   Latest Java JDK (8 or higher)
-   Latest Apache Tomcat (9 or higher)
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

The application uses an Apache Derby database with the following key tables:

-   **Component Tables**:

    -   `TiposComponente`: Component types
    -   `Componentes`: General component information
    -   `Coaxiales`: Coaxial cable specifications
    -   `Derivadores`: Splitter specifications
    -   `Distribuidores`: Distributor specifications
    -   `Tomas`: Outlet specifications

-   **Configuration Tables**:
    -   `Configuraciones`: Building configurations
    -   `MargenesCalidad`: Signal quality margins
    -   `Simulaciones`: Simulation records
    -   `ResultadosSimulacion`: Simulation results
    -   `Esquematicos`: Schematic layouts

## Features in Detail

### Configuration Management

-   Create and manage building configurations
-   Set headend level and number of floors
-   View and modify existing configurations
-   Delete configurations (with validation for associated simulations)

### Component Management

-   Add and manage network components:
    -   Coaxial Cables (with frequency-specific attenuation)
    -   Splitters (with pass-through and tap attenuation)
    -   Distributors (with output count and distribution loss)
    -   Outlets (with attenuation and isolation)
-   Set component properties and costs
-   View detailed component specifications

### Signal Simulation

-   Interactive schematic editor for network design
-   Real-time signal level calculation
-   Quality margin validation
-   Visual feedback with color-coded indicators
-   Save and load simulation configurations
-   View simulation history

### Results Analysis

-   Detailed signal level reports per floor
-   Cost analysis and optimization
-   Quality compliance indicators
-   Schematic visualization
-   Export and import capabilities

## Documentation

Detailed documentation available in `doc/` directory:

-   [Database Schema](docs/Database.md)
-   [Structure Details](docs/Estructura.md)

## License

This project is under the MIT License. See [LICENSE](LICENSE) file for details.
