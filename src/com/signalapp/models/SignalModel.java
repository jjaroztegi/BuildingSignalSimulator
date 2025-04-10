package com.signalapp.models;

public class SignalModel {
    private int piso;
    private double nivelFinal;

    public SignalModel(int piso, double nivelFinal) {
        this.piso = piso;
        this.nivelFinal = nivelFinal;
    }

    public int getPiso() {
        return piso;
    }

    public void setPiso(int piso) {
        this.piso = piso;
    }

    public double getNivelFinal() {
        return nivelFinal;
    }

    public void setNivelFinal(double nivelFinal) {
        this.nivelFinal = nivelFinal;
    }
}