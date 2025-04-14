package com.signalapp.models;

public class Componente {
    private int idComponente;
    private int idTipo;
    private String modelo;
    private double costo;
    private String fechaCreacion;
    private String usuarioCreacion;
    private String fechaModificacion;
    private String usuarioModificacion;

    public Componente() {}

    public Componente(int idComponente, int idTipo, String modelo, double costo, 
                     String fechaCreacion, String usuarioCreacion, 
                     String fechaModificacion, String usuarioModificacion) {
        this.idComponente = idComponente;
        this.idTipo = idTipo;
        this.modelo = modelo;
        this.costo = costo;
        this.fechaCreacion = fechaCreacion;
        this.usuarioCreacion = usuarioCreacion;
        this.fechaModificacion = fechaModificacion;
        this.usuarioModificacion = usuarioModificacion;
    }

    // Getters and Setters
    public int getIdComponente() { return idComponente; }
    public void setIdComponente(int idComponente) { this.idComponente = idComponente; }
    
    public int getIdTipo() { return idTipo; }
    public void setIdTipo(int idTipo) { this.idTipo = idTipo; }
    
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }
    
    public double getCosto() { return costo; }
    public void setCosto(double costo) { this.costo = costo; }
    
    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    public String getUsuarioCreacion() { return usuarioCreacion; }
    public void setUsuarioCreacion(String usuarioCreacion) { this.usuarioCreacion = usuarioCreacion; }
    
    public String getFechaModificacion() { return fechaModificacion; }
    public void setFechaModificacion(String fechaModificacion) { this.fechaModificacion = fechaModificacion; }
    
    public String getUsuarioModificacion() { return usuarioModificacion; }
    public void setUsuarioModificacion(String usuarioModificacion) { this.usuarioModificacion = usuarioModificacion; }
} 