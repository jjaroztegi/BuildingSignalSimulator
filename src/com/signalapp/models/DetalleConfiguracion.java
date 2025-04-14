package com.signalapp.models;

public class DetalleConfiguracion {
    private int idDetalle;
    private int idConfiguracion;
    private int piso;
    private int idCable;
    private double longitudCable;
    private Integer idDerivador;
    private Integer idDistribuidor;
    private Integer idAmplificadorRuidoBase;
    private double nivelSenal;
    private String fechaCalculo;

    public DetalleConfiguracion() {}

    public DetalleConfiguracion(int idDetalle, int idConfiguracion, int piso, 
                               int idCable, double longitudCable, Integer idDerivador, 
                               Integer idDistribuidor, Integer idAmplificadorRuidoBase, 
                               double nivelSenal, String fechaCalculo) {
        this.idDetalle = idDetalle;
        this.idConfiguracion = idConfiguracion;
        this.piso = piso;
        this.idCable = idCable;
        this.longitudCable = longitudCable;
        this.idDerivador = idDerivador;
        this.idDistribuidor = idDistribuidor;
        this.idAmplificadorRuidoBase = idAmplificadorRuidoBase;
        this.nivelSenal = nivelSenal;
        this.fechaCalculo = fechaCalculo;
    }

    // Getters and Setters
    public int getIdDetalle() { return idDetalle; }
    public void setIdDetalle(int idDetalle) { this.idDetalle = idDetalle; }
    
    public int getIdConfiguracion() { return idConfiguracion; }
    public void setIdConfiguracion(int idConfiguracion) { this.idConfiguracion = idConfiguracion; }
    
    public int getPiso() { return piso; }
    public void setPiso(int piso) { this.piso = piso; }
    
    public int getIdCable() { return idCable; }
    public void setIdCable(int idCable) { this.idCable = idCable; }
    
    public double getLongitudCable() { return longitudCable; }
    public void setLongitudCable(double longitudCable) { this.longitudCable = longitudCable; }
    
    public Integer getIdDerivador() { return idDerivador; }
    public void setIdDerivador(Integer idDerivador) { this.idDerivador = idDerivador; }
    
    public Integer getIdDistribuidor() { return idDistribuidor; }
    public void setIdDistribuidor(Integer idDistribuidor) { this.idDistribuidor = idDistribuidor; }
    
    public Integer getIdAmplificadorRuidoBase() { return idAmplificadorRuidoBase; }
    public void setIdAmplificadorRuidoBase(Integer idAmplificadorRuidoBase) { this.idAmplificadorRuidoBase = idAmplificadorRuidoBase; }
    
    public double getNivelSenal() { return nivelSenal; }
    public void setNivelSenal(double nivelSenal) { this.nivelSenal = nivelSenal; }
    
    public String getFechaCalculo() { return fechaCalculo; }
    public void setFechaCalculo(String fechaCalculo) { this.fechaCalculo = fechaCalculo; }
} 