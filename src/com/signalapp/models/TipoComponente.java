package com.signalapp.models;

public class TipoComponente {
    private int idTipoComponente;
    private String nombre;

    public TipoComponente() {
    }

    public TipoComponente(int idTipoComponente, String nombre) {
        this.idTipoComponente = idTipoComponente;
        this.nombre = nombre;
    }

    public int getIdTipoComponente() {
        return idTipoComponente;
    }

    public void setIdTipoComponente(int idTipoComponente) {
        this.idTipoComponente = idTipoComponente;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
} 