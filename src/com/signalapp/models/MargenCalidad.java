package com.signalapp.models;

/**
 * Represents the quality margins (minimum and maximum acceptable levels) for a specific type of
 * signal. Used to validate simulation results. Corresponds to the 'MargenesCalidad' table.
 */
public class MargenCalidad {
    private int id_margenes_calidad; // Primary key
    private String tipo_senal; // Type of signal (e.g., "TV Digital", "FM Radio")
    private double nivel_minimo; // Minimum acceptable signal level (dBµV)
    private double nivel_maximo; // Maximum acceptable signal level (dBµV)

    /**
     * Default constructor.
     */
    public MargenCalidad() {}

    /**
     * Constructor with all fields.
     *
     * @param id_margenes_calidad The primary key ID.
     * @param tipo_senal The type of signal.
     * @param nivel_minimo The minimum acceptable level.
     * @param nivel_maximo The maximum acceptable level.
     */
    public MargenCalidad(int id_margenes_calidad, String tipo_senal, double nivel_minimo,
            double nivel_maximo) {
        this.id_margenes_calidad = id_margenes_calidad;
        this.tipo_senal = tipo_senal;
        this.nivel_minimo = nivel_minimo;
        this.nivel_maximo = nivel_maximo;
    }

    // --- Getters and Setters ---

    public int getId_margenes_calidad() {
        return id_margenes_calidad;
    }

    public void setId_margenes_calidad(int id_margenes_calidad) {
        this.id_margenes_calidad = id_margenes_calidad;
    }

    public String getTipo_senal() {
        return tipo_senal;
    }

    public void setTipo_senal(String tipo_senal) {
        this.tipo_senal = tipo_senal;
    }

    public double getNivel_minimo() {
        return nivel_minimo;
    }

    public void setNivel_minimo(double nivel_minimo) {
        this.nivel_minimo = nivel_minimo;
    }

    public double getNivel_maximo() {
        return nivel_maximo;
    }

    public void setNivel_maximo(double nivel_maximo) {
        this.nivel_maximo = nivel_maximo;
    }

    @Override
    public String toString() {
        return "MargenCalidad{" + "id_margenes_calidad=" + id_margenes_calidad + ", tipo_senal='"
                + tipo_senal + '\'' + ", nivel_minimo=" + nivel_minimo + ", nivel_maximo="
                + nivel_maximo + '}';
    }
}
