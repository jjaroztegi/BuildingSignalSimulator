# Simulador de Distribución de Señal en Edificios

## Descripción del Proyecto

Este proyecto desarrolla una aplicación web para calcular y optimizar la distribución de señal en un edificio, garantizando que cada piso reciba niveles de señal dentro de los márgenes de calidad establecidos. La solución incluye un backend en Java para la lógica de cálculo, una base de datos relacional para gestionar componentes y configuraciones, y un frontend moderno con HTML, Vanilla JS y Tailwind CSS para proporcionar una experiencia interactiva al usuario.

## Características Principales

### Cálculo de Nivel de Señal

-   **Cálculo por Piso:** Determinación del nivel de señal para cada piso basado en una configuración de red específica.
-   **Componentes Integrados:** Considera cables coaxiales, derivadores, distribuidores y tomas, utilizando propiedades técnicas como atenuación y desacoplo.
-   **Validación de Calidad:** Compara los niveles de señal calculados con los márgenes definidos en la tabla _MargenesCalidad_ (nivel_minimo y nivel_maximo).

### Optimización de Configuración de Red (TODO)

-   **Algoritmo de Optimización:** Identifica la configuración más económica que cumpla los requisitos de calidad, basándose en el costo de cada componente y el costo total almacenado en _Configuraciones.costo_total_.
-   **Recomendación de Componentes:** Sugiere componentes específicos para cada piso a partir de las tablas _Componentes_ y sus tablas asociadas.

### Simulación Interactiva

-   **Selección de Componentes:** Permite agregar y configurar los componentes necesarios para cada piso.
-   **Cálculo de Señal:** Procesa y valida los niveles de señal para la configuración seleccionada.
-   **Visualización de Resultados:** Muestra los niveles de señal por piso en tablas y gráficos, con codificación por colores (verde para niveles aceptables y rojo para niveles fuera de rango).

### Visualización Gráfica

-   **Representación de Datos:** Muestra los niveles de señal por piso en forma de tablas y gráficos.
-   **Codificación por Colores:** Emplea colores (verde para niveles aceptables y rojo para niveles fuera de rango).
-   **Modo Oscuro:** Incluye soporte para modo oscuro.

## Arquitectura Técnica

### Backend en Java

#### Modelos de Datos

-   **Componente.java:** Clase base para todos los componentes de red.
-   **Coaxial.java:** Representa cables coaxiales con propiedades como atenuación a frecuencias específicas (470 MHz y 694 MHz).
-   **Derivador.java:** Modela derivadores con atenuación de paso y derivación, directividad, desacoplo y pérdidas de retorno.
-   **Distribuidor.java:** Representa distribuidores con número de salidas, atenuación de distribución, desacoplo y pérdidas de retorno.
-   **Toma.java:** Representa tomas con atenuación y desacoplo.
-   **TipoComponente.java:** Define los tipos de componentes disponibles en el sistema.
-   **Configuracion.java:** Almacena la configuración general del edificio.
-   **MargenCalidad.java:** Define los márgenes de calidad aceptables.

#### Capa de Acceso a Datos (DAO)

-   **BaseDAO.java:** Clase base con funcionalidad común para todos los DAOs.
-   **AccessConnection.java:** Gestiona la conexión a la base de datos MS Access.
-   **DerbyConnection.java:** Gestiona la conexión a la base de datos Derby.
-   **ComponenteDAO.java:** Acceso a datos para la tabla Componentes.
-   **TiposComponenteDAO.java:** Acceso a datos para la tabla TiposComponente.
-   **CoaxialDAO.java:** Acceso a datos para la tabla Coaxiales.
-   **DerivadorDAO.java:** Acceso a datos para la tabla Derivadores.
-   **DistribuidorDAO.java:** Acceso a datos para la tabla Distribuidores.
-   **TomaDAO.java:** Acceso a datos para la tabla Tomas.
-   **ConfiguracionDAO.java:** Acceso a datos para la tabla Configuraciones.
-   **MargenCalidadDAO.java:** Acceso a datos para la tabla MargenesCalidad.

#### Servlets

-   **ConfigurationServlet.java:** Gestiona la creación y modificación de configuraciones.
-   **ComponentServlet.java:** Maneja operaciones CRUD para componentes.
-   **SignalTypeServlet.java:** Proporciona información sobre los tipos de señal disponibles.
-   **SignalCalculationServlet.java:** Gestiona la simulación y validación de los niveles de señal.

### Frontend

#### Estructura

-   **index.html:** Página principal con cuatro pestañas:
    -   Configuración: Gestión de configuraciones de edificios
    -   Componentes: Administración de componentes de red
    -   Simulación: Cálculo y simulación de señales
    -   Resultados: Visualización de resultados

#### JavaScript (Modular)

-   **script.js:** Archivo principal que inicializa la aplicación y coordina los módulos.
-   **Módulos:**
    -   **servlet.js:** Gestiona las llamadas a la API y la comunicación con el backend.
    -   **ui.js:** Maneja la actualización de la interfaz de usuario.
    -   **forms.js:** Gestiona el envío y validación de formularios.
    -   **tabs.js:** Controla la navegación entre pestañas.
    -   **theme.js:** Implementa el cambio entre modo claro y oscuro.
    -   **utils.js:** Proporciona funciones de utilidad para toda la aplicación.

#### Estilos

-   **Tailwind CSS:** Framework CSS para diseño responsive y moderno.
-   **Modo Oscuro:** Soporte integrado para tema oscuro.
-   **Componentes Reutilizables:** Elementos UI consistentes y accesibles.

### Base de Datos

#### Estructura

La base de datos está organizada en tres bloques principales:

-   **Tablas Principales:**

    -   **TiposComponente:** Registra los tipos de componentes (Cable Coaxial, Base de Toma, Derivador, Distribuidor)
    -   **Componentes:** Almacena información general de componentes (modelo, costo)

-   **Tablas de Componentes Específicos:**

    -   **Coaxiales:** Propiedades específicas de cables coaxiales (atenuación a 470 MHz y 694 MHz)
    -   **Derivadores:** Características técnicas de derivadores (atenuación de derivación, atenuación de paso, directividad, desacoplo, pérdidas de retorno)
    -   **Distribuidores:** Datos de splitters (número de salidas, atenuación de distribución, desacoplo, pérdidas de retorno)
    -   **Tomas:** Características de tomas (atenuación, desacoplo)

-   **Tablas de Configuración:**
    -   **Configuraciones:** Configuraciones generales (nombre, nivel de cabecera, número de pisos, costo total)
    -   **MargenesCalidad:** Márgenes de calidad aceptables (tipo de señal, nivel mínimo, nivel máximo)

## Flujo de Trabajo

1. **Configuración Inicial:**

    - Usuario ingresa nivel_cabecera y num_pisos
    - Se crea registro en Configuraciones

2. **Gestión de Componentes:**

    - Usuario agrega/modifica componentes
    - Se validan propiedades técnicas
    - Se actualizan costos y características

3. **Cálculo y Simulación:**

    - Usuario selecciona y agrega los componentes deseados para cada piso
    - Servlet calcula nivel_senal por piso
    - Se validan contra MargenesCalidad
    - Frontend muestra resultados

4. **Optimización (TODO):**

    - Algoritmo de optimización pendiente de implementar para identificar la configuración más económica que cumpla los requisitos de calidad
    - Se deberá basar en el costo de cada componente y el costo total almacenado en _Configuraciones.costo_total_
    - Pendiente implementar la sugerencia de componentes específicos para cada piso

5. **Análisis de Resultados:**
    - Visualización de niveles por piso
    - Indicadores de calidad
