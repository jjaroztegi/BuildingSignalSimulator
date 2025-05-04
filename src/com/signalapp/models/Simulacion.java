package com.signalapp.models;

/**
 * Represents a specific simulation run performed on a building configuration. Stores parameters
 * used for the simulation (frequency, signal type) and summary results (total cost, status). Also
 * includes fields populated from joining with Configuracion for display purposes. Corresponds to
 * the 'Simulaciones' table.
 */
public class Simulacion {
    private int id_simulaciones; // Primary key
    private int id_configuraciones; // Foreign key referencing Configuraciones table
    private int frecuencia; // Frequency used for the simulation (MHz)
    private String tipo_senal; // Type of signal simulated (e.g., "TV Digital")
    private double costo_total; // Overall total cost calculated for this simulation
    private String estado; // Overall status of the simulation (e.g., "Completa", "Con Errores")
    private String fecha_simulacion; // Timestamp when the simulation was run (consider using
                                     // java.sql.Timestamp)

    // Fields populated by joining with Configuraciones (e.g., in SimulacionDAO.getByConfiguracion)
    private String nombre_edificio; // Name of the building (from Configuracion)
    private double nivel_cabecera; // Headend level (from Configuracion)
    private int num_pisos; // Number of floors (from Configuracion)

    /**
     * Default constructor.
     */
    public Simulacion() {}

    /**
     * Constructor with core fields (excluding joined fields).
     *
     * @param id_simulaciones The primary key ID.
     * @param id_configuraciones The foreign key ID linking to the configuration.
     * @param frecuencia The simulation frequency.
     * @param tipo_senal The type of signal.
     * @param costo_total The calculated total cost.
     * @param estado The overall status.
     * @param fecha_simulacion The simulation timestamp string.
     */
    public Simulacion(int id_simulaciones, int id_configuraciones, int frecuencia,
            String tipo_senal, double costo_total, String estado, String fecha_simulacion) {
        this.id_simulaciones = id_simulaciones;
        this.id_configuraciones = id_configuraciones;
        this.frecuencia = frecuencia;
        this.tipo_senal = tipo_senal;
        this.costo_total = costo_total;
        this.estado = estado;
        this.fecha_simulacion = fecha_simulacion;
        // Joined fields are typically set via setters after retrieval
    }

    // --- Getters and Setters ---

    public int getId_simulaciones() {
        return id_simulaciones;
    }

    public void setId_simulaciones(int id_simulaciones) {
        this.id_simulaciones = id_simulaciones;
    }

    public int getId_configuraciones() {
        return id_configuraciones;
    }

    public void setId_configuraciones(int id_configuraciones) {
        this.id_configuraciones = id_configuraciones;
    }

    public int getFrecuencia() {
        return frecuencia;
    }

    public void setFrecuencia(int frecuencia) {
        this.frecuencia = frecuencia;
    }

    public String getTipo_senal() {
        return tipo_senal;
    }

    public void setTipo_senal(String tipo_senal) {
        this.tipo_senal = tipo_senal;
    }

    public double getCosto_total() {
        return costo_total;
    }

    public void setCosto_total(double costo_total) {
        this.costo_total = costo_total;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getFecha_simulacion() {
        return fecha_simulacion;
    }

    public void setFecha_simulacion(String fecha_simulacion) {
        this.fecha_simulacion = fecha_simulacion;
    }

    // Getters and Setters for joined fields

    public String getNombre_edificio() {
        return nombre_edificio;
    }

    public void setNombre_edificio(String nombre_edificio) {
        this.nombre_edificio = nombre_edificio;
    }

    public double getNivel_cabecera() {
        return nivel_cabecera;
    }

    public void setNivel_cabecera(double nivel_cabecera) {
        this.nivel_cabecera = nivel_cabecera;
    }

    public int getNum_pisos() {
        return num_pisos;
    }

    public void setNum_pisos(int num_pisos) {
        this.num_pisos = num_pisos;
    }

    @Override
    public String toString() {
        return "Simulacion{" + "id_simulaciones=" + id_simulaciones + ", id_configuraciones="
                + id_configuraciones + ", frecuencia=" + frecuencia + ", tipo_senal='" + tipo_senal
                + '\'' + ", costo_total=" + costo_total + ", estado='" + estado + '\''
                + ", fecha_simulacion='" + fecha_simulacion + '\'' + ", nombre_edificio='"
                + nombre_edificio + '\'' + // Include joined fields if available
                ", nivel_cabecera=" + nivel_cabecera + ", num_pisos=" + num_pisos + '}';
    }
}
