# Simulador de Distribución de Señal en Edificios

## Descripción del Proyecto

Este proyecto desarrolla una aplicación web para calcular y optimizar la distribución de señal en un edificio, garantizando que cada piso reciba niveles de señal dentro de los márgenes de calidad establecidos. La solución incluye un backend en Java para la lógica de cálculo, una base de datos relacional para gestionar componentes y configuraciones, y un frontend moderno con HTML, Vanilla JS y Tailwind CSS para proporcionar una experiencia interactiva al usuario.

## Características Principales

### Cálculo de Nivel de Señal

-   **Cálculo por Piso:** Determinación del nivel de señal para cada piso basado en una configuración de red específica.
-   **Componentes Integrados:** Considera cables, derivadores, distribuidores, amplificadores y tomas, utilizando propiedades técnicas como atenuación y ganancia.
-   **Validación de Calidad:** Compara los niveles de señal calculados con los márgenes definidos en la tabla _MargenesCalidad_ (nivel_minimo y nivel_maximo).

### Optimización de Configuración de Red

-   **Algoritmo de Optimización:** Identifica la configuración más económica que cumpla los requisitos de calidad, basándose en el costo de cada componente y el costo total almacenado en _Configuraciones.costo_total_.
-   **Recomendación de Componentes:** Sugiere componentes específicos para cada piso a partir de las tablas _Componentes_ y sus tablas asociadas.

### Simulación Interactiva

-   **Ajuste Dinámico de Parámetros:** Permite modificar valores como la longitud del cable y atenuaciones específicas en tiempo real.
-   **Actualización en Tiempo Real:** Recalcula el nivel de señal conforme se realizan cambios.
-   **Indicadores Visuales:** Utiliza colores para destacar pisos con niveles fuera de los márgenes aceptables.
-   **Modo Oscuro:** Incluye soporte para modo oscuro para mejor visibilidad en condiciones de poca luz.

### Visualización Gráfica

-   **Representación de Datos:** Muestra los niveles de señal por piso en forma de tablas y gráficos.
-   **Codificación por Colores:** Emplea colores (verde para niveles aceptables y rojo para niveles fuera de rango).
-   **Interfaz Interactiva:** Permite explorar y ajustar configuraciones visualmente.

## Arquitectura Técnica

### Backend en Java

#### Modelos de Datos

-   **Componente.java:** Clase base para todos los componentes de red.
-   **Cable.java:** Representa cables con propiedades como longitud máxima y atenuación.
-   **Derivador.java:** Modela derivadores con atenuación de inserción y derivación.
-   **Distribuidor.java:** Representa distribuidores con número de salidas y atenuación.
-   **AmplificadorRuidoBase.java:** Modela amplificadores con ganancia y figura de ruido.
-   **Toma.java:** Representa tomas con atenuación y desacoplo.
-   **Configuracion.java:** Almacena la configuración general del edificio.
-   **DetalleConfiguracion.java:** Detalla la configuración por piso.
-   **MargenCalidad.java:** Define los márgenes de calidad aceptables.

#### Servlets

-   **ConfigurationServlet.java:** Gestiona la creación y modificación de configuraciones.
-   **ComponentServlet.java:** Maneja operaciones CRUD para componentes.
-   **QualityValidationServlet.java:** Valida los niveles de señal contra los márgenes de calidad.
-   **OptimizationServlet.java:** Implementa el algoritmo de optimización de costos.

### Frontend

#### Estructura

-   **index.html:** Página principal con tres pestañas:
    -   Configuración: Gestión de configuraciones de edificios
    -   Componentes: Administración de componentes de red
    -   Optimización/Simulación: Cálculo y optimización de señales

#### JavaScript (script.js)

-   **Gestión de Estado:** Manejo del estado de la aplicación y sincronización con el backend.
-   **Validación de Formularios:** Verificación de datos de entrada en el cliente.
-   **Actualización en Tiempo Real:** Cálculos y actualizaciones dinámicas de la interfaz.
-   **Visualización de Datos:** Generación de gráficos y tablas interactivas.

#### Estilos

-   **Tailwind CSS:** Framework CSS para diseño responsive y moderno.
-   **Modo Oscuro:** Soporte integrado para tema oscuro.
-   **Componentes Reutilizables:** Elementos UI consistentes y accesibles.

### Base de Datos

#### Estructura

La base de datos está organizada en tres bloques principales:

-   **Tablas Principales:**

    -   **TiposComponente:** Registra los tipos de componentes
    -   **Componentes:** Almacena información general de componentes
    -   **Frecuencias:** Define frecuencias estándar para mediciones

-   **Tablas de Componentes Específicos:**

    -   **Cables:** Propiedades específicas de cables
    -   **AtenuacionesCable:** Atenuación por 100 metros por frecuencia
    -   **Derivadores:** Características técnicas de derivadores
    -   **Distribuidores:** Datos de splitters
    -   **AmplificadoresRuidoBase:** Propiedades de amplificadores
    -   **Tomas:** Características de tomas

-   **Tablas de Configuración:**
    -   **Configuraciones:** Configuraciones generales
    -   **DetalleConfiguracion:** Configuración por piso
    -   **MargenesCalidad:** Márgenes de calidad aceptables

## Flujo de Trabajo

1. **Configuración Inicial:**

    - Usuario ingresa nivel_cabecera y num_pisos
    - Se crea registro en Configuraciones
    - Se inicializan pisos en DetalleConfiguracion

2. **Gestión de Componentes:**

    - Usuario agrega/modifica componentes
    - Se validan propiedades técnicas
    - Se actualizan costos y características

3. **Cálculo y Simulación:**

    - Servlet calcula nivel_senal por piso
    - Se validan contra MargenesCalidad
    - Frontend muestra resultados en tiempo real

4. **Optimización:**

    - Usuario solicita optimización
    - Algoritmo evalúa combinaciones
    - Se sugiere configuración óptima
    - Se actualiza interfaz con resultados

5. **Análisis de Resultados:**
    - Visualización de niveles por piso
    - Indicadores de calidad
    - Opciones para ajustes adicionales
