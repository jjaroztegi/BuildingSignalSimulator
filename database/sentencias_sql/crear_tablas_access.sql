-- Create tipos_componente table (base table with no dependencies)
CREATE TABLE tipos_componente (
    id_tipos_componente COUNTER PRIMARY KEY,
    nombre TEXT(50) NOT NULL,
    descripcion TEXT(255)
);

-- Create componentes table (depends on tipos_componente)
CREATE TABLE componentes (
    id_componentes COUNTER PRIMARY KEY,
    id_tipos_componente LONG NOT NULL,
    modelo TEXT(100) NOT NULL,
    costo CURRENCY NOT NULL,
    CONSTRAINT fk_componentes_tipos_componente 
    FOREIGN KEY (id_tipos_componente) 
    REFERENCES tipos_componente(id_tipos_componente)
);

-- Create coaxiales table (depends on componentes)
CREATE TABLE coaxiales (
    id_coaxiales COUNTER PRIMARY KEY,
    id_componentes LONG NOT NULL,
    atenuacion_470mhz DOUBLE NOT NULL,
    atenuacion_694mhz DOUBLE NOT NULL,
    CONSTRAINT fk_coaxiales_componente 
    FOREIGN KEY (id_componentes) 
    REFERENCES componentes(id_componentes)
);

-- Create derivadores table (depends on componentes)
CREATE TABLE derivadores (
    id_derivadores COUNTER PRIMARY KEY,
    id_componentes LONG NOT NULL,
    atenuacion_derivacion DOUBLE NOT NULL,
    atenuacion_paso DOUBLE NOT NULL,
    directividad DOUBLE NOT NULL,
    desacoplo DOUBLE NOT NULL,
    perdidas_retorno DOUBLE NOT NULL,
    CONSTRAINT fk_derivadores_componente 
    FOREIGN KEY (id_componentes) 
    REFERENCES componentes(id_componentes)
);

-- Create distribuidores table (depends on componentes)
CREATE TABLE distribuidores (
    id_distribuidores COUNTER PRIMARY KEY,
    id_componentes LONG NOT NULL,
    numero_salidas LONG NOT NULL,
    atenuacion_distribucion DOUBLE NOT NULL,
    desacoplo DOUBLE NOT NULL,
    perdidas_retorno DOUBLE NOT NULL,
    CONSTRAINT fk_distribuidores_componente 
    FOREIGN KEY (id_componentes) 
    REFERENCES componentes(id_componentes)
);

-- Create tomas table (depends on componentes)
CREATE TABLE tomas (
    id_tomas COUNTER PRIMARY KEY,
    id_componentes LONG NOT NULL,
    atenuacion DOUBLE NOT NULL,
    desacoplo DOUBLE NOT NULL,
    CONSTRAINT fk_tomas_componente 
    FOREIGN KEY (id_componentes) 
    REFERENCES componentes(id_componentes)
);

-- Create configuraciones table (independent table)
CREATE TABLE configuraciones (
    id_configuraciones COUNTER PRIMARY KEY,
    nombre TEXT(100) NOT NULL,
    nivel_cabecera DOUBLE NOT NULL,
    num_pisos LONG NOT NULL,
    costo_total CURRENCY NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    usuario_creacion TEXT(50) NOT NULL,
    fecha_modificacion DATETIME,
    usuario_modificacion TEXT(50)
);

-- Create margenes_calidad table (independent table)
CREATE TABLE margenes_calidad (
    id_margenes_calidad COUNTER PRIMARY KEY,
    tipo_senal TEXT(50) NOT NULL,
    nivel_minimo DOUBLE NOT NULL,
    nivel_maximo DOUBLE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_componentes_tipo ON componentes(id_tipos_componente);
CREATE INDEX idx_coaxiales_componente ON coaxiales(id_componentes);
CREATE INDEX idx_derivadores_componente ON derivadores(id_componentes);
CREATE INDEX idx_distribuidores_componente ON distribuidores(id_componentes);
CREATE INDEX idx_tomas_componente ON tomas(id_componentes);
