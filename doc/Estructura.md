# Simulador de Distribución de Señal en Edificios

## Descripción del Proyecto

Este proyecto tiene como objetivo desarrollar una aplicación que calcule y optimice la distribución de señal en un edificio, asegurando que cada piso reciba una señal dentro de los márgenes de calidad aceptables. La solución se implementa con un backend en Java que maneja la lógica de cálculo, una base de datos para almacenar componentes y configuraciones, y un frontend en HTML y Vanilla JS para ofrecer una interfaz interactiva al usuario.

## Características Principales

### Cálculo de Nivel de Señal
- Determinación del nivel de señal en cada piso basado en una configuración de red dada.
- Consideración de elementos como cables, derivadores y distribuidores en los cálculos.
- Validación de niveles contra márgenes de calidad aceptables.

### Optimización de Configuración de Red
- Algoritmo para determinar la configuración más económica que mantenga la calidad de señal.
- Recomendación de componentes específicos para cada piso.
- Estimación del costo total de la configuración optimizada.

### Simulación Interactiva
- Posibilidad de modificar parámetros como longitud de cables y atenuación de componentes.
- Actualización en tiempo real de los niveles de señal según las modificaciones realizadas.
- Indicadores visuales para identificar rápidamente áreas con problemas de señal.

### Visualización Gráfica
- Representación visual de los niveles de señal mediante tablas y gráficos.
- Indicadores de color para mostrar si los niveles están dentro de los márgenes aceptables.
- Herramientas interactivas para facilitar el análisis y toma de decisiones.

## Arquitectura Técnica

### Backend en Java

#### Lógica de Cálculo
- Implementación de algoritmos para determinar la atenuación de la señal a través de diferentes componentes.
- Lógica de optimización para minimizar costos manteniendo niveles de señal adecuados.
- Validación de configuraciones contra los márgenes de calidad establecidos.

#### Servlets
- **CalculoServlet**: Servlet principal que gestiona solicitudes de cálculo, optimización y simulación.
- Comunicación con la base de datos para obtener información de componentes y almacenar configuraciones.
- Devolución de resultados en formato JSON para su procesamiento por el frontend.

### Base de Datos

#### Estructura
La base de datos se organiza en tablas interrelacionadas que almacenan información sobre componentes y configuraciones:

1. **Tabla Componentes**  
   Almacena información general sobre los componentes utilizados en la red.
   * Columnas:
      * `id_componente` (INT, PRIMARY KEY, AUTO_INCREMENT): Identificador único.
      * `tipo` (VARCHAR(50)): Tipo de componente ("cable", "derivador", "distribuidor").
      * `modelo` (VARCHAR(100)): Nombre o modelo del componente (e.g., "Cable RG6").
      * `costo` (DECIMAL(10,2)): Costo unitario.

2. **Tabla Cables**  
   Registra las propiedades técnicas específicas de los cables.
   * Columnas:
      * `id_cable` (INT, PRIMARY KEY, AUTO_INCREMENT): Identificador único.
      * `id_componente` (INT, FOREIGN KEY a Componentes.id_componente): Vinculación con Componentes.
      * `longitud_maxima` (DECIMAL(10,2)): Longitud máxima (metros).
      * `atenuacion_por_metro` (DECIMAL(5,2)): Atenuación en dB por metro.

3. **Tabla Derivadores**  
   Contiene las características de los derivadores.
   * Columnas:
      * `id_derivador` (INT, PRIMARY KEY, AUTO_INCREMENT): Identificador único.
      * `id_componente` (INT, FOREIGN KEY a Componentes.id_componente): Vinculación con Componentes.
      * `atenuacion_insercion` (DECIMAL(5,2)): Atenuación en dB al pasar por el derivador.
      * `atenuacion_derivacion` (DECIMAL(5,2)): Atenuación en dB en las salidas derivadas.
      * `num_salidas` (INT): Número de salidas derivadas.

4. **Tabla Distribuidores**  
   Almacena datos de los distribuidores (splitters).
   * Columnas:
      * `id_distribuidor` (INT, PRIMARY KEY, AUTO_INCREMENT): Identificador único.
      * `id_componente` (INT, FOREIGN KEY a Componentes.id_componente): Vinculación con Componentes.
      * `num_salidas` (INT): Número de salidas.
      * `atenuacion_por_salida` (DECIMAL(5,2)): Atenuación en dB por cada salida.

5. **Tabla Configuraciones**  
   Guarda las configuraciones generales creadas por los usuarios.
   * Columnas:
      * `id_configuracion` (INT, PRIMARY KEY, AUTO_INCREMENT): Identificador único.
      * `nombre` (VARCHAR(100)): Nombre descriptivo (e.g., "Edificio A").
      * `nivel_cabecera` (DECIMAL(5,2)): Nivel de señal inicial (dB).
      * `num_pisos` (INT): Número de pisos.
      * `costo_total` (DECIMAL(10,2)): Costo total calculado.

6. **Tabla DetalleConfiguracion**  
   Detalla la configuración específica de cada piso.
   * Columnas:
      * `id_detalle` (INT, PRIMARY KEY, AUTO_INCREMENT): Identificador único.
      * `id_configuracion` (INT, FOREIGN KEY a Configuraciones.id_configuracion): Vinculación con Configuraciones.
      * `piso` (INT): Número del piso.
      * `id_cable` (INT, FOREIGN KEY a Cables.id_cable): Cable usado.
      * `longitud_cable` (DECIMAL(10,2)): Longitud del cable (metros).
      * `id_derivador` (INT, FOREIGN KEY a Derivadores.id_derivador, NULLABLE): Derivador usado (si aplica).
      * `id_distribuidor` (INT, FOREIGN KEY a Distribuidores.id_distribuidor, NULLABLE): Distribuidor usado (si aplica).
      * `nivel_senal` (DECIMAL(5,2)): Nivel de señal calculado (dB).

7. **Tabla MargenesCalidad**  
   Define los márgenes de calidad aceptables para la señal.
   * Columnas:
      * `id_margen` (INT, PRIMARY KEY, AUTO_INCREMENT): Identificador único.
      * `tipo_senal` (VARCHAR(50)): Tipo de señal (e.g., "TV").
      * `nivel_minimo` (DECIMAL(5,2)): Nivel mínimo aceptable (dB).
      * `nivel_maximo` (DECIMAL(5,2)): Nivel máximo aceptable (dB).

**Relaciones entre Tablas**
* Componentes se vincula a Cables, Derivadores y Distribuidores mediante id_componente.
* Configuraciones y DetalleConfiguracion conectan las simulaciones generales con los detalles por piso.
* MargenesCalidad valida los niveles de señal calculados.

#### Integración
- Uso de JDBC para la comunicación entre los servlets y la base de datos.
- Operaciones CRUD para gestionar componentes y configuraciones.

### Frontend con Vanilla JS y HTML

#### Interfaz de Usuario
- Página principal con campos para datos de entrada (nivel de señal en cabecera, número de pisos).
- Secciones diferenciadas para cálculo/simulación y optimización.
- Listado de funciones de la aplicación y sus autores.

#### Interactividad
- Validación de campos de entrada mediante JavaScript.
- Llamadas AJAX para comunicarse con los servlets sin recargar la página.
- Actualización dinámica de la interfaz según los resultados recibidos.

#### Visualización
- Uso de librerías como Chart.js o D3.js para representación gráfica.
- Estilos CSS para diseño visual atractivo y funcional.
- Indicadores de color para facilitar la interpretación de resultados.

## Flujo de Trabajo

### 1. Configuración Inicial
- El usuario ingresa el nivel de señal en la cabecera y el número de pisos.
- Se establecen los parámetros iniciales para la simulación.
- Los datos se envían al servlet para su procesamiento.

### 2. Cálculo y Simulación
- El servlet calcula los niveles de señal en cada piso según la configuración actual.
- Se devuelven los resultados y se muestran en forma tabular y gráfica.
- El usuario puede modificar parámetros (como longitud de cables) y ver el impacto en tiempo real.

### 3. Optimización
- El usuario solicita la optimización de la configuración.
- El algoritmo evalúa diferentes combinaciones de componentes para encontrar la más económica.
- Se presenta una lista de componentes recomendados por piso y el costo total.

### 4. Análisis de Resultados
- El usuario analiza los niveles de señal visualizados en la interfaz.
- Se identifican posibles problemas (niveles fuera de los márgenes aceptables).
- Se pueden realizar ajustes adicionales para mejorar la configuración.
