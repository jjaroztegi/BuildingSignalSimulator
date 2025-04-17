package com.signalapp.models;

public class Distribuidor {
    private int id_distribuidores;
    private int id_componentes;
    private int numero_salidas;
    private double atenuacion_distribucion;
    private double desacoplo;
    private double perdidas_retorno;

    public Distribuidor() {
    }

    public Distribuidor(int id_distribuidores, int id_componentes, int numero_salidas,
            double atenuacion_distribucion, double desacoplo, double perdidas_retorno) {
        this.id_distribuidores = id_distribuidores;
        this.id_componentes = id_componentes;
        this.numero_salidas = numero_salidas;
        this.atenuacion_distribucion = atenuacion_distribucion;
        this.desacoplo = desacoplo;
        this.perdidas_retorno = perdidas_retorno;
    }

    // Getters and Setters
    public int getId_distribuidores() {
        return id_distribuidores;
    }

    public void setId_distribuidores(int id_distribuidores) {
        this.id_distribuidores = id_distribuidores;
    }

    public int getId_componentes() {
        return id_componentes;
    }

    public void setId_componentes(int id_componentes) {
        this.id_componentes = id_componentes;
    }

    public int getNumero_salidas() {
        return numero_salidas;
    }

    public void setNumero_salidas(int numero_salidas) {
        this.numero_salidas = numero_salidas;
    }

    public double getAtenuacion_distribucion() {
        return atenuacion_distribucion;
    }

    public void setAtenuacion_distribucion(double atenuacion_distribucion) {
        this.atenuacion_distribucion = atenuacion_distribucion;
    }

    public double getDesacoplo() {
        return desacoplo;
    }

    public void setDesacoplo(double desacoplo) {
        this.desacoplo = desacoplo;
    }

    public double getPerdidas_retorno() {
        return perdidas_retorno;
    }

    public void setPerdidas_retorno(double perdidas_retorno) {
        this.perdidas_retorno = perdidas_retorno;
    }
}