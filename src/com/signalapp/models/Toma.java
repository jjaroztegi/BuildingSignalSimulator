package com.signalapp.models;

public class Toma {
    private int id_tomas;
    private int id_componentes;
    private double atenuacion;

    public Toma() {}

    public Toma(int id_tomas, int id_componentes, double atenuacion) {
        this.id_tomas = id_tomas;
        this.id_componentes = id_componentes;
        this.atenuacion = atenuacion;
    }

    // Getters and Setters
    public int getId_tomas() { return id_tomas; }
    public void setId_tomas(int id_tomas) { this.id_tomas = id_tomas; }
    
    public int getId_componentes() { return id_componentes; }
    public void setId_componentes(int id_componentes) { this.id_componentes = id_componentes; }
    
    public double getAtenuacion() { return atenuacion; }
    public void setAtenuacion(double atenuacion) { this.atenuacion = atenuacion; }
} 