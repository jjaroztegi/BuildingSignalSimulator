package com.signalapp.models;

public class Configuracion {
    private int id_configuraciones;
    private String nombre;
    private double nivel_cabecera;
    private int num_pisos;
    private double costo_total;
    private String fecha_creacion;
    private String usuario_creacion;
    private String fecha_modificacion;
    private String usuario_modificacion;

    public Configuracion() {
    }

    public Configuracion(int id_configuraciones, String nombre, double nivel_cabecera, int num_pisos,
            double costo_total, String fecha_creacion, String usuario_creacion,
            String fecha_modificacion, String usuario_modificacion) {
        this.id_configuraciones = id_configuraciones;
        this.nombre = nombre;
        this.nivel_cabecera = nivel_cabecera;
        this.num_pisos = num_pisos;
        this.costo_total = costo_total;
        this.fecha_creacion = fecha_creacion;
        this.usuario_creacion = usuario_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.usuario_modificacion = usuario_modificacion;
    }

    // Getters and Setters
    public int getId_configuraciones() {
        return id_configuraciones;
    }

    public void setId_configuraciones(int id_configuraciones) {
        this.id_configuraciones = id_configuraciones;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public double getNivel_cabecera() {
        return nivel_cabecera;
    }

    public void setNivel_cabecera(double nivel_cabecera) {
        this.nivel_cabecera = nivel_cabecera;
    }

    public int getNum_pisos() {
        return num_pisos;
    }

    public void setNum_pisos(int num_pisos) {
        this.num_pisos = num_pisos;
    }

    public double getCosto_total() {
        return costo_total;
    }

    public void setCosto_total(double costo_total) {
        this.costo_total = costo_total;
    }

    public String getFecha_creacion() {
        return fecha_creacion;
    }

    public void setFecha_creacion(String fecha_creacion) {
        this.fecha_creacion = fecha_creacion;
    }

    public String getUsuario_creacion() {
        return usuario_creacion;
    }

    public void setUsuario_creacion(String usuario_creacion) {
        this.usuario_creacion = usuario_creacion;
    }

    public String getFecha_modificacion() {
        return fecha_modificacion;
    }

    public void setFecha_modificacion(String fecha_modificacion) {
        this.fecha_modificacion = fecha_modificacion;
    }

    public String getUsuario_modificacion() {
        return usuario_modificacion;
    }

    public void setUsuario_modificacion(String usuario_modificacion) {
        this.usuario_modificacion = usuario_modificacion;
    }
}