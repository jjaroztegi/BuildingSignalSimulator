package com.signalapp.models;

/**
 * Represents a generic electronic component used in the signal distribution system. This is the
 * base entity for specific component types like Coaxial, Derivador, etc. Corresponds to the
 * 'Componentes' table.
 */
public class Componente {
    private int id_componentes; // Primary key
    private int id_tipos_componente; // Foreign key referencing TiposComponente table
    private String modelo; // Model name/identifier of the component
    private double costo; // Cost of the component

    /**
     * Default constructor.
     */
    public Componente() {}

    /**
     * Constructor with all fields.
     *
     * @param id_componentes The primary key ID.
     * @param id_tipos_componente The foreign key ID linking to the component type.
     * @param modelo The model name.
     * @param costo The cost.
     */
    public Componente(int id_componentes, int id_tipos_componente, String modelo, double costo) {
        this.id_componentes = id_componentes;
        this.id_tipos_componente = id_tipos_componente;
        this.modelo = modelo;
        this.costo = costo;
    }

    // --- Getters and Setters ---

    public int getId_componentes() {
        return id_componentes;
    }

    public void setId_componentes(int id_componentes) {
        this.id_componentes = id_componentes;
    }

    public int getId_tipos_componente() {
        return id_tipos_componente;
    }

    public void setId_tipos_componente(int id_tipos_componente) {
        this.id_tipos_componente = id_tipos_componente;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public double getCosto() {
        return costo;
    }

    public void setCosto(double costo) {
        this.costo = costo;
    }

    @Override
    public String toString() {
        return "Componente{" + "id_componentes=" + id_componentes + ", id_tipos_componente="
                + id_tipos_componente + ", modelo='" + modelo + '\'' + ", costo=" + costo + '}';
    }
}
