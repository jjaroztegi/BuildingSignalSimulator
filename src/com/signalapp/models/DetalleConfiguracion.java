package com.signalapp.models;

public class DetalleConfiguracion {
    private int id_detalleconfiguracion;
    private int id_configuraciones;
    private int piso;
    private int id_cables;
    private double longitud_cable;
    private Integer id_derivadores;
    private Integer id_distribuidores;
    private Integer id_amplificadoresruidobase;
    private double nivel_senal;
    private String fecha_calculo;

    public DetalleConfiguracion() {}

    public DetalleConfiguracion(int id_detalleconfiguracion, int id_configuraciones, int piso, 
                               int id_cables, double longitud_cable, Integer id_derivadores, 
                               Integer id_distribuidores, Integer id_amplificadoresruidobase, 
                               double nivel_senal, String fecha_calculo) {
        this.id_detalleconfiguracion = id_detalleconfiguracion;
        this.id_configuraciones = id_configuraciones;
        this.piso = piso;
        this.id_cables = id_cables;
        this.longitud_cable = longitud_cable;
        this.id_derivadores = id_derivadores;
        this.id_distribuidores = id_distribuidores;
        this.id_amplificadoresruidobase = id_amplificadoresruidobase;
        this.nivel_senal = nivel_senal;
        this.fecha_calculo = fecha_calculo;
    }

    // Getters and Setters
    public int getId_detalleconfiguracion() { return id_detalleconfiguracion; }
    public void setId_detalleconfiguracion(int id_detalleconfiguracion) { this.id_detalleconfiguracion = id_detalleconfiguracion; }
    
    public int getId_configuraciones() { return id_configuraciones; }
    public void setId_configuraciones(int id_configuraciones) { this.id_configuraciones = id_configuraciones; }
    
    public int getPiso() { return piso; }
    public void setPiso(int piso) { this.piso = piso; }
    
    public int getId_cables() { return id_cables; }
    public void setId_cables(int id_cables) { this.id_cables = id_cables; }
    
    public double getLongitud_cable() { return longitud_cable; }
    public void setLongitud_cable(double longitud_cable) { this.longitud_cable = longitud_cable; }
    
    public Integer getId_derivadores() { return id_derivadores; }
    public void setId_derivadores(Integer id_derivadores) { this.id_derivadores = id_derivadores; }
    
    public Integer getId_distribuidores() { return id_distribuidores; }
    public void setId_distribuidores(Integer id_distribuidores) { this.id_distribuidores = id_distribuidores; }
    
    public Integer getId_amplificadoresruidobase() { return id_amplificadoresruidobase; }
    public void setId_amplificadoresruidobase(Integer id_amplificadoresruidobase) { this.id_amplificadoresruidobase = id_amplificadoresruidobase; }
    
    public double getNivel_senal() { return nivel_senal; }
    public void setNivel_senal(double nivel_senal) { this.nivel_senal = nivel_senal; }
    
    public String getFecha_calculo() { return fecha_calculo; }
    public void setFecha_calculo(String fecha_calculo) { this.fecha_calculo = fecha_calculo; }
} 