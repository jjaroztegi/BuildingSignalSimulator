package com.signalapp.models;

public class Simulacion {
    private int id_simulaciones;
    private int id_configuraciones;
    private int frecuencia;
    private String tipo_senal;
    private double costo_total;
    private String estado;
    private String fecha_simulacion;
    private String nombre_edificio;
    private double nivel_cabecera;
    private int num_pisos;

    public Simulacion() {
    }

    public Simulacion(int id_simulaciones, int id_configuraciones, int frecuencia, String tipo_senal,
            double costo_total, String estado, String fecha_simulacion) {
        this.id_simulaciones = id_simulaciones;
        this.id_configuraciones = id_configuraciones;
        this.frecuencia = frecuencia;
        this.tipo_senal = tipo_senal;
        this.costo_total = costo_total;
        this.estado = estado;
        this.fecha_simulacion = fecha_simulacion;
    }

    // Getters and Setters
    public int getId_simulaciones() {
        return id_simulaciones;
    }

    public void setId_simulaciones(int id_simulaciones) {
        this.id_simulaciones = id_simulaciones;
    }

    public int getId_configuraciones() {
        return id_configuraciones;
    }

    public void setId_configuraciones(int id_configuraciones) {
        this.id_configuraciones = id_configuraciones;
    }

    public int getFrecuencia() {
        return frecuencia;
    }

    public void setFrecuencia(int frecuencia) {
        this.frecuencia = frecuencia;
    }

    public String getTipo_senal() {
        return tipo_senal;
    }

    public void setTipo_senal(String tipo_senal) {
        this.tipo_senal = tipo_senal;
    }

    public double getCosto_total() {
        return costo_total;
    }

    public void setCosto_total(double costo_total) {
        this.costo_total = costo_total;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getFecha_simulacion() {
        return fecha_simulacion;
    }

    public void setFecha_simulacion(String fecha_simulacion) {
        this.fecha_simulacion = fecha_simulacion;
    }

    public String getNombre_edificio() {
        return nombre_edificio;
    }

    public void setNombre_edificio(String nombre_edificio) {
        this.nombre_edificio = nombre_edificio;
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
}