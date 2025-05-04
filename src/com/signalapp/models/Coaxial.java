package com.signalapp.models;

/**
 * Represents a Coaxial Cable component type with specific attenuation properties. Corresponds to
 * the 'Coaxiales' table.
 */
public class Coaxial {
    private int id_coaxiales; // Primary key
    private int id_componentes; // Foreign key referencing Componentes table
    private double atenuacion_470mhz; // Attenuation at 470 MHz (dB/100m)
    private double atenuacion_694mhz; // Attenuation at 694 MHz (dB/100m)

    /**
     * Default constructor.
     */
    public Coaxial() {}

    /**
     * Constructor with all fields.
     *
     * @param id_coaxiales The primary key ID.
     * @param id_componentes The foreign key ID linking to the base Componente.
     * @param atenuacion_470mhz Attenuation at 470 MHz.
     * @param atenuacion_694mhz Attenuation at 694 MHz.
     */
    public Coaxial(int id_coaxiales, int id_componentes, double atenuacion_470mhz,
            double atenuacion_694mhz) {
        this.id_coaxiales = id_coaxiales;
        this.id_componentes = id_componentes;
        this.atenuacion_470mhz = atenuacion_470mhz;
        this.atenuacion_694mhz = atenuacion_694mhz;
    }

    // --- Getters and Setters ---

    public int getId_coaxiales() {
        return id_coaxiales;
    }

    public void setId_coaxiales(int id_coaxiales) {
        this.id_coaxiales = id_coaxiales;
    }

    public int getId_componentes() {
        return id_componentes;
    }

    public void setId_componentes(int id_componentes) {
        this.id_componentes = id_componentes;
    }

    public double getAtenuacion_470mhz() {
        return atenuacion_470mhz;
    }

    public void setAtenuacion_470mhz(double atenuacion_470mhz) {
        this.atenuacion_470mhz = atenuacion_470mhz;
    }

    public double getAtenuacion_694mhz() {
        return atenuacion_694mhz;
    }

    public void setAtenuacion_694mhz(double atenuacion_694mhz) {
        this.atenuacion_694mhz = atenuacion_694mhz;
    }

    @Override
    public String toString() {
        return "Coaxial{" + "id_coaxiales=" + id_coaxiales + ", id_componentes=" + id_componentes
                + ", atenuacion_470mhz=" + atenuacion_470mhz + ", atenuacion_694mhz="
                + atenuacion_694mhz + '}';
    }
}
