package com.signalapp.dao;

import com.signalapp.models.Simulacion;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Data Access Object for the Simulaciones table Handles database operations for simulation entities
 */
public class SimulacionDAO extends BaseDAO<Simulacion> {

    @Override
    protected String getTableName() {
        return "simulaciones";
    }

    @Override
    protected String[] getColumnNames() {
        return new String[] {"id_simulaciones", "id_configuraciones", "frecuencia", "tipo_senal",
                "costo_total", "estado", "fecha_simulacion"};
    }

    @Override
    protected Simulacion mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Simulacion(rs.getInt("id_simulaciones"), rs.getInt("id_configuraciones"),
                rs.getInt("frecuencia"), rs.getString("tipo_senal"), rs.getDouble("costo_total"),
                rs.getString("estado"), rs.getString("fecha_simulacion"));
    }

    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Simulacion entity)
            throws SQLException {
        ps.setInt(1, entity.getId_configuraciones());
        ps.setInt(2, entity.getFrecuencia());
        ps.setString(3, entity.getTipo_senal());
        ps.setDouble(4, entity.getCosto_total());
        ps.setString(5, entity.getEstado());
        ps.setString(6, entity.getFecha_simulacion());
    }

    /**
     * Retrieves all simulations for a specific configuration
     * 
     * @param idConfiguracion The ID of the configuration
     * @return List of simulations for the configuration
     * @throws SQLException if a database error occurs
     */
    public java.util.List<Simulacion> getByConfiguracion(int idConfiguracion) throws SQLException {
        String sql = "SELECT s.*, c.nombre as nombre_edificio, c.nivel_cabecera, c.num_pisos "
                + "FROM " + getTableName() + " s "
                + "JOIN configuraciones c ON s.id_configuraciones = c.id_configuraciones "
                + "WHERE s.id_configuraciones = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, idConfiguracion);
            try (ResultSet rs = ps.executeQuery()) {
                java.util.List<Simulacion> simulaciones = new java.util.ArrayList<>();
                while (rs.next()) {
                    Simulacion simulacion = mapResultSetToEntity(rs);
                    simulacion.setNombre_edificio(rs.getString("nombre_edificio"));
                    simulacion.setNivel_cabecera(rs.getDouble("nivel_cabecera"));
                    simulacion.setNum_pisos(rs.getInt("num_pisos"));
                    simulaciones.add(simulacion);
                }
                return simulaciones;
            }
        }
    }

    /**
     * Retrieves the latest simulation for a specific configuration
     * 
     * @param idConfiguracion The ID of the configuration
     * @return The latest simulation, or null if none exists
     * @throws SQLException if a database error occurs
     */
    public Simulacion getLatestByConfiguracion(int idConfiguracion) throws SQLException {
        String sql = "SELECT * FROM " + getTableName()
                + " WHERE id_configuraciones = ? ORDER BY fecha_simulacion DESC FETCH FIRST 1 ROW ONLY";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, idConfiguracion);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToEntity(rs);
                }
                return null;
            }
        }
    }
}
