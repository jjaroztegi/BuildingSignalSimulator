package com.signalapp.models;

/**
 * Represents a component placed within a specific simulation's schematic diagram. Stores
 * information about the component type, model, location (floor, x/y coordinates), and potentially
 * the type of cable connecting to it. Corresponds to the 'Esquematicos' table.
 */
public class Esquematico {
    private int id_esquematicos; // Primary key
    private int id_simulaciones; // Foreign key referencing Simulaciones table
    private int piso; // Floor number where the component is located
    private String tipo_componente; // Type of the component (e.g., "derivador", "toma")
    private String modelo_componente; // Model name of the component
    private int posicion_x; // X-coordinate in the schematic view
    private int posicion_y; // Y-coordinate in the schematic view
    private String cable_tipo; // Type/model of cable connecting to this component (optional)

    /**
     * Default constructor.
     */
    public Esquematico() {}

    /**
     * Constructor with all fields.
     *
     * @param id_esquematicos The primary key ID.
     * @param id_simulaciones The foreign key ID linking to the simulation.
     * @param piso The floor number.
     * @param tipo_componente The type of the component.
     * @param modelo_componente The model name of the component.
     * @param posicion_x The X-coordinate.
     * @param posicion_y The Y-coordinate.
     * @param cable_tipo The type/model of the connecting cable.
     */
    public Esquematico(int id_esquematicos, int id_simulaciones, int piso, String tipo_componente,
            String modelo_componente, int posicion_x, int posicion_y, String cable_tipo) {
        this.id_esquematicos = id_esquematicos;
        this.id_simulaciones = id_simulaciones;
        this.piso = piso;
        this.tipo_componente = tipo_componente;
        this.modelo_componente = modelo_componente;
        this.posicion_x = posicion_x;
        this.posicion_y = posicion_y;
        this.cable_tipo = cable_tipo;
    }

    // --- Getters and Setters ---

    public int getId_esquematicos() {
        return id_esquematicos;
    }

    public void setId_esquematicos(int id_esquematicos) {
        this.id_esquematicos = id_esquematicos;
    }

    public int getId_simulaciones() {
        return id_simulaciones;
    }

    public void setId_simulaciones(int id_simulaciones) {
        this.id_simulaciones = id_simulaciones;
    }

    public int getPiso() {
        return piso;
    }

    public void setPiso(int piso) {
        this.piso = piso;
    }

    public String getTipo_componente() {
        return tipo_componente;
    }

    public void setTipo_componente(String tipo_componente) {
        this.tipo_componente = tipo_componente;
    }

    public String getModelo_componente() {
        return modelo_componente;
    }

    public void setModelo_componente(String modelo_componente) {
        this.modelo_componente = modelo_componente;
    }

    public int getPosicion_x() {
        return posicion_x;
    }

    public void setPosicion_x(int posicion_x) {
        this.posicion_x = posicion_x;
    }

    public int getPosicion_y() {
        return posicion_y;
    }

    public void setPosicion_y(int posicion_y) {
        this.posicion_y = posicion_y;
    }

    public String getCable_tipo() {
        return cable_tipo;
    }

    public void setCable_tipo(String cable_tipo) {
        this.cable_tipo = cable_tipo;
    }

    @Override
    public String toString() {
        return "Esquematico{" + "id_esquematicos=" + id_esquematicos + ", id_simulaciones="
                + id_simulaciones + ", piso=" + piso + ", tipo_componente='" + tipo_componente
                + '\'' + ", modelo_componente='" + modelo_componente + '\'' + ", posicion_x="
                + posicion_x + ", posicion_y=" + posicion_y + ", cable_tipo='" + cable_tipo + '\''
                + '}';
    }
}
