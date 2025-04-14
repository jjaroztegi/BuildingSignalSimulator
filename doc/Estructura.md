# Simulador de Distribución de Señal en Edificios

## Descripción del Proyecto

Este proyecto desarrolla una aplicación para calcular y optimizar la distribución de señal en un edificio, garantizando que cada piso reciba niveles de señal dentro de los márgenes de calidad establecidos. La solución incluye un backend en Java para la lógica de cálculo, una base de datos relacional para gestionar componentes y configuraciones, y un frontend en HTML y Vanilla JS para proporcionar una experiencia interactiva al usuario.

## Características Principales

### Cálculo de Nivel de Señal

-   **Cálculo por Piso:** Determinación del nivel de señal para cada piso basado en una configuración de red específica.
-   **Componentes Integrados:** Considera cables, derivadores, distribuidores, amplificadores y tomas, utilizando propiedades técnicas como atenuación y ganancia.
-   **Validación de Calidad:** Compara los niveles de señal calculados con los márgenes definidos en la tabla _MargenesCalidad_ (nivel_minimo y nivel_maximo).

### Optimización de Configuración de Red

-   **Algoritmo de Optimización:** Identifica la configuración más económica que cumpla los requisitos de calidad, basándose en el costo de cada componente y el costo total almacenado en _Configuraciones.costo_total_.
-   **Recomendación de Componentes:** Sugiere componentes específicos para cada piso a partir de las tablas _Componentes_ y sus tablas asociadas (como _Cables_, _Derivadores_, etc.).

### Simulación Interactiva

-   **Ajuste Dinámico de Parámetros:** Permite modificar valores como la longitud del cable (_longitud_cable_ en _DetalleConfiguracion_) y atenuaciones específicas (por ejemplo, _atenuacion_100m_ en _AtenuacionesCable_).
-   **Actualización en Tiempo Real:** Recalcula el nivel de señal (_nivel_senal_ en _DetalleConfiguracion_) conforme se realizan cambios.
-   **Indicadores Visuales:** Utiliza colores para destacar pisos con niveles fuera de los márgenes aceptables.

### Visualización Gráfica

-   **Representación de Datos:** Muestra los niveles de señal por piso en forma de tablas y gráficos.
-   **Codificación por Colores:** Emplea colores (por ejemplo, verde para niveles aceptables y rojo para niveles fuera de rango) basados en los valores de _MargenesCalidad_.
-   **Interfaz Interactiva:** Permite explorar y ajustar configuraciones visualmente.

## Arquitectura Técnica

### Backend en Java

#### Lógica de Cálculo

-   **Algoritmos de Atenuación:** Calcula la atenuación total considerando:
    -   _atenuacion_100m_ (de _AtenuacionesCable_) ajustada según la _longitud_cable_.
    -   _atenuacion_insercion_ y _atenuacion_derivacion_ (de _Derivadores_).
    -   _atenuacion_distribucion_ (de _Distribuidores_).
    -   _ganancia_ y _atenuacion_ (de _AmplificadoresRuidoBase_).
    -   _atenuacion_ (de _Tomas_).
-   **Optimización de Costos:** Evalúa combinaciones de componentes minimizando el costo total (_Configuraciones.costo_total_) sin violar los márgenes de calidad.
-   **Validación:** Verifica que el nivel de señal calculado se encuentre entre los valores establecidos en _MargenesCalidad_.

#### Servlets

-   **CalculoServlet:**
    -   Procesa las solicitudes de cálculo, simulación y optimización.
    -   Consulta la base de datos para obtener información de componentes (_Componentes_, _Cables_, _Derivadores_, etc.) y configuraciones (_Configuraciones_, _DetalleConfiguracion_).
    -   Devuelve resultados en formato JSON, incluyendo niveles de señal (_nivel_senal_), costos y recomendaciones de componentes.

### Base de Datos

#### Estructura

La base de datos está diseñada para almacenar y gestionar componentes, sus propiedades técnicas y las configuraciones de red. La estructura actualizada se organiza en tres bloques principales:

-   **Tablas Principales:**

    -   **TiposComponente:** Registra los tipos de componentes (por ejemplo, cable, derivador).
    -   **Componentes:** Almacena la información general (modelo, costo, auditoría).
    -   **Frecuencias:** Define las frecuencias estándar utilizadas para medir atenuaciones.

-   **Tablas de Componentes Específicos:**

    -   **Cables:** Detalla propiedades específicas, como _longitud_maxima_.
    -   **AtenuacionesCable:** Registra la atenuación por 100 metros para cada frecuencia (_atenuacion_100m_).
    -   **Derivadores:** Contiene características técnicas, incluyendo _atenuacion_insercion_, _num_salidas_, etc.
    -   **Distribuidores:** Almacena datos de splitters (número de salidas y _atenuacion_distribucion_).
    -   **AmplificadoresRuidoBase:** Registra propiedades de amplificadores, tales como _ganancia_ y _figura_ruido_.
    -   **Tomas:** Guarda las características de las tomas (atenuacion y desacoplo).

-   **Tablas de Configuración:**
    -   **Configuraciones:** Registra las configuraciones generales, con campos como _nivel_cabecera_, _num_pisos_ y _costo_total_.
    -   **DetalleConfiguracion:** Detalla la configuración específica por piso, incluyendo _piso_, _id_cables_, _nivel_senal_, entre otros.
    -   **MargenesCalidad:** Define los márgenes de calidad aceptables, especificando _nivel_minimo_ y _nivel_maximo_.

#### Integración

-   **Conexión:** Se utiliza JDBC para conectar los servlets con la base de datos.
-   **Operaciones CRUD:** Se implementan consultas SQL optimizadas para recuperar y actualizar datos de componentes y configuraciones, tales como:
    -   Obtener atenuaciones por frecuencia para un cable.
    -   Calcular el nivel de señal en cada piso combinando datos de _DetalleConfiguracion_ y las tablas de componentes.

### Frontend con HTML y Vanilla JS

#### Interfaz de Usuario

-   **Formulario Inicial:** Permite ingresar el _nivel_cabecera_ y el _num_pisos_; estos valores se registran en la tabla _Configuraciones_.
-   **Secciones Diferenciadas:** Una sección para la simulación (donde se ajustan parámetros como la _longitud_cable_ y se seleccionan componentes) y otra para la optimización.
-   **Tabla Dinámica:** Muestra, por cada piso, el _nivel_senal_ y un indicador de estado (si el nivel está dentro o fuera de los márgenes).

#### Interactividad

-   **Validación en Cliente:** Se valida que los campos numéricos (por ejemplo, que _longitud_cable_ no exceda el valor de _longitud_maxima_) sean correctos.
-   **Llamadas AJAX:** El frontend realiza solicitudes asíncronas al _CalculoServlet_ para actualizar el _nivel_senal_ en tiempo real.
-   **Botón de Optimización:** Permite al usuario solicitar la configuración más económica, recibiendo recomendaciones y actualizaciones en la visualización.

#### Visualización

-   **Gráficos:** Mostrar el nivel de señal por piso.
-   **Indicadores de Color:** Se aplican colores:
    -   **Verde:** Cuando el _nivel_senal_ se encuentra entre _nivel_minimo_ y _nivel_maximo_.
    -   **Rojo:** Cuando el _nivel_senal_ está fuera de los rangos aceptables.
-   **Diseño Responsive:** CSS se utiliza para lograr un diseño limpio y adaptativo.

## Flujo de Trabajo

1. **Configuración Inicial:**

    - El usuario ingresa el _nivel_cabecera_ y _num_pisos_ mediante el formulario.
    - Se crea un registro en _Configuraciones_ y se inicializan los pisos en _DetalleConfiguracion_.
    - Los datos se envían al _CalculoServlet_ para realizar el cálculo inicial.

2. **Cálculo y Simulación:**

    - El servlet consulta las tablas de componentes (_Cables_, _Derivadores_, etc.) y calcula el _nivel_senal_ para cada piso.
    - Los resultados se almacenan en _DetalleConfiguracion_ y se devuelven al frontend.
    - El usuario puede ajustar parámetros (por ejemplo, modificar la _longitud_cable_) y el servlet recalcula en tiempo real.

3. **Optimización:**

    - Al solicitar optimización, el servlet evalúa diversas combinaciones de componentes, minimizando el _costo_total_ y respetando los márgenes establecidos en _MargenesCalidad_.
    - Se actualiza _DetalleConfiguracion_ con los componentes recomendados y se muestra el resultado en el frontend.

4. **Análisis de Resultados:**
    - El frontend muestra los niveles de señal por piso en forma de tablas y gráficos.
    - Los indicadores visuales resaltan los pisos que no cumplen con los rangos de calidad.
    - El usuario puede guardar la configuración o realizar ajustes adicionales para optimizar la distribución de señal.
