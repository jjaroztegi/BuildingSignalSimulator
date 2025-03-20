-- 1. Insert into TiposComponente
INSERT INTO TiposComponente (nombre, descripcion) VALUES 
('cable', 'Cables para conexión de componentes');
INSERT INTO TiposComponente (nombre, descripcion) VALUES 
('derivador', 'Dispositivos para derivar señal a diferentes pisos');
INSERT INTO TiposComponente (nombre, descripcion) VALUES 
('distribuidor', 'Dispositivos para distribuir señal a múltiples salidas');
INSERT INTO TiposComponente (nombre, descripcion) VALUES 
('amplificador', 'Amplificadores de señal para compensar pérdidas');
INSERT INTO TiposComponente (nombre, descripcion) VALUES 
('toma', 'Tomas de acceso para conexión final');

-- 2. Insert into Componentes
-- Note: id_tipo references TiposComponente: 1=cable, 2=derivador, 3=distribuidor, 4=amplificador, 5=toma
-- Cables originales
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(1, 'Cable RG6', 1.50, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(1, 'Cable RG11', 2.25, Now(), 'admin', Now(), 'admin');
-- Cables nuevos
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(1, 'CL-200', 1.65, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(1, 'FI-250', 1.80, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(1, 'CE-170', 1.70, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(1, 'CE-740', 1.90, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(1, 'CE-752', 1.95, Now(), 'admin', Now(), 'admin');
-- Derivadores originales
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(2, 'Derivador 2 salidas', 8.75, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(2, 'Derivador 4 salidas', 12.50, Now(), 'admin', Now(), 'admin');
-- Derivadores nuevos
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(2, 'FP-414', 9.25, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(2, 'FP-420', 9.75, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(2, 'FP-426', 10.25, Now(), 'admin', Now(), 'admin');
-- Distribuidores originales
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(3, 'Distribuidor 2 vías', 7.25, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(3, 'Distribuidor 4 vías', 11.00, Now(), 'admin', Now(), 'admin');
-- Distribuidores nuevos
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(3, 'FI-243', 7.50, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(3, 'FI-473', 11.25, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(3, 'FI-253', 7.75, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(3, 'FI-487', 11.50, Now(), 'admin', Now(), 'admin');
-- Amplificadores originales
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(4, 'Amplificador 20dB', 25.00, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(4, 'Amplificador 30dB', 35.00, Now(), 'admin', Now(), 'admin');
-- Tomas nuevas
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(5, 'BS-100', 5.25, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(5, 'BS-112', 5.50, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(5, 'BS-110', 5.40, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(5, 'BS-111', 5.35, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(5, 'BS-250', 6.25, Now(), 'admin', Now(), 'admin');
INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
(5, 'BS-510', 7.15, Now(), 'admin', Now(), 'admin');

-- 3. Insert into Frecuencias
INSERT INTO Frecuencias (valor, descripcion) VALUES
(50, 'VHF Baja');
INSERT INTO Frecuencias (valor, descripcion) VALUES
(200, 'VHF Alta');
INSERT INTO Frecuencias (valor, descripcion) VALUES
(470, 'UHF Media (DVB-T)');
INSERT INTO Frecuencias (valor, descripcion) VALUES
(500, 'UHF Baja');
INSERT INTO Frecuencias (valor, descripcion) VALUES
(694, 'UHF Alta (LTE)');
INSERT INTO Frecuencias (valor, descripcion) VALUES
(800, 'UHF Muy Alta');

-- 4. Insert into Cables
-- Note: id_componente references Componentes table entries with id_tipo=1
INSERT INTO Cables (id_componente, longitud_maxima) VALUES
(1, 100.00);  -- Cable RG6 with max length 100m
INSERT INTO Cables (id_componente, longitud_maxima) VALUES
(2, 150.00);  -- Cable RG11 with max length 150m
INSERT INTO Cables (id_componente, longitud_maxima) VALUES
(3, 120.00);  -- CL-200 with max length 120m
INSERT INTO Cables (id_componente, longitud_maxima) VALUES
(4, 130.00);  -- FI-250 with max length 130m
INSERT INTO Cables (id_componente, longitud_maxima) VALUES
(5, 110.00);  -- CE-170 with max length 110m
INSERT INTO Cables (id_componente, longitud_maxima) VALUES
(6, 125.00);  -- CE-740 with max length 125m
INSERT INTO Cables (id_componente, longitud_maxima) VALUES
(7, 125.00);  -- CE-752 with max length 125m

-- 5. Insert into AtenuacionesCable
-- Note: id_cable references Cables table, id_frecuencia references Frecuencias table
-- Cable 1 (RG6) atenuations at different frequencies
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(1, 1, 4.2);  -- RG6 at 50MHz: 4.2dB/100m
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(1, 2, 8.5);  -- RG6 at 200MHz: 8.5dB/100m
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(1, 3, 13.5); -- RG6 at 470MHz: 13.5dB/100m (estimated)
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(1, 4, 13.8); -- RG6 at 500MHz: 13.8dB/100m
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(1, 5, 16.5); -- RG6 at 694MHz: 16.5dB/100m (estimated)
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(1, 6, 18.2); -- RG6 at 800MHz: 18.2dB/100m

-- Cable 2 (RG11) atenuations at different frequencies
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(2, 1, 2.8);  -- RG11 at 50MHz: 2.8dB/100m
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(2, 2, 5.7);  -- RG11 at 200MHz: 5.7dB/100m
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(2, 3, 8.8);  -- RG11 at 470MHz: 8.8dB/100m (estimated)
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(2, 4, 9.2);  -- RG11 at 500MHz: 9.2dB/100m
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(2, 5, 11.5); -- RG11 at 694MHz: 11.5dB/100m (estimated)
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(2, 6, 12.1); -- RG11 at 800MHz: 12.1dB/100m

-- New cables
-- Cable 3 (CL-200) atenuations
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(3, 3, 9.0);  -- CL-200 at 470MHz: 9dB/100m
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(3, 5, 11.37); -- CL-200 at 694MHz: 11.37dB/100m

-- Cable 4 (FI-250) atenuations
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(4, 3, 12.2); -- FI-250 at 470MHz: 12.2dB/100m
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(4, 5, 15.41); -- FI-250 at 694MHz: 15.41dB/100m

-- Cable 5 (CE-170) atenuations
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(5, 3, 13.3); -- CE-170 at 470MHz: 13.3dB/100m
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(5, 5, 16.83); -- CE-170 at 694MHz: 16.83dB/100m

-- Cable 6 (CE-740) atenuations
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(6, 3, 12.2); -- CE-740 at 470MHz: 12.2dB/100m
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(6, 5, 15.54); -- CE-740 at 694MHz: 15.54dB/100m

-- Cable 7 (CE-752) atenuations
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(7, 3, 12.2); -- CE-752 at 470MHz: 12.2dB/100m
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(7, 5, 15.54); -- CE-752 at 694MHz: 15.54dB/100m

-- 6. Insert into Derivadores
-- Note: id_componente references Componentes table entries with id_tipo=2
INSERT INTO Derivadores (id_componente, atenuacion_insercion, atenuacion_derivacion, num_salidas, directividad, desacoplo) VALUES
(8, 1.2, 12.0, 2, 28.0, 30.0);  -- Derivador 2 salidas
INSERT INTO Derivadores (id_componente, atenuacion_insercion, atenuacion_derivacion, num_salidas, directividad, desacoplo) VALUES
(9, 1.5, 18.0, 4, 30.0, 32.0);  -- Derivador 4 salidas
INSERT INTO Derivadores (id_componente, atenuacion_insercion, atenuacion_derivacion, num_salidas, directividad, desacoplo) VALUES
(10, 4.5, 14.0, 1, 13.0, 16.0); -- FP-414
INSERT INTO Derivadores (id_componente, atenuacion_insercion, atenuacion_derivacion, num_salidas, directividad, desacoplo) VALUES
(11, 1.2, 20.0, 1, 18.0, 18.0); -- FP-420
INSERT INTO Derivadores (id_componente, atenuacion_insercion, atenuacion_derivacion, num_salidas, directividad, desacoplo) VALUES
(12, 0.8, 26.0, 1, 18.0, 20.0); -- FP-426

-- 7. Insert into Distribuidores
-- Note: id_componente references Componentes table entries with id_tipo=3
INSERT INTO Distribuidores (id_componente, num_salidas, atenuacion_distribucion, desacoplo) VALUES
(13, 2, 3.5, 25.0);  -- Distribuidor 2 vías
INSERT INTO Distribuidores (id_componente, num_salidas, atenuacion_distribucion, desacoplo) VALUES
(14, 4, 7.0, 28.0);  -- Distribuidor 4 vías
INSERT INTO Distribuidores (id_componente, num_salidas, atenuacion_distribucion, desacoplo) VALUES
(15, 2, 4.0, 98.0);  -- FI-243
INSERT INTO Distribuidores (id_componente, num_salidas, atenuacion_distribucion, desacoplo) VALUES
(16, 4, 9.0, 16.0);  -- FI-473
INSERT INTO Distribuidores (id_componente, num_salidas, atenuacion_distribucion, desacoplo) VALUES
(17, 2, 4.5, 13.0);  -- FI-253
INSERT INTO Distribuidores (id_componente, num_salidas, atenuacion_distribucion, desacoplo) VALUES
(18, 4, 9.5, 12.0);  -- FI-487

-- 8. Insert into AmplificadoresRuidoBase
-- Note: id_componente references Componentes table entries with id_tipo=4
INSERT INTO AmplificadoresRuidoBase (id_componente, atenuacion, ganancia, figura_ruido) VALUES
(19, 0.5, 20.0, 4.0);  -- Amplificador 20dB
INSERT INTO AmplificadoresRuidoBase (id_componente, atenuacion, ganancia, figura_ruido) VALUES
(20, 0.7, 30.0, 5.0);  -- Amplificador 30dB

-- 9. Insert into Tomas
INSERT INTO Tomas (id_componente, atenuacion, desacoplo) VALUES
(21, 4.0, 14.0);  -- BS-100
INSERT INTO Tomas (id_componente, atenuacion, desacoplo) VALUES
(22, 1.0, 14.0);  -- BS-112
INSERT INTO Tomas (id_componente, atenuacion, desacoplo) VALUES
(23, 4.0, 20.0);  -- BS-110
INSERT INTO Tomas (id_componente, atenuacion, desacoplo) VALUES
(24, 4.0, 10.0);  -- BS-111
INSERT INTO Tomas (id_componente, atenuacion, desacoplo) VALUES
(25, 10.0, 30.0); -- BS-250
INSERT INTO Tomas (id_componente, atenuacion, desacoplo) VALUES
(26, 14.5, 13.0); -- BS-510

-- 10. Insert into MargenesCalidad
INSERT INTO MargenesCalidad (tipo_senal, nivel_minimo, nivel_maximo) VALUES
('TV Digital', 45.0, 70.0);
INSERT INTO MargenesCalidad (tipo_senal, nivel_minimo, nivel_maximo) VALUES
('TV Analógica', 57.0, 80.0);
INSERT INTO MargenesCalidad (tipo_senal, nivel_minimo, nivel_maximo) VALUES
('Radio FM', 50.0, 70.0);

-- 11. Insert into Configuraciones
INSERT INTO Configuraciones (nombre, nivel_cabecera, num_pisos, costo_total, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
('Edificio A', 95.0, 5, 580.25, Now(), 'admin', Now(), 'admin');
INSERT INTO Configuraciones (nombre, nivel_cabecera, num_pisos, costo_total, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
('Edificio B', 98.0, 8, 920.50, Now(), 'admin', Now(), 'admin');

-- 12. Insert into DetalleConfiguracion
-- Note: All foreign keys must reference existing records in their respective tables
-- Edificio A, Piso 1
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(1, 1, 1, 25.0, 1, 1, NULL, 90.5, Now());
-- Edificio A, Piso 2
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(1, 2, 1, 35.0, 1, NULL, NULL, 85.2, Now());
-- Edificio A, Piso 3
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(1, 3, 1, 45.0, NULL, 1, NULL, 82.4, Now());
-- Edificio A, Piso 4
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(1, 4, 1, 55.0, NULL, 1, 1, 85.5, Now());
-- Edificio A, Piso 5
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(1, 5, 1, 65.0, NULL, 1, NULL, 81.2, Now());
-- Edificio B, Piso 1
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(2, 1, 2, 30.0, 2, NULL, NULL, 92.5, Now());
-- Edificio B, Piso 2
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(2, 2, 2, 40.0, 2, NULL, NULL, 88.7, Now());
-- Edificio B, Piso 3
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(2, 3, 2, 50.0, 2, NULL, NULL, 85.1, Now());
-- Edificio B, Piso 4
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(2, 4, 2, 60.0, NULL, 2, 2, 90.2, Now());
-- Edificio B, Piso 5
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES