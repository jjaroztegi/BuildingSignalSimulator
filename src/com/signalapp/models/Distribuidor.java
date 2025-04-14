package com.signalapp.models;

public class Distribuidor {
    private int id_distribuidores;
    private int id_componentes;
    private int num_salidas;
    private double atenuacion_distribucion;
    private double desacoplo;

    public Distribuidor() {}

    public Distribuidor(int id_distribuidores, int id_componentes, int num_salidas, 
                       double atenuacion_distribucion, double desacoplo) {
        this.id_distribuidores = id_distribuidores;
        this.id_componentes = id_componentes;
        this.num_salidas = num_salidas;
        this.atenuacion_distribucion = atenuacion_distribucion;
        this.desacoplo = desacoplo;
    }

    // Getters and Setters
    public int getId_distribuidores() { return id_distribuidores; }
    public void setId_distribuidores(int id_distribuidores) { this.id_distribuidores = id_distribuidores; }
    
    public int getId_componentes() { return id_componentes; }
    public void setId_componentes(int id_componentes) { this.id_componentes = id_componentes; }
    
    public int getNum_salidas() { return num_salidas; }
    public void setNum_salidas(int num_salidas) { this.num_salidas = num_salidas; }
    
    public double getAtenuacion_distribucion() { return atenuacion_distribucion; }
    public void setAtenuacion_distribucion(double atenuacion_distribucion) { this.atenuacion_distribucion = atenuacion_distribucion; }
    
    public double getDesacoplo() { return desacoplo; }
    public void setDesacoplo(double desacoplo) { this.desacoplo = desacoplo; }
} 