package com.signalapp.models;

public class Esquematico {
    private int id_esquematicos;
    private int id_simulaciones;
    private int piso;
    private String tipo_componente;
    private String modelo_componente;
    private int posicion_x;
    private int posicion_y;
    private String cable_tipo;

    public Esquematico() {
    }

    public Esquematico(int id_esquematicos, int id_simulaciones, int piso, String tipo_componente,
            String modelo_componente, int posicion_x, int posicion_y, String cable_tipo) {
        this.id_esquematicos = id_esquematicos;
        this.id_simulaciones = id_simulaciones;
        this.piso = piso;
        this.tipo_componente = tipo_componente;
        this.modelo_componente = modelo_componente;
        this.posicion_x = posicion_x;
        this.posicion_y = posicion_y;
        this.cable_tipo = cable_tipo;
    }

    // Getters and Setters
    public int getId_esquematicos() {
        return id_esquematicos;
    }

    public void setId_esquematicos(int id_esquematicos) {
        this.id_esquematicos = id_esquematicos;
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

    public String getTipo_componente() {
        return tipo_componente;
    }

    public void setTipo_componente(String tipo_componente) {
        this.tipo_componente = tipo_componente;
    }

    public String getModelo_componente() {
        return modelo_componente;
    }

    public void setModelo_componente(String modelo_componente) {
        this.modelo_componente = modelo_componente;
    }

    public int getPosicion_x() {
        return posicion_x;
    }

    public void setPosicion_x(int posicion_x) {
        this.posicion_x = posicion_x;
    }

    public int getPosicion_y() {
        return posicion_y;
    }

    public void setPosicion_y(int posicion_y) {
        this.posicion_y = posicion_y;
    }

    public String getCable_tipo() {
        return cable_tipo;
    }

    public void setCable_tipo(String cable_tipo) {
        this.cable_tipo = cable_tipo;
    }
}