package com.signalapp.models;

public class TipoComponente {
    private int id_tipos_componente;
    private String nombre;
    private String descripcion;

    public TipoComponente() {
    }

    public TipoComponente(int id_tipos_componente, String nombre, String descripcion) {
        this.id_tipos_componente = id_tipos_componente;
        this.nombre = nombre;
        this.descripcion = descripcion;
    }

    public int getId_tipos_componente() {
        return id_tipos_componente;
    }

    public void setId_tipos_componente(int id_tipos_componente) {
        this.id_tipos_componente = id_tipos_componente;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
} 