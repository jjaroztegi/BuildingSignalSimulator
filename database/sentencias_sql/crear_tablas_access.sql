-- Create TiposComponente table
CREATE TABLE TiposComponente (
    id_tipo COUNTER PRIMARY KEY,
    nombre TEXT(100) NOT NULL UNIQUE,
    descripcion TEXT(255)
);

-- Create Componentes table
CREATE TABLE Componentes (
    id_componente COUNTER PRIMARY KEY,
    id_tipo INTEGER NOT NULL,
    modelo TEXT(100),
    costo CURRENCY,
    fecha_creacion DATETIME,
    usuario_creacion TEXT(100),
    fecha_modificacion DATETIME,
    usuario_modificacion TEXT(100),
    CONSTRAINT FK_Componentes_TiposComponente FOREIGN KEY (id_tipo) REFERENCES TiposComponente(id_tipo)
);

-- Create Frecuencias table
CREATE TABLE Frecuencias (
    id_frecuencia COUNTER PRIMARY KEY,
    valor CURRENCY,
    descripcion TEXT(255)
);

-- Create Cables table
CREATE TABLE Cables (
    id_cable COUNTER PRIMARY KEY,
    id_componente INTEGER NOT NULL,
    longitud_maxima CURRENCY,
    CONSTRAINT FK_Cables_Componentes FOREIGN KEY (id_componente) REFERENCES Componentes(id_componente)
);

-- Create AtenuacionesCable table
CREATE TABLE AtenuacionesCable (
    id_atenuacion COUNTER PRIMARY KEY,
    id_cable INTEGER NOT NULL,
    id_frecuencia INTEGER NOT NULL,
    atenuacion_100m CURRENCY,
    CONSTRAINT FK_AtenuacionesCable_Cables FOREIGN KEY (id_cable) REFERENCES Cables(id_cable),
    CONSTRAINT FK_AtenuacionesCable_Frecuencias FOREIGN KEY (id_frecuencia) REFERENCES Frecuencias(id_frecuencia)
);

-- Create Derivadores table
CREATE TABLE Derivadores (
    id_derivador COUNTER PRIMARY KEY,
    id_componente INTEGER NOT NULL,
    atenuacion_insercion CURRENCY,
    atenuacion_derivacion CURRENCY,
    num_salidas INTEGER,
    directividad CURRENCY,
    desacoplo CURRENCY,
    CONSTRAINT FK_Derivadores_Componentes FOREIGN KEY (id_componente) REFERENCES Componentes(id_componente)
);

-- Create Distribuidores table
CREATE TABLE Distribuidores (
    id_distribuidor COUNTER PRIMARY KEY,
    id_componente INTEGER NOT NULL,
    num_salidas INTEGER,
    atenuacion_distribucion CURRENCY,
    desacoplo CURRENCY,
    CONSTRAINT FK_Distribuidores_Componentes FOREIGN KEY (id_componente) REFERENCES Componentes(id_componente)
);

-- Create AmplificadoresRuidoBase table
CREATE TABLE AmplificadoresRuidoBase (
    id_amplificador_ruido_base COUNTER PRIMARY KEY,
    id_componente INTEGER NOT NULL,
    atenuacion CURRENCY,
    ganancia CURRENCY,
    figura_ruido CURRENCY,
    CONSTRAINT FK_Amplificadores_Componentes FOREIGN KEY (id_componente) REFERENCES Componentes(id_componente)
);

-- Create Tomas table
CREATE TABLE Tomas (
    id_toma COUNTER PRIMARY KEY,
    id_componente INTEGER NOT NULL,
    atenuacion CURRENCY NOT NULL,
    desacoplo CURRENCY NOT NULL,
    CONSTRAINT FK_Tomas_Componentes FOREIGN KEY (id_componente) REFERENCES Componentes(id_componente)
);

-- Create Configuraciones table
CREATE TABLE Configuraciones (
    id_configuracion COUNTER PRIMARY KEY,
    nombre TEXT(255),
    nivel_cabecera CURRENCY,
    num_pisos INTEGER,
    costo_total CURRENCY,
    fecha_creacion DATETIME,
    usuario_creacion TEXT(100),
    fecha_modificacion DATETIME,
    usuario_modificacion TEXT(100)
);

-- Create MargenesCalidad table
CREATE TABLE MargenesCalidad (
    id_margen COUNTER PRIMARY KEY,
    tipo_senal TEXT(100),
    nivel_minimo CURRENCY,
    nivel_maximo CURRENCY
);

-- Create DetalleConfiguracion table
CREATE TABLE DetalleConfiguracion (
    id_detalle COUNTER PRIMARY KEY,
    id_configuracion INTEGER NOT NULL,
    piso INTEGER,
    id_cable INTEGER,
    longitud_cable CURRENCY,
    id_derivador INTEGER,
    id_distribuidor INTEGER,
    id_amplificador_ruido_base INTEGER,
    nivel_senal CURRENCY,
    fecha_calculo DATETIME,
    CONSTRAINT FK_Detalle_Configuracion FOREIGN KEY (id_configuracion) REFERENCES Configuraciones(id_configuracion),
    CONSTRAINT FK_Detalle_Cables FOREIGN KEY (id_cable) REFERENCES Cables(id_cable),
    CONSTRAINT FK_Detalle_Derivadores FOREIGN KEY (id_derivador) REFERENCES Derivadores(id_derivador),
    CONSTRAINT FK_Detalle_Distribuidores FOREIGN KEY (id_distribuidor) REFERENCES Distribuidores(id_distribuidor),
    CONSTRAINT FK_Detalle_Amplificadores FOREIGN KEY (id_amplificador_ruido_base) REFERENCES AmplificadoresRuidoBase(id_amplificador_ruido_base)
);