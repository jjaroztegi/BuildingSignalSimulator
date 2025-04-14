# Base de Datos

## Estructura

### Tablas Principales

#### Tabla TiposComponente

Almacena los tipos de componentes disponibles en el sistema.

-   Campos:
    -   `id_tiposcomponente` (COUNTER, Primary Key): Identificador único.
    -   `nombre` (VARCHAR(100)): Nombre del tipo ("cable", "derivador", "distribuidor", "amplificador").
    -   `descripcion` (VARCHAR(255)): Descripción detallada del tipo de componente.

#### Tabla Componentes

Almacena información general sobre los componentes utilizados en la red.

-   Campos:
    -   `id_componentes` (COUNTER, Primary Key): Identificador único.
    -   `id_tiposcomponente` (INTEGER, Foreign Key a TiposComponente.id_tiposcomponente): Tipo de componente.
    -   `modelo` (VARCHAR(100)): Nombre o modelo del componente (e.g., "Cable RG6").
    -   `costo` (CURRENCY): Costo unitario.
    -   `fecha_creacion` (DATETIME): Fecha de registro del componente.
    -   `usuario_creacion` (VARCHAR(100)): Usuario que registró el componente.
    -   `fecha_modificacion` (DATETIME): Fecha de última modificación.
    -   `usuario_modificacion` (VARCHAR(100)): Usuario que realizó la última modificación.

#### Tabla Frecuencias

Define las frecuencias estándar utilizadas para medir atenuaciones.

-   Campos:
    -   `id_frecuencias` (COUNTER, Primary Key): Identificador único.
    -   `valor` (DECIMAL(18)): Valor en MHz.
    -   `descripcion` (VARCHAR(255)): Descripción de la frecuencia (e.g., "UHF Baja").

### Tablas de Componentes Específicos

#### Tabla Cables

Registra las propiedades técnicas específicas de los cables.

-   Campos:
    -   `id_cables` (COUNTER, Primary Key): Identificador único.
    -   `id_componentes` (INTEGER, Foreign Key a Componentes.id_componentes): Vinculación con Componentes.
    -   `longitud_maxima` (DECIMAL(18)): Longitud máxima (metros).

#### Tabla AtenuacionesCable

Almacena las atenuaciones de cada cable para diferentes frecuencias.

-   Campos:
    -   `id_atenuacionescable` (COUNTER, Primary Key): Identificador único.
    -   `id_cables` (INTEGER, Foreign Key a Cables.id_cables): Cable relacionado.
    -   `id_frecuencias` (INTEGER, Foreign Key a Frecuencias.id_frecuencias): Frecuencia relacionada.
    -   `atenuacion_100m` (DECIMAL(18)): Atenuación en dB por 100 metros a la frecuencia indicada.

#### Tabla Derivadores

Contiene las características de los derivadores.

-   Campos:
    -   `id_derivadores` (COUNTER, Primary Key): Identificador único.
    -   `id_componentes` (INTEGER, Foreign Key a Componentes.id_componentes): Vinculación con Componentes.
    -   `atenuacion_insercion` (DECIMAL(18)): Atenuación en dB al pasar por el derivador.
    -   `atenuacion_derivacion` (DECIMAL(18)): Atenuación en dB en las salidas derivadas.
    -   `num_salidas` (INTEGER): Número de salidas derivadas.
    -   `directividad` (DECIMAL(18)): Directividad en dB.
    -   `desacoplo` (DECIMAL(18)): Desacoplo en dB.

#### Tabla Distribuidores

Almacena datos de los distribuidores (splitters).

-   Campos:
    -   `id_distribuidores` (COUNTER, Primary Key): Identificador único.
    -   `id_componentes` (INTEGER, Foreign Key a Componentes.id_componentes): Vinculación con Componentes.
    -   `num_salidas` (INTEGER): Número de salidas.
    -   `atenuacion_distribucion` (DECIMAL(18)): Atenuación en dB por cada salida.
    -   `desacoplo` (DECIMAL(18)): Desacoplo en dB.

#### Tabla AmplificadoresRuidoBase

Guarda información sobre amplificadores y sus características.

-   Campos:
    -   `id_amplificadoresruidobase` (COUNTER, Primary Key): Identificador único.
    -   `id_componentes` (INTEGER, Foreign Key a Componentes.id_componentes): Vinculación con Componentes.
    -   `atenuacion` (DECIMAL(18)): Atenuación en dB.
    -   `ganancia` (DECIMAL(18)): Ganancia en dB.
    -   `figura_ruido` (DECIMAL(18)): Figura de ruido en dB.

#### Tabla Tomas

Registra las características técnicas de las tomas.

-   Campos:
    -   `id_tomas` (COUNTER, Primary Key): Identificador único.
    -   `id_componentes` (INTEGER, Foreign Key a Componentes.id_componentes): Vinculación con Componentes.
    -   `atenuacion` (INTEGER): Atenuación en dB.

### Tablas de Configuración

#### Tabla Configuraciones

Guarda las configuraciones generales creadas por los usuarios.

-   Campos:
    -   `id_configuraciones` (COUNTER, Primary Key): Identificador único.
    -   `nombre` (VARCHAR(255)): Nombre descriptivo (e.g., "Edificio A").
    -   `nivel_cabecera` (DECIMAL(18)): Nivel de señal inicial (dB).
    -   `num_pisos` (INTEGER): Número de pisos.
    -   `costo_total` (CURRENCY): Costo total calculado.
    -   `fecha_creacion` (DATETIME): Fecha de creación.
    -   `usuario_creacion` (VARCHAR(100)): Usuario que creó la configuración.
    -   `fecha_modificacion` (DATETIME): Fecha de última modificación.
    -   `usuario_modificacion` (VARCHAR(100)): Usuario que realizó la última modificación.

#### Tabla DetalleConfiguracion

Detalla la configuración específica de cada piso.

-   Campos:
    -   `id_detalles` (COUNTER, Primary Key): Identificador único.
    -   `id_configuraciones` (INTEGER, Foreign Key a Configuraciones.id_configuraciones): Vinculación con Configuraciones.
    -   `piso` (INTEGER): Número del piso.
    -   `id_cables` (INTEGER, Foreign Key a Cables.id_cables): Cable usado.
    -   `longitud_cable` (DECIMAL(18)): Longitud del cable (metros).
    -   `id_derivadores` (INTEGER, Foreign Key a Derivadores.id_derivadores, Permitir Nulos): Derivador usado (si aplica).
    -   `id_distribuidores` (INTEGER, Foreign Key a Distribuidores.id_distribuidores, Permitir Nulos): Distribuidor usado (si aplica).
    -   `id_amplificadoresruidobase` (INTEGER, Foreign Key a AmplificadoresRuidoBase.id_amplificadoresruidobase, Permitir Nulos): Amplificador usado (si aplica).
    -   `nivel_senal` (DECIMAL(18)): Nivel de señal calculado (dB).
    -   `fecha_calculo` (DATETIME): Fecha de cálculo o modificación.

#### Tabla MargenesCalidad

Define los márgenes de calidad aceptables para la señal.

-   Campos:
    -   `id_margenescalidad` (COUNTER, Primary Key): Identificador único.
    -   `tipo_senal` (VARCHAR(100)): Tipo de señal (e.g., "DEFAULT").
    -   `nivel_minimo` (DECIMAL(18)): Nivel mínimo aceptable (dB).
    -   `nivel_maximo` (DECIMAL(18)): Nivel máximo aceptable (dB).

### Relaciones entre Tablas

1. `TiposComponente (1)` → `(N) Componentes`

    - `Componentes.id_tiposcomponente` → `TiposComponente.id_tiposcomponente`

2. `Componentes (1)` → `(0..1) Cables`

    - `Cables.id_componentes` → `Componentes.id_componentes`

3. `Componentes (1)` → `(0..1) Derivadores`

    - `Derivadores.id_componentes` → `Componentes.id_componentes`

4. `Componentes (1)` → `(0..1) Distribuidores`

    - `Distribuidores.id_componentes` → `Componentes.id_componentes`

5. `Componentes (1)` → `(0..1) AmplificadoresRuidoBase`

    - `AmplificadoresRuidoBase.id_componentes` → `Componentes.id_componentes`

6. `Componentes (1)` → `(0..1) Tomas`

    - `Tomas.id_componentes` → `Componentes.id_componentes`

7. `Cables (1)` → `(N) AtenuacionesCable`

    - `AtenuacionesCable.id_cables` → `Cables.id_cables`

8. `Frecuencias (1)` → `(N) AtenuacionesCable`

    - `AtenuacionesCable.id_frecuencias` → `Frecuencias.id_frecuencias`

9. `Configuraciones (1)` → `(N) DetalleConfiguracion`

    - `DetalleConfiguracion.id_configuraciones` → `Configuraciones.id_configuraciones`

10. `Cables (1)` → `(0..N) DetalleConfiguracion`

    - `DetalleConfiguracion.id_cables` → `Cables.id_cables` (nullable)

11. `Derivadores (1)` → `(0..N) DetalleConfiguracion`

    - `DetalleConfiguracion.id_derivadores` → `Derivadores.id_derivadores` (nullable)

12. `Distribuidores (1)` → `(0..N) DetalleConfiguracion`

    - `DetalleConfiguracion.id_distribuidores` → `Distribuidores.id_distribuidores` (nullable)

13. `AmplificadoresRuidoBase (1)` → `(0..N) DetalleConfiguracion`
    - `DetalleConfiguracion.id_amplificadoresruidobase` → `AmplificadoresRuidoBase.id_amplificadoresruidobase` (nullable)

Notas:

-   Las relaciones (0..1) indican que un componente puede tener cero o un registro en la tabla específica correspondiente.
-   Las relaciones (0..N) en DetalleConfiguracion indican que los campos son opcionales (nullable).
-   Las relaciones (1:N) indican que un registro puede tener múltiples registros relacionados.
