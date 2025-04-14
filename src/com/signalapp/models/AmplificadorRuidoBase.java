package com.signalapp.models;

public class AmplificadorRuidoBase {
    private int idAmplificadorRuidoBase;
    private int idComponente;
    private double atenuacion;
    private double ganancia;
    private double figuraRuido;

    public AmplificadorRuidoBase() {}

    public AmplificadorRuidoBase(int idAmplificadorRuidoBase, int idComponente, 
                                double atenuacion, double ganancia, double figuraRuido) {
        this.idAmplificadorRuidoBase = idAmplificadorRuidoBase;
        this.idComponente = idComponente;
        this.atenuacion = atenuacion;
        this.ganancia = ganancia;
        this.figuraRuido = figuraRuido;
    }

    // Getters and Setters
    public int getIdAmplificadorRuidoBase() { return idAmplificadorRuidoBase; }
    public void setIdAmplificadorRuidoBase(int idAmplificadorRuidoBase) { this.idAmplificadorRuidoBase = idAmplificadorRuidoBase; }
    
    public int getIdComponente() { return idComponente; }
    public void setIdComponente(int idComponente) { this.idComponente = idComponente; }
    
    public double getAtenuacion() { return atenuacion; }
    public void setAtenuacion(double atenuacion) { this.atenuacion = atenuacion; }
    
    public double getGanancia() { return ganancia; }
    public void setGanancia(double ganancia) { this.ganancia = ganancia; }
    
    public double getFiguraRuido() { return figuraRuido; }
    public void setFiguraRuido(double figuraRuido) { this.figuraRuido = figuraRuido; }
} 