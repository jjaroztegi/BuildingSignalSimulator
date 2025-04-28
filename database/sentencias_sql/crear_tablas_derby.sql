-- Create tipos_componente table (base table with no dependencies)
CREATE TABLE tipos_componente (
    id_tipos_componente INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255)
);

-- Create configuraciones table (independent table)
CREATE TABLE configuraciones (
    id_configuraciones INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    nivel_cabecera DOUBLE NOT NULL,
    num_pisos INTEGER NOT NULL,
    costo_total DECIMAL(10,2) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    usuario_creacion VARCHAR(50) NOT NULL,
    fecha_modificacion TIMESTAMP,
    usuario_modificacion VARCHAR(50)
);

-- Create margenes_calidad table (independent table)
CREATE TABLE margenes_calidad (
    id_margenes_calidad INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tipo_senal VARCHAR(50) NOT NULL,
    nivel_minimo DOUBLE NOT NULL,
    nivel_maximo DOUBLE NOT NULL
);

-- Create componentes table (depends on tipos_componente)
CREATE TABLE componentes (
    id_componentes INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_tipos_componente INTEGER NOT NULL,
    modelo VARCHAR(100) NOT NULL UNIQUE,
    costo DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_componentes_tipos_componente 
    FOREIGN KEY (id_tipos_componente) 
    REFERENCES tipos_componente(id_tipos_componente)
);

-- Create coaxiales table (depends on componentes)
CREATE TABLE coaxiales (
    id_coaxiales INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_componentes INTEGER NOT NULL,
    atenuacion_470mhz DOUBLE NOT NULL,
    atenuacion_694mhz DOUBLE NOT NULL,
    CONSTRAINT fk_coaxiales_componente 
    FOREIGN KEY (id_componentes) 
    REFERENCES componentes(id_componentes)
);

-- Create derivadores table (depends on componentes)
CREATE TABLE derivadores (
    id_derivadores INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_componentes INTEGER NOT NULL,
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
    id_distribuidores INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_componentes INTEGER NOT NULL,
    numero_salidas INTEGER NOT NULL,
    atenuacion_distribucion DOUBLE NOT NULL,
    desacoplo DOUBLE NOT NULL,
    perdidas_retorno DOUBLE NOT NULL,
    CONSTRAINT fk_distribuidores_componente 
    FOREIGN KEY (id_componentes) 
    REFERENCES componentes(id_componentes)
);

-- Create tomas table (depends on componentes)
CREATE TABLE tomas (
    id_tomas INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_componentes INTEGER NOT NULL,
    atenuacion DOUBLE NOT NULL,
    desacoplo DOUBLE NOT NULL,
    CONSTRAINT fk_tomas_componente 
    FOREIGN KEY (id_componentes) 
    REFERENCES componentes(id_componentes)
);

-- Create simulaciones table (depends on configuraciones)
CREATE TABLE simulaciones (
    id_simulaciones INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_configuraciones INTEGER NOT NULL,
    frecuencia INTEGER NOT NULL,
    tipo_senal VARCHAR(50) NOT NULL,
    costo_total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    fecha_simulacion TIMESTAMP NOT NULL,
    CONSTRAINT fk_simulaciones_configuraciones 
    FOREIGN KEY (id_configuraciones) 
    REFERENCES configuraciones(id_configuraciones)
);

-- Create resultados_simulacion table (depends on simulaciones)
CREATE TABLE resultados_simulacion (
    id_resultados_simulacion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_simulaciones INTEGER NOT NULL,
    piso INTEGER NOT NULL,
    nivel_senal DOUBLE NOT NULL,
    costo_piso DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) NOT NULL,
    CONSTRAINT fk_resultados_simulaciones 
    FOREIGN KEY (id_simulaciones) 
    REFERENCES simulaciones(id_simulaciones)
);

-- Create esquematicos table (depends on simulaciones and componentes)
CREATE TABLE esquematicos (
    id_esquematicos INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_simulaciones INTEGER NOT NULL,
    piso INTEGER NOT NULL,
    tipo_componente VARCHAR(20) NOT NULL,
    modelo_componente VARCHAR(100) NOT NULL,
    posicion_x INTEGER NOT NULL,
    posicion_y INTEGER NOT NULL,
    cable_tipo VARCHAR(100),
    CONSTRAINT fk_esquematicos_simulaciones 
    FOREIGN KEY (id_simulaciones) 
    REFERENCES simulaciones(id_simulaciones),
    CONSTRAINT fk_esquematicos_componentes
    FOREIGN KEY (modelo_componente)
    REFERENCES componentes(modelo)
);

-- Create all indexes
CREATE INDEX idx_componentes_tipo ON componentes(id_tipos_componente);
CREATE INDEX idx_coaxiales_componente ON coaxiales(id_componentes);
CREATE INDEX idx_derivadores_componente ON derivadores(id_componentes);
CREATE INDEX idx_distribuidores_componente ON distribuidores(id_componentes);
CREATE INDEX idx_tomas_componente ON tomas(id_componentes);
CREATE INDEX idx_simulaciones_config ON simulaciones(id_configuraciones);
CREATE INDEX idx_esquematicos_simulacion ON esquematicos(id_simulaciones);
CREATE INDEX idx_esquematicos_piso ON esquematicos(piso);
CREATE INDEX idx_resultados_simulacion ON resultados_simulacion(id_simulaciones);
CREATE INDEX idx_resultados_piso ON resultados_simulacion(piso);