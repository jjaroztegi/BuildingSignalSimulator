# Base de Datos

## Estructura

### Tablas Principales

#### Tabla TiposComponente

Almacena los tipos de componentes disponibles en el sistema.

- Campos:
  - `id_tipo` (COUNTER, Primary Key): Identificador único.
  - `nombre` (VARCHAR(100)): Nombre del tipo ("cable", "derivador", "distribuidor", "amplificador").
  - `descripcion` (VARCHAR(255)): Descripción detallada del tipo de componente.

#### Tabla Componentes

Almacena información general sobre los componentes utilizados en la red.

- Campos:
  - `id_componente` (COUNTER, Primary Key): Identificador único.
  - `id_tipo` (INTEGER, Foreign Key a TiposComponente.id_tipo): Tipo de componente.
  - `modelo` (VARCHAR(100)): Nombre o modelo del componente (e.g., "Cable RG6").
  - `costo` (CURRENCY): Costo unitario.
  - `fecha_creacion` (DATETIME): Fecha de registro del componente.
  - `usuario_creacion` (VARCHAR(100)): Usuario que registró el componente.
  - `fecha_modificacion` (DATETIME): Fecha de última modificación.
  - `usuario_modificacion` (VARCHAR(100)): Usuario que realizó la última modificación.

#### Tabla Frecuencias

Define las frecuencias estándar utilizadas para medir atenuaciones.

- Campos:
  - `id_frecuencia` (COUNTER, Primary Key): Identificador único.
  - `valor` (DECIMAL(18)): Valor en MHz.
  - `descripcion` (VARCHAR(255)): Descripción de la frecuencia (e.g., "UHF Baja").

### Tablas de Componentes Específicos

#### Tabla Cables

Registra las propiedades técnicas específicas de los cables.

- Campos:
  - `id_cable` (COUNTER, Primary Key): Identificador único.
  - `id_componente` (INTEGER, Foreign Key a Componentes.id_componente): Vinculación con Componentes.
  - `longitud_maxima` (DECIMAL(18)): Longitud máxima (metros).

#### Tabla AtenuacionesCable

Almacena las atenuaciones de cada cable para diferentes frecuencias.

- Campos:
  - `id_atenuacion` (COUNTER, Primary Key): Identificador único.
  - `id_cable` (INTEGER, Foreign Key a Cables.id_cable): Cable relacionado.
  - `id_frecuencia` (INTEGER, Foreign Key a Frecuencias.id_frecuencia): Frecuencia relacionada.
  - `atenuacion_100m` (DECIMAL(18)): Atenuación en dB por 100 metros a la frecuencia indicada.

#### Tabla Derivadores

Contiene las características de los derivadores.

- Campos:
  - `id_derivador` (COUNTER, Primary Key): Identificador único.
  - `id_componente` (INTEGER, Foreign Key a Componentes.id_componente): Vinculación con Componentes.
  - `atenuacion_insercion` (DECIMAL(18)): Atenuación en dB al pasar por el derivador.
  - `atenuacion_derivacion` (DECIMAL(18)): Atenuación en dB en las salidas derivadas.
  - `num_salidas` (INTEGER): Número de salidas derivadas.
  - `directividad` (DECIMAL(18)): Directividad en dB.
  - `desacoplo` (DECIMAL(18)): Desacoplo en dB.

#### Tabla Distribuidores

Almacena datos de los distribuidores (splitters).

- Campos:
  - `id_distribuidor` (COUNTER, Primary Key): Identificador único.
  - `id_componente` (INTEGER, Foreign Key a Componentes.id_componente): Vinculación con Componentes.
  - `num_salidas` (INTEGER): Número de salidas.
  - `atenuacion_distribucion` (DECIMAL(18)): Atenuación en dB por cada salida.
  - `desacoplo` (DECIMAL(18)): Desacoplo en dB.

#### Tabla AmplificadoresRuidoBase

Guarda información sobre amplificadores y sus características.

- Campos:
  - `id_amplificador_ruido_base` (COUNTER, Primary Key): Identificador único.
  - `id_componente` (INTEGER, Foreign Key a Componentes.id_componente): Vinculación con Componentes.
  - `atenuacion` (DECIMAL(18)): Atenuación en dB.
  - `ganancia` (DECIMAL(18)): Ganancia en dB.
  - `figura_ruido` (DECIMAL(18)): Figura de ruido en dB.

#### Tabla Tomas

Registra las características técnicas de las tomas.

- Campos:
  - `id_toma` (COUNTER, Primary Key): Identificador único.
  - `id_componente` (INTEGER, Foreign Key a Componentes.id_componente): Vinculación con Componentes.
  - `atenuacion` (INTEGER): Atenuación en dB.

### Tablas de Configuración

#### Tabla Configuraciones

Guarda las configuraciones generales creadas por los usuarios.

- Campos:
  - `id_configuracion` (COUNTER, Primary Key): Identificador único.
  - `nombre` (VARCHAR(255)): Nombre descriptivo (e.g., "Edificio A").
  - `nivel_cabecera` (DECIMAL(18)): Nivel de señal inicial (dB).
  - `num_pisos` (INTEGER): Número de pisos.
  - `costo_total` (CURRENCY): Costo total calculado.
  - `fecha_creacion` (DATETIME): Fecha de creación.
  - `usuario_creacion` (VARCHAR(100)): Usuario que creó la configuración.
  - `fecha_modificacion` (DATETIME): Fecha de última modificación.
  - `usuario_modificacion` (VARCHAR(100)): Usuario que realizó la última modificación.

#### Tabla DetalleConfiguracion

Detalla la configuración específica de cada piso.

- Campos:
  - `id_detalle` (COUNTER, Primary Key): Identificador único.
  - `id_configuracion` (INTEGER, Foreign Key a Configuraciones.id_configuracion): Vinculación con Configuraciones.
  - `piso` (INTEGER): Número del piso.
  - `id_cable` (INTEGER, Foreign Key a Cables.id_cable): Cable usado.
  - `longitud_cable` (DECIMAL(18)): Longitud del cable (metros).
  - `id_derivador` (INTEGER, Foreign Key a Derivadores.id_derivador, Permitir Nulos): Derivador usado (si aplica).
  - `id_distribuidor` (INTEGER, Foreign Key a Distribuidores.id_distribuidor, Permitir Nulos): Distribuidor usado (si aplica).
  - `id_amplificador_ruido_base` (INTEGER, Foreign Key a AmplificadoresRuidoBase.id_amplificador_ruido_base, Permitir Nulos): Amplificador usado (si aplica).
  - `nivel_senal` (DECIMAL(18)): Nivel de señal calculado (dB).
  - `fecha_calculo` (DATETIME): Fecha de cálculo o modificación.

#### Tabla MargenesCalidad

Define los márgenes de calidad aceptables para la señal.

- Campos:
  - `id_margen` (COUNTER, Primary Key): Identificador único.
  - `tipo_senal` (VARCHAR(100)): Tipo de señal (e.g., "DEFAULT").
  - `nivel_minimo` (DECIMAL(18)): Nivel mínimo aceptable (dB).
  - `nivel_maximo` (DECIMAL(18)): Nivel máximo aceptable (dB).

### Relaciones entre Tablas

1. `TiposComponente (1)` → `(N) Componentes`
   - `Componentes.id_tipo` → `TiposComponente.id_tipo`

2. `Componentes (1)` → `(0..1) Cables`
   - `Cables.id_componente` → `Componentes.id_componente`

3. `Componentes (1)` → `(0..1) Derivadores`
   - `Derivadores.id_componente` → `Componentes.id_componente`

4. `Componentes (1)` → `(0..1) Distribuidores`
   - `Distribuidores.id_componente` → `Componentes.id_componente`

5. `Componentes (1)` → `(0..1) AmplificadoresRuidoBase`
   - `AmplificadoresRuidoBase.id_componente` → `Componentes.id_componente`

6. `Componentes (1)` → `(0..1) Tomas`
   - `Tomas.id_componente` → `Componentes.id_componente`

7. `Cables (1)` → `(N) AtenuacionesCable`
   - `AtenuacionesCable.id_cable` → `Cables.id_cable`

8. `Frecuencias (1)` → `(N) AtenuacionesCable`
   - `AtenuacionesCable.id_frecuencia` → `Frecuencias.id_frecuencia`

9. `Configuraciones (1)` → `(N) DetalleConfiguracion`
   - `DetalleConfiguracion.id_configuracion` → `Configuraciones.id_configuracion`

10. `Cables (1)` → `(0..N) DetalleConfiguracion`
    - `DetalleConfiguracion.id_cable` → `Cables.id_cable` (nullable)

11. `Derivadores (1)` → `(0..N) DetalleConfiguracion`
    - `DetalleConfiguracion.id_derivador` → `Derivadores.id_derivador` (nullable)

12. `Distribuidores (1)` → `(0..N) DetalleConfiguracion`
    - `DetalleConfiguracion.id_distribuidor` → `Distribuidores.id_distribuidor` (nullable)

13. `AmplificadoresRuidoBase (1)` → `(0..N) DetalleConfiguracion`
    - `DetalleConfiguracion.id_amplificador_ruido_base` → `AmplificadoresRuidoBase.id_amplificador_ruido_base` (nullable)

Notas:
- Las relaciones (0..1) indican que un componente puede tener cero o un registro en la tabla específica correspondiente.
- Las relaciones (0..N) en DetalleConfiguracion indican que los campos son opcionales (nullable).
- Las relaciones (1:N) indican que un registro puede tener múltiples registros relacionados.
