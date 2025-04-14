package com.signalapp.models;

public class Configuracion {
    private int idConfiguracion;
    private String nombre;
    private double nivelCabecera;
    private int numPisos;
    private double costoTotal;
    private String fechaCreacion;
    private String usuarioCreacion;
    private String fechaModificacion;
    private String usuarioModificacion;

    public Configuracion() {}

    public Configuracion(int idConfiguracion, String nombre, double nivelCabecera, 
                        int numPisos, double costoTotal, String fechaCreacion, 
                        String usuarioCreacion, String fechaModificacion, 
                        String usuarioModificacion) {
        this.idConfiguracion = idConfiguracion;
        this.nombre = nombre;
        this.nivelCabecera = nivelCabecera;
        this.numPisos = numPisos;
        this.costoTotal = costoTotal;
        this.fechaCreacion = fechaCreacion;
        this.usuarioCreacion = usuarioCreacion;
        this.fechaModificacion = fechaModificacion;
        this.usuarioModificacion = usuarioModificacion;
    }

    // Getters and Setters
    public int getIdConfiguracion() { return idConfiguracion; }
    public void setIdConfiguracion(int idConfiguracion) { this.idConfiguracion = idConfiguracion; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public double getNivelCabecera() { return nivelCabecera; }
    public void setNivelCabecera(double nivelCabecera) { this.nivelCabecera = nivelCabecera; }
    
    public int getNumPisos() { return numPisos; }
    public void setNumPisos(int numPisos) { this.numPisos = numPisos; }
    
    public double getCostoTotal() { return costoTotal; }
    public void setCostoTotal(double costoTotal) { this.costoTotal = costoTotal; }
    
    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    public String getUsuarioCreacion() { return usuarioCreacion; }
    public void setUsuarioCreacion(String usuarioCreacion) { this.usuarioCreacion = usuarioCreacion; }
    
    public String getFechaModificacion() { return fechaModificacion; }
    public void setFechaModificacion(String fechaModificacion) { this.fechaModificacion = fechaModificacion; }
    
    public String getUsuarioModificacion() { return usuarioModificacion; }
    public void setUsuarioModificacion(String usuarioModificacion) { this.usuarioModificacion = usuarioModificacion; }
} 