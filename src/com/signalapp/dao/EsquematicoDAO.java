package com.signalapp.dao;

import com.signalapp.models.Esquematico;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Data Access Object for the Esquematicos table Handles database operations for schematic entities
 */
public class EsquematicoDAO extends BaseDAO<Esquematico> {

    @Override
    protected String getTableName() {
        return "esquematicos";
    }

    @Override
    protected String[] getColumnNames() {
        return new String[] {"id_esquematicos", "id_simulaciones", "piso", "tipo_componente",
                "modelo_componente", "posicion_x", "posicion_y", "cable_tipo"};
    }

    @Override
    protected Esquematico mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Esquematico(rs.getInt("id_esquematicos"), rs.getInt("id_simulaciones"),
                rs.getInt("piso"), rs.getString("tipo_componente"),
                rs.getString("modelo_componente"), rs.getInt("posicion_x"), rs.getInt("posicion_y"),
                rs.getString("cable_tipo"));
    }

    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Esquematico entity)
            throws SQLException {
        ps.setInt(1, entity.getId_simulaciones());
        ps.setInt(2, entity.getPiso());
        ps.setString(3, entity.getTipo_componente());
        ps.setString(4, entity.getModelo_componente());
        ps.setInt(5, entity.getPosicion_x());
        ps.setInt(6, entity.getPosicion_y());
        ps.setString(7, entity.getCable_tipo());
    }

    /**
     * Retrieves all schematic components for a specific simulation
     * 
     * @param idSimulacion The ID of the simulation
     * @return List of schematic components for the simulation
     * @throws SQLException if a database error occurs
     */
    public java.util.List<Esquematico> getBySimulacion(int idSimulacion) throws SQLException {
        String sql = "SELECT * FROM " + getTableName() + " WHERE id_simulaciones = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, idSimulacion);
            try (ResultSet rs = ps.executeQuery()) {
                java.util.List<Esquematico> esquematicos = new java.util.ArrayList<>();
                while (rs.next()) {
                    esquematicos.add(mapResultSetToEntity(rs));
                }
                return esquematicos;
            }
        }
    }

    /**
     * Retrieves all schematic components for a specific simulation and floor
     * 
     * @param idSimulacion The ID of the simulation
     * @param piso The floor number
     * @return List of schematic components for the simulation and floor
     * @throws SQLException if a database error occurs
     */
    public java.util.List<Esquematico> getBySimulacionAndPiso(int idSimulacion, int piso)
            throws SQLException {
        String sql = "SELECT * FROM " + getTableName() + " WHERE id_simulaciones = ? AND piso = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, idSimulacion);
            ps.setInt(2, piso);
            try (ResultSet rs = ps.executeQuery()) {
                java.util.List<Esquematico> esquematicos = new java.util.ArrayList<>();
                while (rs.next()) {
                    esquematicos.add(mapResultSetToEntity(rs));
                }
                return esquematicos;
            }
        }
    }

    /**
     * Deletes all schematic components for a specific simulation
     * 
     * @param idSimulacion The ID of the simulation
     * @throws SQLException if a database error occurs
     */
    public void deleteBySimulacion(int idSimulacion) throws SQLException {
        String sql = "DELETE FROM " + getTableName() + " WHERE id_simulaciones = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, idSimulacion);
            ps.executeUpdate();
        }
    }
}
