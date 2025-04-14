package com.signalapp.models;

public class Derivador {
    private int id_derivadores;
    private int id_componentes;
    private double atenuacion_insercion;
    private double atenuacion_derivacion;
    private int num_salidas;
    private double directividad;
    private double desacoplo;

    public Derivador() {}

    public Derivador(int id_derivadores, int id_componentes, double atenuacion_insercion, 
                    double atenuacion_derivacion, int num_salidas, double directividad, 
                    double desacoplo) {
        this.id_derivadores = id_derivadores;
        this.id_componentes = id_componentes;
        this.atenuacion_insercion = atenuacion_insercion;
        this.atenuacion_derivacion = atenuacion_derivacion;
        this.num_salidas = num_salidas;
        this.directividad = directividad;
        this.desacoplo = desacoplo;
    }

    // Getters and Setters
    public int getId_derivadores() { return id_derivadores; }
    public void setId_derivadores(int id_derivadores) { this.id_derivadores = id_derivadores; }
    
    public int getId_componentes() { return id_componentes; }
    public void setId_componentes(int id_componentes) { this.id_componentes = id_componentes; }
    
    public double getAtenuacion_insercion() { return atenuacion_insercion; }
    public void setAtenuacion_insercion(double atenuacion_insercion) { this.atenuacion_insercion = atenuacion_insercion; }
    
    public double getAtenuacion_derivacion() { return atenuacion_derivacion; }
    public void setAtenuacion_derivacion(double atenuacion_derivacion) { this.atenuacion_derivacion = atenuacion_derivacion; }
    
    public int getNum_salidas() { return num_salidas; }
    public void setNum_salidas(int num_salidas) { this.num_salidas = num_salidas; }
    
    public double getDirectividad() { return directividad; }
    public void setDirectividad(double directividad) { this.directividad = directividad; }
    
    public double getDesacoplo() { return desacoplo; }
    public void setDesacoplo(double desacoplo) { this.desacoplo = desacoplo; }
} 