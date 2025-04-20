-- 1. Insert into tipos_componente
INSERT INTO tipos_componente (nombre, descripcion) VALUES 
('Cable Coaxial', 'Cables para conexión de componentes');
INSERT INTO tipos_componente (nombre, descripcion) VALUES 
('Base de Toma', 'Dispositivos para derivar señal a diferentes pisos');
INSERT INTO tipos_componente (nombre, descripcion) VALUES 
('Derivador', 'Dispositivos para distribuir señal a múltiples salidas');
INSERT INTO tipos_componente (nombre, descripcion) VALUES 
('Distribuidor', 'Tomas de acceso para conexión final');

-- 2. Insert into componentes
-- Note: id_tipo_componente references tipos_componente: 1=cable, 2=toma, 3=derivador, 4=distribuidor
-- Cables
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(1, 'CE-752', 1.95);
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(1, 'CE-740', 1.90);
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(1, 'CE-170', 1.70);
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(1, 'FI-250', 1.80);
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(1, 'CL-200', 1.65);

-- Tomas
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(2, 'BS-100', 5.25);
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(2, 'BS-112', 5.50);
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(2, 'BS-110', 5.40);
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(2, 'BS-111', 5.35);
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(2, 'BS-210', 6.25);
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(2, 'BS-510', 7.15);

-- Derivadores
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(3, 'FP-414', 9.25);
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(3, 'FP-420', 9.75);
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(3, 'FP-426', 10.25);

-- Distribuidores
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(4, 'FI-243', 7.50);
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(4, 'FI-473', 11.25);
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(4, 'FI-253', 7.75);
INSERT INTO componentes (id_tipos_componente, modelo, costo) VALUES
(4, 'FI-483', 11.50);

-- 3. Insert into coaxiales
-- Note: id_componente references componentes table entries with id_tipo_componente=1
INSERT INTO coaxiales (id_componentes, atenuacion_470mhz, atenuacion_694mhz) VALUES
(1, 12.30, 15.57);
INSERT INTO coaxiales (id_componentes, atenuacion_470mhz, atenuacion_694mhz) VALUES
(2, 12.30, 15.57);
INSERT INTO coaxiales (id_componentes, atenuacion_470mhz, atenuacion_694mhz) VALUES
(3, 13.30, 16.83);
INSERT INTO coaxiales (id_componentes, atenuacion_470mhz, atenuacion_694mhz) VALUES
(4, 12.20, 15.41);
INSERT INTO coaxiales (id_componentes, atenuacion_470mhz, atenuacion_694mhz) VALUES
(5, 9.00, 11.38);

-- 4. Insert into derivadores
-- Note: id_componente references componentes table entries with id_tipo_componente=3
INSERT INTO derivadores (id_componentes, atenuacion_derivacion, atenuacion_paso, directividad, desacoplo, perdidas_retorno) VALUES
(12, 14.0, 4.5, 13.0, 16.0, 12.0);  -- FP-414
INSERT INTO derivadores (id_componentes, atenuacion_derivacion, atenuacion_paso, directividad, desacoplo, perdidas_retorno) VALUES
(13, 20.0, 1.2, 18.0, 18.0, 17.0);  -- FP-420
INSERT INTO derivadores (id_componentes, atenuacion_derivacion, atenuacion_paso, directividad, desacoplo, perdidas_retorno) VALUES
(14, 26.0, 0.8, 18.0, 20.0, 17.0);  -- FP-426

-- 5. Insert into distribuidores
-- Note: id_componente references componentes table entries with id_tipo_componente=4
INSERT INTO distribuidores (id_componentes, numero_salidas, atenuacion_distribucion, desacoplo, perdidas_retorno) VALUES
(15, 2, 4.0, 19.0, 16.0);  -- FI-243
INSERT INTO distribuidores (id_componentes, numero_salidas, atenuacion_distribucion, desacoplo, perdidas_retorno) VALUES
(16, 4, 9.0, 16.0, 12.0);  -- FI-473
INSERT INTO distribuidores (id_componentes, numero_salidas, atenuacion_distribucion, desacoplo, perdidas_retorno) VALUES
(17, 2, 4.25, 13.0, 15.0);  -- FI-253
INSERT INTO distribuidores (id_componentes, numero_salidas, atenuacion_distribucion, desacoplo, perdidas_retorno) VALUES
(18, 4, 8.75, 12.0, 11.0);  -- FI-483

-- 6. Insert into tomas
-- Note: id_componente references componentes table entries with id_tipo_componente=2
INSERT INTO tomas (id_componentes, atenuacion, desacoplo) VALUES
(6, 1.0, 14.0);  -- BS-100
INSERT INTO tomas (id_componentes, atenuacion, desacoplo) VALUES
(7, 1.0, 14.0);  -- BS-112
INSERT INTO tomas (id_componentes, atenuacion, desacoplo) VALUES
(8, 4.0, 20.0);  -- BS-110
INSERT INTO tomas (id_componentes, atenuacion, desacoplo) VALUES
(9, 4.0, 10.0);  -- BS-111
INSERT INTO tomas (id_componentes, atenuacion, desacoplo) VALUES
(10, 10.0, 30.0); -- BS-210
INSERT INTO tomas (id_componentes, atenuacion, desacoplo) VALUES
(11, 14.5, 13.0); -- BS-510

-- 7. Insert into margenes_calidad
INSERT INTO margenes_calidad (tipo_senal, nivel_minimo, nivel_maximo) VALUES
('TDT', 45.0, 70.0);

-- 8. Insert into configuraciones
INSERT INTO configuraciones (nombre, nivel_cabecera, num_pisos, costo_total, fecha_creacion, usuario_creacion) VALUES
('Edificio A', 95.0, 5, 580.25, Now(), 'admin');
INSERT INTO configuraciones (nombre, nivel_cabecera, num_pisos, costo_total, fecha_creacion, usuario_creacion) VALUES
('Edificio B', 98.0, 8, 920.50, Now(), 'admin');