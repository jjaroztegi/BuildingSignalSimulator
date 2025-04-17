package com.signalapp.models;

public class Coaxial {
    private int id_coaxiales;
    private int id_componentes;
    private double atenuacion_470mhz;
    private double atenuacion_694mhz;

    public Coaxial() {
    }

    public Coaxial(int id_coaxiales, int id_componentes, double atenuacion_470mhz, double atenuacion_694mhz) {
        this.id_coaxiales = id_coaxiales;
        this.id_componentes = id_componentes;
        this.atenuacion_470mhz = atenuacion_470mhz;
        this.atenuacion_694mhz = atenuacion_694mhz;
    }

    // Getters and Setters
    public int getId_coaxiales() {
        return id_coaxiales;
    }

    public void setId_coaxiales(int id_coaxiales) {
        this.id_coaxiales = id_coaxiales;
    }

    public int getId_componentes() {
        return id_componentes;
    }

    public void setId_componentes(int id_componentes) {
        this.id_componentes = id_componentes;
    }

    public double getAtenuacion_470mhz() {
        return atenuacion_470mhz;
    }

    public void setAtenuacion_470mhz(double atenuacion_470mhz) {
        this.atenuacion_470mhz = atenuacion_470mhz;
    }

    public double getAtenuacion_694mhz() {
        return atenuacion_694mhz;
    }

    public void setAtenuacion_694mhz(double atenuacion_694mhz) {
        this.atenuacion_694mhz = atenuacion_694mhz;
    }
}