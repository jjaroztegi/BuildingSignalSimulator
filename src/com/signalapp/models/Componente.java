package com.signalapp.models;

public class Componente {
    private int id_componentes;
    private int id_tiposcomponente;
    private String modelo;
    private double costo;
    private String fecha_creacion;
    private String usuario_creacion;
    private String fecha_modificacion;
    private String usuario_modificacion;

    public Componente() {}

    public Componente(int id_componentes, int id_tiposcomponente, String modelo, double costo, 
                     String fecha_creacion, String usuario_creacion, 
                     String fecha_modificacion, String usuario_modificacion) {
        this.id_componentes = id_componentes;
        this.id_tiposcomponente = id_tiposcomponente;
        this.modelo = modelo;
        this.costo = costo;
        this.fecha_creacion = fecha_creacion;
        this.usuario_creacion = usuario_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.usuario_modificacion = usuario_modificacion;
    }

    // Getters and Setters
    public int getId_componentes() { return id_componentes; }
    public void setId_componentes(int id_componentes) { this.id_componentes = id_componentes; }
    
    public int getId_tiposcomponente() { return id_tiposcomponente; }
    public void setId_tiposcomponente(int id_tiposcomponente) { this.id_tiposcomponente = id_tiposcomponente; }
    
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }
    
    public double getCosto() { return costo; }
    public void setCosto(double costo) { this.costo = costo; }
    
    public String getFecha_creacion() { return fecha_creacion; }
    public void setFecha_creacion(String fecha_creacion) { this.fecha_creacion = fecha_creacion; }
    
    public String getUsuario_creacion() { return usuario_creacion; }
    public void setUsuario_creacion(String usuario_creacion) { this.usuario_creacion = usuario_creacion; }
    
    public String getFecha_modificacion() { return fecha_modificacion; }
    public void setFecha_modificacion(String fecha_modificacion) { this.fecha_modificacion = fecha_modificacion; }
    
    public String getUsuario_modificacion() { return usuario_modificacion; }
    public void setUsuario_modificacion(String usuario_modificacion) { this.usuario_modificacion = usuario_modificacion; }
} 