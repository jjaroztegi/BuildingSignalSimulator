package com.signalapp.models;

public class Cable {
    private int idCable;
    private int idComponente;
    private double longitudMaxima;

    public Cable() {}

    public Cable(int idCable, int idComponente, double longitudMaxima) {
        this.idCable = idCable;
        this.idComponente = idComponente;
        this.longitudMaxima = longitudMaxima;
    }

    // Getters and Setters
    public int getIdCable() { return idCable; }
    public void setIdCable(int idCable) { this.idCable = idCable; }
    
    public int getIdComponente() { return idComponente; }
    public void setIdComponente(int idComponente) { this.idComponente = idComponente; }
    
    public double getLongitudMaxima() { return longitudMaxima; }
    public void setLongitudMaxima(double longitudMaxima) { this.longitudMaxima = longitudMaxima; }
} 