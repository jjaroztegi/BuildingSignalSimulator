# Base de Datos

## Estructura

### Tablas Principales

#### Tabla TiposComponente

Almacena los tipos de componentes disponibles en el sistema.

-   Campos:
    -   `id_tipos_componente` (COUNTER, Primary Key): Identificador único.
    -   `nombre` (TEXT(50)): Nombre del tipo ("Cable Coaxial", "Base de Toma", "Derivador", "Distribuidor").
    -   `descripcion` (TEXT(255)): Descripción detallada del tipo de componente.

#### Tabla Componentes

Almacena información general sobre los componentes utilizados en la red.

-   Campos:
    -   `id_componentes` (COUNTER, Primary Key): Identificador único.
    -   `id_tipos_componente` (LONG, Foreign Key a TiposComponente.id_tipos_componente): Tipo de componente.
    -   `modelo` (TEXT(100)): Nombre o modelo del componente (e.g., "CE-752", "BS-100").
    -   `costo` (CURRENCY): Costo unitario.

### Tablas de Componentes Específicos

#### Tabla Coaxiales

Registra las propiedades técnicas específicas de los cables coaxiales.

-   Campos:
    -   `id_coaxiales` (COUNTER, Primary Key): Identificador único.
    -   `id_componentes` (LONG, Foreign Key a Componentes.id_componentes): Vinculación con Componentes.
    -   `atenuacion_470mhz` (DOUBLE): Atenuación en dB a 470 MHz.
    -   `atenuacion_694mhz` (DOUBLE): Atenuación en dB a 694 MHz.

#### Tabla Derivadores

Contiene las características de los derivadores.

-   Campos:
    -   `id_derivadores` (COUNTER, Primary Key): Identificador único.
    -   `id_componentes` (LONG, Foreign Key a Componentes.id_componentes): Vinculación con Componentes.
    -   `atenuacion_derivacion` (DOUBLE): Atenuación en dB en las salidas derivadas.
    -   `atenuacion_paso` (DOUBLE): Atenuación en dB al pasar por el derivador.
    -   `directividad` (DOUBLE): Directividad en dB.
    -   `desacoplo` (DOUBLE): Desacoplo en dB.
    -   `perdidas_retorno` (DOUBLE): Pérdidas de retorno en dB.

#### Tabla Distribuidores

Almacena datos de los distribuidores (splitters).

-   Campos:
    -   `id_distribuidores` (COUNTER, Primary Key): Identificador único.
    -   `id_componentes` (LONG, Foreign Key a Componentes.id_componentes): Vinculación con Componentes.
    -   `numero_salidas` (LONG): Número de salidas.
    -   `atenuacion_distribucion` (DOUBLE): Atenuación en dB por cada salida.
    -   `desacoplo` (DOUBLE): Desacoplo en dB.
    -   `perdidas_retorno` (DOUBLE): Pérdidas de retorno en dB.

#### Tabla Tomas

Registra las características técnicas de las tomas.

-   Campos:
    -   `id_tomas` (COUNTER, Primary Key): Identificador único.
    -   `id_componentes` (LONG, Foreign Key a Componentes.id_componentes): Vinculación con Componentes.
    -   `atenuacion` (DOUBLE): Atenuación en dB.
    -   `desacoplo` (DOUBLE): Desacoplo en dB.

### Tablas de Configuración

#### Tabla Configuraciones

Guarda las configuraciones generales creadas por los usuarios.

-   Campos:
    -   `id_configuraciones` (COUNTER, Primary Key): Identificador único.
    -   `nombre` (TEXT(100)): Nombre descriptivo (e.g., "Edificio A").
    -   `nivel_cabecera` (DOUBLE): Nivel de señal inicial (dB).
    -   `num_pisos` (LONG): Número de pisos.
    -   `costo_total` (CURRENCY): Costo total calculado.
    -   `fecha_creacion` (DATETIME): Fecha de creación.
    -   `usuario_creacion` (TEXT(50)): Usuario que creó la configuración.
    -   `fecha_modificacion` (DATETIME): Fecha de última modificación.
    -   `usuario_modificacion` (TEXT(50)): Usuario que realizó la última modificación.

#### Tabla MargenesCalidad

Define los márgenes de calidad aceptables para la señal.

-   Campos:
    -   `id_margenes_calidad` (COUNTER, Primary Key): Identificador único.
    -   `tipo_senal` (TEXT(50)): Tipo de señal (e.g., "TDT").
    -   `nivel_minimo` (DOUBLE): Nivel mínimo aceptable (dB).
    -   `nivel_maximo` (DOUBLE): Nivel máximo aceptable (dB).

### Relaciones entre Tablas

1. `TiposComponente (1)` → `(N) Componentes`

    - `Componentes.id_tipos_componente` → `TiposComponente.id_tipos_componente`
    - Cada tipo de componente puede tener múltiples componentes específicos
    - Ejemplo: El tipo "Cable Coaxial" tiene múltiples modelos como CE-752, CE-740, etc.

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

### Índices para Mejor Rendimiento

- `idx_componentes_tipo`: Índice en `Componentes(id_tipos_componente)`
- `idx_coaxiales_componente`: Índice en `Coaxiales(id_componentes)`
- `idx_derivadores_componente`: Índice en `Derivadores(id_componentes)`
- `idx_distribuidores_componente`: Índice en `Distribuidores(id_componentes)`
- `idx_tomas_componente`: Índice en `Tomas(id_componentes)`

### Datos de Ejemplo

#### Tipos de Componentes
- Cable Coaxial: Cables para conexión de componentes
- Base de Toma: Dispositivos para derivar señal a diferentes pisos
- Derivador: Dispositivos para distribuir señal a múltiples salidas
- Distribuidor: Tomas de acceso para conexión final

#### Componentes
- Cables: CE-752, CE-740, CE-170, FI-250, CL-200
- Tomas: BS-100, BS-112, BS-110, BS-111, BS-210, BS-510
- Derivadores: FP-414, FP-420, FP-426
- Distribuidores: FI-243, FI-473, FI-253, FI-483

#### Márgenes de Calidad
- TDT: Nivel mínimo 45.0 dB, Nivel máximo 70.0 dB

#### Configuraciones
- Edificio A: 5 pisos, nivel de cabecera 95.0 dB, costo total 580.25
- Edificio B: 8 pisos, nivel de cabecera 98.0 dB, costo total 920.50
