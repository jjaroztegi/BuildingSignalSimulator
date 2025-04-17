package com.signalapp.models;

public class Componente {
    private int id_componentes;
    private int id_tipos_componente;
    private String modelo;
    private double costo;

    public Componente() {
    }

    public Componente(int id_componentes, int id_tipos_componente, String modelo, double costo) {
        this.id_componentes = id_componentes;
        this.id_tipos_componente = id_tipos_componente;
        this.modelo = modelo;
        this.costo = costo;
    }

    // Getters and Setters
    public int getId_componentes() {
        return id_componentes;
    }

    public void setId_componentes(int id_componentes) {
        this.id_componentes = id_componentes;
    }

    public int getId_tipos_componente() {
        return id_tipos_componente;
    }

    public void setId_tipos_componente(int id_tipos_componente) {
        this.id_tipos_componente = id_tipos_componente;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public double getCosto() {
        return costo;
    }

    public void setCosto(double costo) {
        this.costo = costo;
    }
}