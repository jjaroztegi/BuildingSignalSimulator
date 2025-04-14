package com.signalapp.models;

public class AmplificadorRuidoBase {
    private int id_amplificadoresruidobase;
    private int id_componentes;
    private double atenuacion;
    private double ganancia;
    private double figura_ruido;

    public AmplificadorRuidoBase() {}

    public AmplificadorRuidoBase(int id_amplificadoresruidobase, int id_componentes, 
                                double atenuacion, double ganancia, double figura_ruido) {
        this.id_amplificadoresruidobase = id_amplificadoresruidobase;
        this.id_componentes = id_componentes;
        this.atenuacion = atenuacion;
        this.ganancia = ganancia;
        this.figura_ruido = figura_ruido;
    }

    // Getters and Setters
    public int getId_amplificadoresruidobase() { return id_amplificadoresruidobase; }
    public void setId_amplificadoresruidobase(int id_amplificadoresruidobase) { this.id_amplificadoresruidobase = id_amplificadoresruidobase; }
    
    public int getId_componentes() { return id_componentes; }
    public void setId_componentes(int id_componentes) { this.id_componentes = id_componentes; }
    
    public double getAtenuacion() { return atenuacion; }
    public void setAtenuacion(double atenuacion) { this.atenuacion = atenuacion; }
    
    public double getGanancia() { return ganancia; }
    public void setGanancia(double ganancia) { this.ganancia = ganancia; }
    
    public double getFigura_ruido() { return figura_ruido; }
    public void setFigura_ruido(double figura_ruido) { this.figura_ruido = figura_ruido; }
} 