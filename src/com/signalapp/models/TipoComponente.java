package com.signalapp.models;

/**
 * Represents a type or category of component used in the system. Examples: "Cable Coaxial",
 * "Derivador", "Base de Toma", "Distribuidor". Corresponds to the 'TiposComponente' table.
 */
public class TipoComponente {
    private int id_tipos_componente; // Primary key
    private String nombre; // Name of the component type (e.g., "Cable Coaxial")
    private String descripcion; // Optional description of the component type

    /**
     * Default constructor.
     */
    public TipoComponente() {}

    /**
     * Constructor with all fields.
     *
     * @param id_tipos_componente The primary key ID.
     * @param nombre The name of the component type.
     * @param descripcion The description of the component type.
     */
    public TipoComponente(int id_tipos_componente, String nombre, String descripcion) {
        this.id_tipos_componente = id_tipos_componente;
        this.nombre = nombre;
        this.descripcion = descripcion;
    }

    // --- Getters and Setters ---

    public int getId_tipos_componente() {
        return id_tipos_componente;
    }

    public void setId_tipos_componente(int id_tipos_componente) {
        this.id_tipos_componente = id_tipos_componente;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    @Override
    public String toString() {
        return "TipoComponente{" + "id_tipos_componente=" + id_tipos_componente + ", nombre='"
                + nombre + '\'' + ", descripcion='" + descripcion + '\'' + '}';
    }
}
