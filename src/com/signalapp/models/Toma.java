package com.signalapp.models;

public class Toma {
    private int idToma;
    private int idComponente;
    private int atenuacion;

    public Toma() {}

    public Toma(int idToma, int idComponente, int atenuacion) {
        this.idToma = idToma;
        this.idComponente = idComponente;
        this.atenuacion = atenuacion;
    }

    // Getters and Setters
    public int getIdToma() { return idToma; }
    public void setIdToma(int idToma) { this.idToma = idToma; }
    
    public int getIdComponente() { return idComponente; }
    public void setIdComponente(int idComponente) { this.idComponente = idComponente; }
    
    public int getAtenuacion() { return atenuacion; }
    public void setAtenuacion(int atenuacion) { this.atenuacion = atenuacion; }
} 