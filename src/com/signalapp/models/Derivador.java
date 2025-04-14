package com.signalapp.models;

public class Derivador {
    private int idDerivador;
    private int idComponente;
    private double atenuacionInsercion;
    private double atenuacionDerivacion;
    private int numSalidas;
    private double directividad;
    private double desacoplo;

    public Derivador() {}

    public Derivador(int idDerivador, int idComponente, double atenuacionInsercion, 
                    double atenuacionDerivacion, int numSalidas, double directividad, 
                    double desacoplo) {
        this.idDerivador = idDerivador;
        this.idComponente = idComponente;
        this.atenuacionInsercion = atenuacionInsercion;
        this.atenuacionDerivacion = atenuacionDerivacion;
        this.numSalidas = numSalidas;
        this.directividad = directividad;
        this.desacoplo = desacoplo;
    }

    // Getters and Setters
    public int getIdDerivador() { return idDerivador; }
    public void setIdDerivador(int idDerivador) { this.idDerivador = idDerivador; }
    
    public int getIdComponente() { return idComponente; }
    public void setIdComponente(int idComponente) { this.idComponente = idComponente; }
    
    public double getAtenuacionInsercion() { return atenuacionInsercion; }
    public void setAtenuacionInsercion(double atenuacionInsercion) { this.atenuacionInsercion = atenuacionInsercion; }
    
    public double getAtenuacionDerivacion() { return atenuacionDerivacion; }
    public void setAtenuacionDerivacion(double atenuacionDerivacion) { this.atenuacionDerivacion = atenuacionDerivacion; }
    
    public int getNumSalidas() { return numSalidas; }
    public void setNumSalidas(int numSalidas) { this.numSalidas = numSalidas; }
    
    public double getDirectividad() { return directividad; }
    public void setDirectividad(double directividad) { this.directividad = directividad; }
    
    public double getDesacoplo() { return desacoplo; }
    public void setDesacoplo(double desacoplo) { this.desacoplo = desacoplo; }
} 