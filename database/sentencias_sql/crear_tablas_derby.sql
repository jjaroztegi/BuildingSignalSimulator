-- Create TiposComponente table
CREATE TABLE TiposComponente (
    id_tipo INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(500),
    PRIMARY KEY (id_tipo)
);

-- Create Tomas table
CREATE TABLE Tomas (
    id_toma INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
    id_componente INT NOT NULL,
    atenuacion DECIMAL(5,2) NOT NULL,
    desacoplo DECIMAL(5,2) NOT NULL,
    PRIMARY KEY (id_toma),
    FOREIGN KEY (id_componente) REFERENCES Componentes(id_componente)
);

-- Create Componentes table
CREATE TABLE Componentes (
    id_componente INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
    id_tipo INTEGER NOT NULL,
    modelo VARCHAR(100),
    costo DECIMAL(10,2),
    fecha_creacion TIMESTAMP,
    usuario_creacion VARCHAR(100),
    fecha_modificacion TIMESTAMP,
    usuario_modificacion VARCHAR(100),
    PRIMARY KEY (id_componente),
    FOREIGN KEY (id_tipo) REFERENCES TiposComponente(id_tipo)
);

-- Create Frecuencias table
CREATE TABLE Frecuencias (
    id_frecuencia INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
    valor DECIMAL(10,2),
    descripcion VARCHAR(255),
    PRIMARY KEY (id_frecuencia)
);

-- Create Cables table
CREATE TABLE Cables (
    id_cable INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
    id_componente INTEGER NOT NULL,
    longitud_maxima DECIMAL(10,2),
    PRIMARY KEY (id_cable),
    FOREIGN KEY (id_componente) REFERENCES Componentes(id_componente)
);

-- Create AtenuacionesCable table
CREATE TABLE AtenuacionesCable (
    id_atenuacion INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
    id_cable INTEGER NOT NULL,
    id_frecuencia INTEGER NOT NULL,
    atenuacion_100m DECIMAL(10,2),
    PRIMARY KEY (id_atenuacion),
    FOREIGN KEY (id_cable) REFERENCES Cables(id_cable),
    FOREIGN KEY (id_frecuencia) REFERENCES Frecuencias(id_frecuencia)
);

-- Create Derivadores table
CREATE TABLE Derivadores (
    id_derivador INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
    id_componente INTEGER NOT NULL,
    atenuacion_insercion DECIMAL(10,2),
    atenuacion_derivacion DECIMAL(10,2),
    num_salidas INTEGER,
    directividad DECIMAL(10,2),
    desacoplo DECIMAL(10,2),
    PRIMARY KEY (id_derivador),
    FOREIGN KEY (id_componente) REFERENCES Componentes(id_componente)
);

-- Create Distribuidores table
CREATE TABLE Distribuidores (
    id_distribuidor INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
    id_componente INTEGER NOT NULL,
    num_salidas INTEGER,
    atenuacion_distribucion DECIMAL(10,2),
    desacoplo DECIMAL(10,2),
    PRIMARY KEY (id_distribuidor),
    FOREIGN KEY (id_componente) REFERENCES Componentes(id_componente)
);

-- Create AmplificadoresRuidoBase table
CREATE TABLE AmplificadoresRuidoBase (
    id_amplificador_ruido_base INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
    id_componente INTEGER NOT NULL,
    atenuacion DECIMAL(10,2),
    ganancia DECIMAL(10,2),
    figura_ruido DECIMAL(10,2),
    PRIMARY KEY (id_amplificador_ruido_base),
    FOREIGN KEY (id_componente) REFERENCES Componentes(id_componente)
);

-- Create Configuraciones table
CREATE TABLE Configuraciones (
    id_configuracion INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
    nombre VARCHAR(255),
    nivel_cabecera DECIMAL(10,2),
    num_pisos INTEGER,
    costo_total DECIMAL(10,2),
    fecha_creacion TIMESTAMP,
    usuario_creacion VARCHAR(100),
    fecha_modificacion TIMESTAMP,
    usuario_modificacion VARCHAR(100),
    PRIMARY KEY (id_configuracion)
);

-- Create DetalleConfiguracion table
CREATE TABLE DetalleConfiguracion (
    id_detalle INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
    id_configuracion INTEGER NOT NULL,
    piso INTEGER,
    id_cable INTEGER,
    longitud_cable DECIMAL(10,2),
    id_derivador INTEGER,
    id_distribuidor INTEGER,
    id_amplificador_ruido_base INTEGER,
    nivel_senal DECIMAL(10,2),
    fecha_calculo TIMESTAMP,
    PRIMARY KEY (id_detalle),
    FOREIGN KEY (id_configuracion) REFERENCES Configuraciones(id_configuracion),
    FOREIGN KEY (id_cable) REFERENCES Cables(id_cable),
    FOREIGN KEY (id_derivador) REFERENCES Derivadores(id_derivador),
    FOREIGN KEY (id_distribuidor) REFERENCES Distribuidores(id_distribuidor),
    FOREIGN KEY (id_amplificador_ruido_base) REFERENCES AmplificadoresRuidoBase(id_amplificador_ruido_base)
);

-- Create MargenesCalidad table
CREATE TABLE MargenesCalidad (
    id_margen INTEGER NOT NULL GENERATED ALWAYS AS IDENTITY (START WITH 1, INCREMENT BY 1),
    tipo_senal VARCHAR(100),
    nivel_minimo DECIMAL(10,2),
    nivel_maximo DECIMAL(10,2),
    PRIMARY KEY (id_margen)
);

-- Insert basic data for TiposComponente
INSERT INTO TiposComponente (nombre, descripcion) VALUES 
('cable', 'Cables para conexión de componentes'),
('derivador', 'Dispositivos para derivar señal a diferentes pisos'),
('distribuidor', 'Dispositivos para distribuir señal a múltiples salidas'),
('amplificador', 'Amplificadores de señal para compensar pérdidas');
