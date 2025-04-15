package com.signalapp.dao;

import com.signalapp.models.DetalleConfiguracion;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Data Access Object for managing configuration details in the database.
 * Handles CRUD operations for the DetalleConfiguracion table, which stores
 * specific settings and parameters for each network configuration.
 */
public class DetalleConfiguracionDAO extends BaseDAO<DetalleConfiguracion> {
    
    /**
     * Returns the name of the database table for configuration details.
     * @return The table name "DetalleConfiguracion"
     */
    @Override
    protected String getTableName() {
        return "DetalleConfiguracion";
    }

    /**
     * Returns the column names for the DetalleConfiguracion table.
     * @return Array containing all column names for the DetalleConfiguracion table
     */
    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_detalleconfiguracion", "id_configuraciones", "piso", "id_cables", "longitud_cable",
            "id_derivadores", "id_distribuidores", "id_amplificadoresruidobase",
            "nivel_senal", "fecha_calculo"
        };
    }

    /**
     * Maps a database result set row to a DetalleConfiguracion entity.
     * @param rs The ResultSet containing the database row
     * @return A new DetalleConfiguracion object with data from the row
     * @throws SQLException if there is an error accessing the ResultSet
     */
    @Override
    protected DetalleConfiguracion mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new DetalleConfiguracion(
            rs.getInt("id_detalleconfiguracion"),
            rs.getInt("id_configuraciones"),
            rs.getInt("piso"),
            rs.getInt("id_cables"),
            rs.getDouble("longitud_cable"),
            rs.getObject("id_derivadores", Integer.class),
            rs.getObject("id_distribuidores", Integer.class),
            rs.getObject("id_amplificadoresruidobase", Integer.class),
            rs.getDouble("nivel_senal"),
            rs.getString("fecha_calculo")
        );
    }

    /**
     * Sets the parameters for database operations using a DetalleConfiguracion entity.
     * @param ps The PreparedStatement to set parameters for
     * @param entity The DetalleConfiguracion entity containing the data
     * @throws SQLException if there is an error setting the parameters
     */
    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, DetalleConfiguracion entity) throws SQLException {
        // id_detalleconfiguracion is auto-generated
        ps.setInt(1, entity.getId_configuraciones());
        ps.setInt(2, entity.getPiso());
        ps.setInt(3, entity.getId_cables());
        ps.setDouble(4, entity.getLongitud_cable());
        ps.setObject(5, entity.getId_derivadores());
        ps.setObject(6, entity.getId_distribuidores());
        ps.setObject(7, entity.getId_amplificadoresruidobase());
        ps.setDouble(8, entity.getNivel_senal());
        ps.setString(9, entity.getFecha_calculo());
    }
    
    /**
     * Retrieves all configuration details associated with a specific configuration ID.
     * @param idConfiguracion The ID of the configuration to find details for
     * @return A list of DetalleConfiguracion objects containing the configuration details
     * @throws SQLException if a database error occurs during the query
     */
    public List<DetalleConfiguracion> findByConfiguracionId(int idConfiguracion) throws SQLException {
        String sql = "SELECT * FROM " + getTableName() + " WHERE id_configuraciones = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, idConfiguracion);
            try (ResultSet rs = ps.executeQuery()) {
                List<DetalleConfiguracion> entities = new ArrayList<>();
                while (rs.next()) {
                    entities.add(mapResultSetToEntity(rs));
                }
                return entities;
            }
        }
    }
} 