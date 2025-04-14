package com.signalapp.models;

public class Cable {
    private int id_cables;
    private int id_componentes;
    private double longitud_maxima;

    public Cable() {}

    public Cable(int id_cables, int id_componentes, double longitud_maxima) {
        this.id_cables = id_cables;
        this.id_componentes = id_componentes;
        this.longitud_maxima = longitud_maxima;
    }

    // Getters and Setters
    public int getId_cables() { return id_cables; }
    public void setId_cables(int id_cables) { this.id_cables = id_cables; }
    
    public int getId_componentes() { return id_componentes; }
    public void setId_componentes(int id_componentes) { this.id_componentes = id_componentes; }
    
    public double getLongitud_maxima() { return longitud_maxima; }
    public void setLongitud_maxima(double longitud_maxima) { this.longitud_maxima = longitud_maxima; }
} 