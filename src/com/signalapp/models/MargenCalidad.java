package com.signalapp.models;

public class MargenCalidad {
    private int id_margenescalidad;
    private String tipo_senal;
    private double nivel_minimo;
    private double nivel_maximo;

    public MargenCalidad() {}

    public MargenCalidad(int id_margenescalidad, String tipo_senal, double nivel_minimo, double nivel_maximo) {
        this.id_margenescalidad = id_margenescalidad;
        this.tipo_senal = tipo_senal;
        this.nivel_minimo = nivel_minimo;
        this.nivel_maximo = nivel_maximo;
    }

    // Getters and Setters
    public int getId_margenescalidad() { return id_margenescalidad; }
    public void setId_margenescalidad(int id_margenescalidad) { this.id_margenescalidad = id_margenescalidad; }
    
    public String getTipo_senal() { return tipo_senal; }
    public void setTipo_senal(String tipo_senal) { this.tipo_senal = tipo_senal; }
    
    public double getNivel_minimo() { return nivel_minimo; }
    public void setNivel_minimo(double nivel_minimo) { this.nivel_minimo = nivel_minimo; }
    
    public double getNivel_maximo() { return nivel_maximo; }
    public void setNivel_maximo(double nivel_maximo) { this.nivel_maximo = nivel_maximo; }
} 