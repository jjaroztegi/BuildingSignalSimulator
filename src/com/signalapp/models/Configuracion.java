package com.signalapp.models;

/**
 * Represents a configuration setup for a building's signal distribution system. Includes details
 * like name, headend signal level, number of floors, and audit trails. Corresponds to the
 * 'Configuraciones' table.
 */
public class Configuracion {
    private int id_configuraciones; // Primary key
    private String nombre; // Name of the configuration (e.g., building name)
    private double nivel_cabecera; // Signal level at the headend (dBµV)
    private int num_pisos; // Number of floors in the building
    private double costo_total; // Total calculated cost (often updated after simulation)
    private String fecha_creacion; // Creation timestamp (consider using java.sql.Timestamp or
                                   // Instant)
    private String usuario_creacion; // User who created the configuration
    private String fecha_modificacion; // Last modification timestamp
    private String usuario_modificacion; // User who last modified the configuration

    /**
     * Default constructor.
     */
    public Configuracion() {}

    /**
     * Constructor with all fields.
     *
     * @param id_configuraciones The primary key ID.
     * @param nombre The configuration name.
     * @param nivel_cabecera The headend signal level.
     * @param num_pisos The number of floors.
     * @param costo_total The total cost.
     * @param fecha_creacion The creation timestamp string.
     * @param usuario_creacion The creating user.
     * @param fecha_modificacion The modification timestamp string.
     * @param usuario_modificacion The modifying user.
     */
    public Configuracion(int id_configuraciones, String nombre, double nivel_cabecera,
            int num_pisos, double costo_total, String fecha_creacion, String usuario_creacion,
            String fecha_modificacion, String usuario_modificacion) {
        this.id_configuraciones = id_configuraciones;
        this.nombre = nombre;
        this.nivel_cabecera = nivel_cabecera;
        this.num_pisos = num_pisos;
        this.costo_total = costo_total;
        this.fecha_creacion = fecha_creacion;
        this.usuario_creacion = usuario_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.usuario_modificacion = usuario_modificacion;
    }

    // --- Getters and Setters ---

    public int getId_configuraciones() {
        return id_configuraciones;
    }

    public void setId_configuraciones(int id_configuraciones) {
        this.id_configuraciones = id_configuraciones;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
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

    public double getCosto_total() {
        return costo_total;
    }

    public void setCosto_total(double costo_total) {
        this.costo_total = costo_total;
    }

    public String getFecha_creacion() {
        return fecha_creacion;
    }

    public void setFecha_creacion(String fecha_creacion) {
        this.fecha_creacion = fecha_creacion;
    }

    public String getUsuario_creacion() {
        return usuario_creacion;
    }

    public void setUsuario_creacion(String usuario_creacion) {
        this.usuario_creacion = usuario_creacion;
    }

    public String getFecha_modificacion() {
        return fecha_modificacion;
    }

    public void setFecha_modificacion(String fecha_modificacion) {
        this.fecha_modificacion = fecha_modificacion;
    }

    public String getUsuario_modificacion() {
        return usuario_modificacion;
    }

    public void setUsuario_modificacion(String usuario_modificacion) {
        this.usuario_modificacion = usuario_modificacion;
    }

    @Override
    public String toString() {
        return "Configuracion{" + "id_configuraciones=" + id_configuraciones + ", nombre='" + nombre
                + '\'' + ", nivel_cabecera=" + nivel_cabecera + ", num_pisos=" + num_pisos
                + ", costo_total=" + costo_total + ", fecha_creacion='" + fecha_creacion + '\''
                + ", usuario_creacion='" + usuario_creacion + '\'' + ", fecha_modificacion='"
                + fecha_modificacion + '\'' + ", usuario_modificacion='" + usuario_modificacion
                + '\'' + '}';
    }
}
