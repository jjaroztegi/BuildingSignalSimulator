
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(1, 2, 8.5);  INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(1, 3, 13.5); INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(1, 4, 13.8); INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(1, 5, 16.5); INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(1, 6, 18.2); 
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(2, 1, 2.8);  INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(2, 2, 5.7);  INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(2, 3, 8.8);  INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(2, 4, 9.2);  INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(2, 5, 11.5); INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(2, 6, 12.1); 
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(3, 3, 9.0);  INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(3, 5, 11.37); 
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(4, 3, 12.2); INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(4, 5, 15.41); 
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(5, 3, 13.3); INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(5, 5, 16.83); 
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(6, 3, 12.2); INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(6, 5, 15.54); 
INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(7, 3, 12.2); INSERT INTO AtenuacionesCable (id_cable, id_frecuencia, atenuacion_100m) VALUES
(7, 5, 15.54); 
INSERT INTO Derivadores (id_componente, atenuacion_insercion, atenuacion_derivacion, num_salidas, directividad, desacoplo) VALUES
(8, 1.2, 12.0, 2, 28.0, 30.0);  INSERT INTO Derivadores (id_componente, atenuacion_insercion, atenuacion_derivacion, num_salidas, directividad, desacoplo) VALUES
(9, 1.5, 18.0, 4, 30.0, 32.0);  INSERT INTO Derivadores (id_componente, atenuacion_insercion, atenuacion_derivacion, num_salidas, directividad, desacoplo) VALUES
(10, 4.5, 14.0, 1, 13.0, 16.0); INSERT INTO Derivadores (id_componente, atenuacion_insercion, atenuacion_derivacion, num_salidas, directividad, desacoplo) VALUES
(11, 1.2, 20.0, 1, 18.0, 18.0); INSERT INTO Derivadores (id_componente, atenuacion_insercion, atenuacion_derivacion, num_salidas, directividad, desacoplo) VALUES
(12, 0.8, 26.0, 1, 18.0, 20.0); 
INSERT INTO Distribuidores (id_componente, num_salidas, atenuacion_distribucion, desacoplo) VALUES
(13, 2, 3.5, 25.0);  INSERT INTO Distribuidores (id_componente, num_salidas, atenuacion_distribucion, desacoplo) VALUES
(14, 4, 7.0, 28.0);  INSERT INTO Distribuidores (id_componente, num_salidas, atenuacion_distribucion, desacoplo) VALUES
(15, 2, 4.0, 98.0);  INSERT INTO Distribuidores (id_componente, num_salidas, atenuacion_distribucion, desacoplo) VALUES
(16, 4, 9.0, 16.0);  INSERT INTO Distribuidores (id_componente, num_salidas, atenuacion_distribucion, desacoplo) VALUES
(17, 2, 4.5, 13.0);  INSERT INTO Distribuidores (id_componente, num_salidas, atenuacion_distribucion, desacoplo) VALUES
(18, 4, 9.5, 12.0);  
INSERT INTO AmplificadoresRuidoBase (id_componente, atenuacion, ganancia, figura_ruido) VALUES
(19, 0.5, 20.0, 4.0);  INSERT INTO AmplificadoresRuidoBase (id_componente, atenuacion, ganancia, figura_ruido) VALUES
(20, 0.7, 30.0, 5.0);  
INSERT INTO Tomas (id_componente, atenuacion, desacoplo) VALUES
(21, 4.0, 14.0);  INSERT INTO Tomas (id_componente, atenuacion, desacoplo) VALUES
(22, 1.0, 14.0);  INSERT INTO Tomas (id_componente, atenuacion, desacoplo) VALUES
(23, 4.0, 20.0);  INSERT INTO Tomas (id_componente, atenuacion, desacoplo) VALUES
(24, 4.0, 10.0);  INSERT INTO Tomas (id_componente, atenuacion, desacoplo) VALUES
(25, 10.0, 30.0); INSERT INTO Tomas (id_componente, atenuacion, desacoplo) VALUES
(26, 14.5, 13.0); 
INSERT INTO MargenesCalidad (tipo_senal, nivel_minimo, nivel_maximo) VALUES
('TV Digital', 45.0, 70.0);
INSERT INTO MargenesCalidad (tipo_senal, nivel_minimo, nivel_maximo) VALUES
('TV Analógica', 57.0, 80.0);
INSERT INTO MargenesCalidad (tipo_senal, nivel_minimo, nivel_maximo) VALUES
('Radio FM', 50.0, 70.0);

INSERT INTO Configuraciones (nombre, nivel_cabecera, num_pisos, costo_total, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
('Edificio A', 95.0, 5, 580.25, Now(), 'admin', Now(), 'admin');
INSERT INTO Configuraciones (nombre, nivel_cabecera, num_pisos, costo_total, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES
('Edificio B', 98.0, 8, 920.50, Now(), 'admin', Now(), 'admin');

INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(1, 1, 1, 25.0, 1, 1, NULL, 90.5, Now());
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(1, 2, 1, 35.0, 1, NULL, NULL, 85.2, Now());
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(1, 3, 1, 45.0, NULL, 1, NULL, 82.4, Now());
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(1, 4, 1, 55.0, NULL, 1, 1, 85.5, Now());
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(1, 5, 1, 65.0, NULL, 1, NULL, 81.2, Now());
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(2, 1, 2, 30.0, 2, NULL, NULL, 92.5, Now());
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(2, 2, 2, 40.0, 2, NULL, NULL, 88.7, Now());
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(2, 3, 2, 50.0, 2, NULL, NULL, 85.1, Now());
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES
(2, 4, 2, 60.0, NULL, 2, 2, 90.2, Now());
INSERT INTO DetalleConfiguracion (id_configuracion, piso, id_cable, longitud_cable, id_derivador, id_distribuidor, id_amplificador_ruido_base, nivel_senal, fecha_calculo) VALUES