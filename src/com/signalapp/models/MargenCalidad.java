package com.signalapp.models;

public class MargenCalidad {
    private int idMargen;
    private String tipoSenal;
    private double nivelMinimo;
    private double nivelMaximo;

    public MargenCalidad() {}

    public MargenCalidad(int idMargen, String tipoSenal, double nivelMinimo, double nivelMaximo) {
        this.idMargen = idMargen;
        this.tipoSenal = tipoSenal;
        this.nivelMinimo = nivelMinimo;
        this.nivelMaximo = nivelMaximo;
    }

    // Getters and Setters
    public int getIdMargen() { return idMargen; }
    public void setIdMargen(int idMargen) { this.idMargen = idMargen; }
    
    public String getTipoSenal() { return tipoSenal; }
    public void setTipoSenal(String tipoSenal) { this.tipoSenal = tipoSenal; }
    
    public double getNivelMinimo() { return nivelMinimo; }
    public void setNivelMinimo(double nivelMinimo) { this.nivelMinimo = nivelMinimo; }
    
    public double getNivelMaximo() { return nivelMaximo; }
    public void setNivelMaximo(double nivelMaximo) { this.nivelMaximo = nivelMaximo; }
} 