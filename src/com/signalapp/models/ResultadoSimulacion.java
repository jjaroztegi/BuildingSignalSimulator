package com.signalapp.models;

public class ResultadoSimulacion {
    private int id_resultados_simulacion;
    private int id_simulaciones;
    private int piso;
    private double nivel_senal;
    private double costo_piso;
    private String estado;

    // Getters and Setters
    public int getId_resultados_simulacion() {
        return id_resultados_simulacion;
    }

    public void setId_resultados_simulacion(int id_resultados_simulacion) {
        this.id_resultados_simulacion = id_resultados_simulacion;
    }

    public int getId_simulaciones() {
        return id_simulaciones;
    }

    public void setId_simulaciones(int id_simulaciones) {
        this.id_simulaciones = id_simulaciones;
    }

    public int getPiso() {
        return piso;
    }

    public void setPiso(int piso) {
        this.piso = piso;
    }

    public double getNivel_senal() {
        return nivel_senal;
    }

    public void setNivel_senal(double nivel_senal) {
        this.nivel_senal = nivel_senal;
    }

    public double getCosto_piso() {
        return costo_piso;
    }

    public void setCosto_piso(double costo_piso) {
        this.costo_piso = costo_piso;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    @Override
    public String toString() {
        return "ResultadoSimulacion{" +
                "id_resultados_simulacion=" + id_resultados_simulacion +
                ", id_simulaciones=" + id_simulaciones +
                ", piso=" + piso +
                ", nivel_senal=" + nivel_senal +
                ", costo_piso=" + costo_piso +
                ", estado='" + estado + '\'' +
                '}';
    }
}