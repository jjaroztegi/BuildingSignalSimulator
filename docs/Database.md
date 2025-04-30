# Base de Datos

## Estructura

### Tablas Principales

#### Tabla TiposComponente

Almacena los tipos de componentes disponibles en el sistema.

-   Campos:
    -   `id_tipos_componente` (INTEGER, Primary Key, AUTO_INCREMENT): Identificador único.
    -   `nombre` (VARCHAR(50)): Nombre del tipo ("Cable Coaxial", "Base de Toma", "Derivador", "Distribuidor").
    -   `descripcion` (VARCHAR(255)): Descripción detallada del tipo de componente.

#### Tabla Componentes

Almacena información general sobre los componentes utilizados en la red.

-   Campos:
    -   `id_componentes` (INTEGER, Primary Key, AUTO_INCREMENT): Identificador único.
    -   `id_tipos_componente` (INTEGER, Foreign Key a TiposComponente.id_tipos_componente): Tipo de componente.
    -   `modelo` (VARCHAR(100)): Nombre o modelo del componente (e.g., "CE-752", "BS-100").
    -   `costo` (DECIMAL(10,2)): Costo unitario.

### Tablas de Componentes Específicos

#### Tabla Coaxiales

Registra las propiedades técnicas específicas de los cables coaxiales.

-   Campos:
    -   `id_coaxiales` (INTEGER, Primary Key, AUTO_INCREMENT): Identificador único.
    -   `id_componentes` (INTEGER, Foreign Key a Componentes.id_componentes): Vinculación con Componentes.
    -   `atenuacion_470mhz` (DOUBLE): Atenuación en dB a 470 MHz.
    -   `atenuacion_694mhz` (DOUBLE): Atenuación en dB a 694 MHz.

#### Tabla Derivadores

Contiene las características de los derivadores.

-   Campos:
    -   `id_derivadores` (INTEGER, Primary Key, AUTO_INCREMENT): Identificador único.
    -   `id_componentes` (INTEGER, Foreign Key a Componentes.id_componentes): Vinculación con Componentes.
    -   `atenuacion_derivacion` (DOUBLE): Atenuación en dB en las salidas derivadas.
    -   `atenuacion_paso` (DOUBLE): Atenuación en dB al pasar por el derivador.
    -   `directividad` (DOUBLE): Directividad en dB.
    -   `desacoplo` (DOUBLE): Desacoplo en dB.
    -   `perdidas_retorno` (DOUBLE): Pérdidas de retorno en dB.

#### Tabla Distribuidores

Almacena datos de los distribuidores (splitters).

-   Campos:
    -   `id_distribuidores` (INTEGER, Primary Key, AUTO_INCREMENT): Identificador único.
    -   `id_componentes` (INTEGER, Foreign Key a Componentes.id_componentes): Vinculación con Componentes.
    -   `numero_salidas` (INTEGER): Número de salidas.
    -   `atenuacion_distribucion` (DOUBLE): Atenuación en dB por cada salida.
    -   `desacoplo` (DOUBLE): Desacoplo en dB.
    -   `perdidas_retorno` (DOUBLE): Pérdidas de retorno en dB.

#### Tabla Tomas

Registra las características técnicas de las tomas.

-   Campos:
    -   `id_tomas` (INTEGER, Primary Key, AUTO_INCREMENT): Identificador único.
    -   `id_componentes` (INTEGER, Foreign Key a Componentes.id_componentes): Vinculación con Componentes.
    -   `atenuacion` (DOUBLE): Atenuación en dB.
    -   `desacoplo` (DOUBLE): Desacoplo en dB.

### Tablas de Configuración y Simulación

#### Tabla Configuraciones

Guarda las configuraciones generales creadas por los usuarios.

-   Campos:
    -   `id_configuraciones` (INTEGER, Primary Key, AUTO_INCREMENT): Identificador único.
    -   `nombre` (VARCHAR(100)): Nombre descriptivo (e.g., "Edificio A").
    -   `nivel_cabecera` (DOUBLE): Nivel de señal inicial (dB).
    -   `num_pisos` (INTEGER): Número de pisos.
    -   `costo_total` (DECIMAL(10,2)): Costo total calculado.
    -   `fecha_creacion` (TIMESTAMP): Fecha de creación.
    -   `usuario_creacion` (VARCHAR(50)): Usuario que creó la configuración.
    -   `fecha_modificacion` (TIMESTAMP): Fecha de última modificación.
    -   `usuario_modificacion` (VARCHAR(50)): Usuario que realizó la última modificación.

#### Tabla MargenesCalidad

Define los márgenes de calidad aceptables para la señal.

-   Campos:
    -   `id_margenes_calidad` (INTEGER, Primary Key, AUTO_INCREMENT): Identificador único.
    -   `tipo_senal` (VARCHAR(50)): Tipo de señal (e.g., "TDT").
    -   `nivel_minimo` (DOUBLE): Nivel mínimo aceptable (dB).
    -   `nivel_maximo` (DOUBLE): Nivel máximo aceptable (dB).

#### Tabla Simulaciones

Almacena las simulaciones realizadas para cada configuración.

-   Campos:
    -   `id_simulaciones` (INTEGER, Primary Key, AUTO_INCREMENT): Identificador único.
    -   `id_configuraciones` (INTEGER, Foreign Key a Configuraciones.id_configuraciones): Configuración asociada.
    -   `frecuencia` (INTEGER): Frecuencia de la simulación.
    -   `tipo_senal` (VARCHAR(50)): Tipo de señal simulada.
    -   `costo_total` (DECIMAL(10,2)): Costo total de la simulación.
    -   `estado` (VARCHAR(20)): Estado de la simulación.
    -   `fecha_simulacion` (TIMESTAMP): Fecha de la simulación.

#### Tabla ResultadosSimulacion

Almacena los resultados detallados de cada simulación por piso.

-   Campos:
    -   `id_resultados_simulacion` (INTEGER, Primary Key, AUTO_INCREMENT): Identificador único.
    -   `id_simulaciones` (INTEGER, Foreign Key a Simulaciones.id_simulaciones): Simulación asociada.
    -   `piso` (INTEGER): Número de piso.
    -   `nivel_senal` (DOUBLE): Nivel de señal en el piso.
    -   `costo_piso` (DECIMAL(10,2)): Costo del piso.
    -   `estado` (VARCHAR(20)): Estado del resultado.

#### Tabla Esquematicos

Almacena la información de los esquemas generados para cada simulación.

-   Campos:
    -   `id_esquematicos` (INTEGER, Primary Key, AUTO_INCREMENT): Identificador único.
    -   `id_simulaciones` (INTEGER, Foreign Key a Simulaciones.id_simulaciones): Simulación asociada.
    -   `piso` (INTEGER): Número de piso.
    -   `tipo_componente` (VARCHAR(20)): Tipo de componente.
    -   `modelo_componente` (VARCHAR(100), Foreign Key a Componentes.modelo): Modelo del componente.
    -   `posicion_x` (INTEGER): Posición X en el esquema.
    -   `posicion_y` (INTEGER): Posición Y en el esquema.
    -   `cable_tipo` (VARCHAR(100)): Tipo de cable utilizado.

### Relaciones entre Tablas

1. `TiposComponente (1)` → `(N) Componentes`

    - `Componentes.id_tipos_componente` → `TiposComponente.id_tipos_componente`
    - Cada tipo de componente puede tener múltiples componentes específicos

2. `Componentes (1)` → `(0..1) Coaxiales`

    - `Coaxiales.id_componentes` → `Componentes.id_componentes`
    - Un componente de tipo cable coaxial tiene una entrada en la tabla Coaxiales

3. `Componentes (1)` → `(0..1) Derivadores`

    - `Derivadores.id_componentes` → `Componentes.id_componentes`
    - Un componente de tipo derivador tiene una entrada en la tabla Derivadores

4. `Componentes (1)` → `(0..1) Distribuidores`

    - `Distribuidores.id_componentes` → `Componentes.id_componentes`
    - Un componente de tipo distribuidor tiene una entrada en la tabla Distribuidores

5. `Componentes (1)` → `(0..1) Tomas`

    - `Tomas.id_componentes` → `Componentes.id_componentes`
    - Un componente de tipo toma tiene una entrada en la tabla Tomas

6. `Configuraciones (1)` → `(N) Simulaciones`

    - `Simulaciones.id_configuraciones` → `Configuraciones.id_configuraciones`
    - Una configuración puede tener múltiples simulaciones

7. `Simulaciones (1)` → `(N) ResultadosSimulacion`

    - `ResultadosSimulacion.id_simulaciones` → `Simulaciones.id_simulaciones`
    - Una simulación tiene resultados para cada piso

8. `Simulaciones (1)` → `(N) Esquematicos`

    - `Esquematicos.id_simulaciones` → `Simulaciones.id_simulaciones`
    - Una simulación puede tener múltiples esquemas

9. `Componentes (1)` → `(N) Esquematicos`
    - `Esquematicos.modelo_componente` → `Componentes.modelo`
    - Un componente puede aparecer en múltiples esquemas

### Índices para Mejor Rendimiento

-   `idx_componentes_tipo`: Índice en `Componentes(id_tipos_componente)`
-   `idx_coaxiales_componente`: Índice en `Coaxiales(id_componentes)`
-   `idx_derivadores_componente`: Índice en `Derivadores(id_componentes)`
-   `idx_distribuidores_componente`: Índice en `Distribuidores(id_componentes)`
-   `idx_tomas_componente`: Índice en `Tomas(id_componentes)`
-   `idx_simulaciones_config`: Índice en `Simulaciones(id_configuraciones)`
-   `idx_esquematicos_simulacion`: Índice en `Esquematicos(id_simulaciones)`
-   `idx_esquematicos_piso`: Índice en `Esquematicos(piso)`
-   `idx_resultados_simulacion`: Índice en `ResultadosSimulacion(id_simulaciones)`
-   `idx_resultados_piso`: Índice en `ResultadosSimulacion(piso)`

### Datos de Ejemplo

#### Tipos de Componentes

-   Cable Coaxial: Cables para conexión de componentes
-   Base de Toma: Dispositivos para derivar señal a diferentes pisos
-   Derivador: Dispositivos para distribuir señal a múltiples salidas
-   Distribuidor: Tomas de acceso para conexión final

#### Componentes

-   Cables: CE-752, CE-740, CE-170, FI-250, CL-200
-   Tomas: BS-100, BS-112, BS-110, BS-111, BS-210, BS-510
-   Derivadores: FP-414, FP-420, FP-426
-   Distribuidores: FI-243, FI-473, FI-253, FI-483

#### Márgenes de Calidad

-   TDT: Nivel mínimo 45.0 dB, Nivel máximo 70.0 dB

#### Configuraciones

-   Edificio A: 5 pisos, nivel de cabecera 95.0 dB, costo total 580.25
-   Edificio B: 8 pisos, nivel de cabecera 98.0 dB, costo total 920.50
