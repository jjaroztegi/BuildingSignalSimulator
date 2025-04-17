package com.signalapp.models;

public class Derivador {
    private int id_derivadores;
    private int id_componentes;
    private double atenuacion_derivacion;
    private double atenuacion_paso;
    private double directividad;
    private double desacoplo;
    private double perdidas_retorno;

    public Derivador() {
    }

    public Derivador(int id_derivadores, int id_componentes, double atenuacion_derivacion,
            double atenuacion_paso, double directividad, double desacoplo,
            double perdidas_retorno) {
        this.id_derivadores = id_derivadores;
        this.id_componentes = id_componentes;
        this.atenuacion_derivacion = atenuacion_derivacion;
        this.atenuacion_paso = atenuacion_paso;
        this.directividad = directividad;
        this.desacoplo = desacoplo;
        this.perdidas_retorno = perdidas_retorno;
    }

    // Getters and Setters
    public int getId_derivadores() {
        return id_derivadores;
    }

    public void setId_derivadores(int id_derivadores) {
        this.id_derivadores = id_derivadores;
    }

    public int getId_componentes() {
        return id_componentes;
    }

    public void setId_componentes(int id_componentes) {
        this.id_componentes = id_componentes;
    }

    public double getAtenuacion_derivacion() {
        return atenuacion_derivacion;
    }

    public void setAtenuacion_derivacion(double atenuacion_derivacion) {
        this.atenuacion_derivacion = atenuacion_derivacion;
    }

    public double getAtenuacion_paso() {
        return atenuacion_paso;
    }

    public void setAtenuacion_paso(double atenuacion_paso) {
        this.atenuacion_paso = atenuacion_paso;
    }

    public double getDirectividad() {
        return directividad;
    }

    public void setDirectividad(double directividad) {
        this.directividad = directividad;
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