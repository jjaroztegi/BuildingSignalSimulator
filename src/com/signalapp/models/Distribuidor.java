package com.signalapp.models;

public class Distribuidor {
    private int idDistribuidor;
    private int idComponente;
    private int numSalidas;
    private double atenuacionDistribucion;
    private double desacoplo;

    public Distribuidor() {}

    public Distribuidor(int idDistribuidor, int idComponente, int numSalidas, 
                       double atenuacionDistribucion, double desacoplo) {
        this.idDistribuidor = idDistribuidor;
        this.idComponente = idComponente;
        this.numSalidas = numSalidas;
        this.atenuacionDistribucion = atenuacionDistribucion;
        this.desacoplo = desacoplo;
    }

    // Getters and Setters
    public int getIdDistribuidor() { return idDistribuidor; }
    public void setIdDistribuidor(int idDistribuidor) { this.idDistribuidor = idDistribuidor; }
    
    public int getIdComponente() { return idComponente; }
    public void setIdComponente(int idComponente) { this.idComponente = idComponente; }
    
    public int getNumSalidas() { return numSalidas; }
    public void setNumSalidas(int numSalidas) { this.numSalidas = numSalidas; }
    
    public double getAtenuacionDistribucion() { return atenuacionDistribucion; }
    public void setAtenuacionDistribucion(double atenuacionDistribucion) { this.atenuacionDistribucion = atenuacionDistribucion; }
    
    public double getDesacoplo() { return desacoplo; }
    public void setDesacoplo(double desacoplo) { this.desacoplo = desacoplo; }
} 