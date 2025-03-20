# Base de Datos

## Estructura

### Tablas Principales

#### Tabla TiposComponente

Almacena los tipos de componentes disponibles en el sistema.

- Campos:
  - `id_tipo` (AutoNumber, Primary Key): Identificador único.
  - `nombre` (Texto, Unique): Nombre del tipo ("cable", "derivador", "distribuidor", "amplificador").
  - `descripcion` (Texto): Descripción detallada del tipo de componente.

#### Tabla Componentes

Almacena información general sobre los componentes utilizados en la red.

- Campos:
  - `id_componente` (AutoNumber, Primary Key): Identificador único.
  - `id_tipo` (Número, Foreign Key a TiposComponente.id_tipo): Tipo de componente.
  - `modelo` (Texto): Nombre o modelo del componente (e.g., "Cable RG6").
  - `costo` (Moneda): Costo unitario.
  - `fecha_creacion` (Fecha/Hora): Fecha de registro del componente.
  - `usuario_creacion` (Texto): Usuario que registró el componente.
  - `fecha_modificacion` (Fecha/Hora): Fecha de última modificación.
  - `usuario_modificacion` (Texto): Usuario que realizó la última modificación.

#### Tabla Frecuencias

Define las frecuencias estándar utilizadas para medir atenuaciones.

- Campos:
  - `id_frecuencia` (AutoNumber, Primary Key): Identificador único.
  - `valor` (Número): Valor en MHz.
  - `descripcion` (Texto): Descripción de la frecuencia (e.g., "UHF Baja").

### Tablas de Componentes Específicos

#### Tabla Cables

Registra las propiedades técnicas específicas de los cables.

- Campos:
  - `id_cable` (AutoNumber, Primary Key): Identificador único.
  - `id_componente` (Número, Foreign Key a Componentes.id_componente): Vinculación con Componentes.
  - `longitud_maxima` (Número): Longitud máxima (metros).

#### Tabla AtenuacionesCable

Almacena las atenuaciones de cada cable para diferentes frecuencias.

- Campos:
  - `id_atenuacion` (AutoNumber, Primary Key): Identificador único.
  - `id_cable` (Número, Foreign Key a Cables.id_cable): Cable relacionado.
  - `id_frecuencia` (Número, Foreign Key a Frecuencias.id_frecuencia): Frecuencia relacionada.
  - `atenuacion_100m` (Número): Atenuación en dB por 100 metros a la frecuencia indicada.

#### Tabla Derivadores

Contiene las características de los derivadores.

- Campos:
  - `id_derivador` (AutoNumber, Primary Key): Identificador único.
  - `id_componente` (Número, Foreign Key a Componentes.id_componente): Vinculación con Componentes.
  - `atenuacion_insercion` (Número): Atenuación en dB al pasar por el derivador.
  - `atenuacion_derivacion` (Número): Atenuación en dB en las salidas derivadas.
  - `num_salidas` (Número): Número de salidas derivadas.
  - `directividad` (Número): Directividad en dB.
  - `desacoplo` (Número): Desacoplo en dB.

#### Tabla Distribuidores

Almacena datos de los distribuidores (splitters).

- Campos:
  - `id_distribuidor` (AutoNumber, Primary Key): Identificador único.
  - `id_componente` (Número, Foreign Key a Componentes.id_componente): Vinculación con Componentes.
  - `num_salidas` (Número): Número de salidas.
  - `atenuacion_distribucion` (Número): Atenuación en dB por cada salida (AT_Distribucion).
  - `desacoplo` (Número): Desacoplo en dB.

#### Tabla AmplificadoresRuidoBase

Guarda información sobre amplificadores y sus características.

- Campos:
  - `id_amplificador_ruido_base` (AutoNumber, Primary Key): Identificador único.
  - `id_componente` (Número, Foreign Key a Componentes.id_componente): Vinculación con Componentes.
  - `atenuacion` (Número): Atenuación en dB.
  - `ganancia` (Número): Ganancia en dB.
  - `figura_ruido` (Número): Figura de ruido en dB.

#### Tabla Tomas

Registra las características técnicas de las tomas.

- Campos:
  - `id_toma` (AutoNumber, Primary Key): Identificador único.
  - `id_componente` (Número, Foreign Key a Componentes.id_componente): Vinculación con Componentes.
  - `atenuacion` (Número): Atenuación en dB.
  - `desacoplo` (Número): Desacoplo en dB.

### Tablas de Configuración

#### Tabla Configuraciones

Guarda las configuraciones generales creadas por los usuarios.

- Campos:
  - `id_configuracion` (AutoNumber, Primary Key): Identificador único.
  - `nombre` (Texto): Nombre descriptivo (e.g., "Edificio A").
  - `nivel_cabecera` (Número): Nivel de señal inicial (dB).
  - `num_pisos` (Número): Número de pisos.
  - `costo_total` (Moneda): Costo total calculado.
  - `fecha_creacion` (Fecha/Hora): Fecha de creación.
  - `usuario_creacion` (Texto): Usuario que creó la configuración.
  - `fecha_modificacion` (Fecha/Hora): Fecha de última modificación.
  - `usuario_modificacion` (Texto): Usuario que realizó la última modificación.

#### Tabla DetalleConfiguracion

Detalla la configuración específica de cada piso.

- Campos:
  - `id_detalle` (AutoNumber, Primary Key): Identificador único.
  - `id_configuracion` (Número, Foreign Key a Configuraciones.id_configuracion): Vinculación con Configuraciones.
  - `piso` (Número): Número del piso.
  - `id_cable` (Número, Foreign Key a Cables.id_cable): Cable usado.
  - `longitud_cable` (Número): Longitud del cable (metros).
  - `id_derivador` (Número, Foreign Key a Derivadores.id_derivador, Permitir Nulos): Derivador usado (si aplica).
  - `id_distribuidor` (Número, Foreign Key a Distribuidores.id_distribuidor, Permitir Nulos): Distribuidor usado (si aplica).
  - `id_amplificador_ruido_base` (Número, Foreign Key a AmplificadoresRuidoBase.id_amplificador_ruido_base, Permitir Nulos): Amplificador de Ruido Base usado (si aplica).
  - `nivel_senal` (Número): Nivel de señal calculado (dB).
  - `fecha_calculo` (Fecha/Hora): Fecha de cálculo o modificación.

#### Tabla MargenesCalidad

Define los márgenes de calidad aceptables para la señal.

- Campos:
  - `id_margen` (AutoNumber, Primary Key): Identificador único.
  - `tipo_senal` (Texto): Tipo de señal (e.g., "TV").
  - `nivel_minimo` (Número): Nivel mínimo aceptable (dB).
  - `nivel_maximo` (Número): Nivel máximo aceptable (dB).

### Relaciones entre Tablas

1. `TiposComponente (1)` → `(N) Componentes`
2. `Componentes (1)` → `(0..1) Cables`
3. `Componentes (1)` → `(0..1) Derivadores`
4. `Componentes (1)` → `(0..1) Distribuidores`
5. `Componentes (1)` → `(0..1) AmplificadoresRuidoBase`
6. `Componentes (1)` → `(0..1) Tomas`
7. `Cables (1)` → `(N) AtenuacionesCable`
8. `Frecuencias (1)` → `(N) AtenuacionesCable`
9. `Configuraciones (1)` → `(N) DetalleConfiguracion`
10. `Cables (1)` → `(N) DetalleConfiguracion`
11. `Derivadores (1)` → `(N) DetalleConfiguracion`
12. `Distribuidores (1)` → `(N) DetalleConfiguracion`
13. `AmplificadoresRuidoBase (1)` → `(N) DetalleConfiguracion`
