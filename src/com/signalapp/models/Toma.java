package com.signalapp.models;

/**
 * Represents a Toma (Outlet/Termination Point) component type. Characterized by its attenuation and
 * isolation properties. Corresponds to the 'Tomas' table.
 */
public class Toma {
    private int id_tomas; // Primary key
    private int id_componentes; // Foreign key referencing Componentes table
    private double atenuacion; // Attenuation of the outlet (dB)
    private double desacoplo; // Isolation/Decoupling (dB), often relevant for multi-outlet plates

    /**
     * Default constructor.
     */
    public Toma() {}

    /**
     * Constructor with all fields.
     *
     * @param id_tomas The primary key ID.
     * @param id_componentes The foreign key ID linking to the base Componente.
     * @param atenuacion Attenuation value.
     * @param desacoplo Isolation value.
     */
    public Toma(int id_tomas, int id_componentes, double atenuacion, double desacoplo) {
        this.id_tomas = id_tomas;
        this.id_componentes = id_componentes;
        this.atenuacion = atenuacion;
        this.desacoplo = desacoplo;
    }

    // --- Getters and Setters ---

    public int getId_tomas() {
        return id_tomas;
    }

    public void setId_tomas(int id_tomas) {
        this.id_tomas = id_tomas;
    }

    public int getId_componentes() {
        return id_componentes;
    }

    public void setId_componentes(int id_componentes) {
        this.id_componentes = id_componentes;
    }

    public double getAtenuacion() {
        return atenuacion;
    }

    public void setAtenuacion(double atenuacion) {
        this.atenuacion = atenuacion;
    }

    public double getDesacoplo() {
        return desacoplo;
    }

    public void setDesacoplo(double desacoplo) {
        this.desacoplo = desacoplo;
    }

    @Override
    public String toString() {
        return "Toma{" + "id_tomas=" + id_tomas + ", id_componentes=" + id_componentes
                + ", atenuacion=" + atenuacion + ", desacoplo=" + desacoplo + '}';
    }
}
