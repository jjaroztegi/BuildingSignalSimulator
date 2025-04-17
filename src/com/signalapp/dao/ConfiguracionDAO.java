package com.signalapp.dao;

import com.signalapp.models.Configuracion;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Data Access Object for the Configuraciones table
 * Handles database operations for configuration entities
 */
public class ConfiguracionDAO extends BaseDAO<Configuracion> {

    /**
     * Gets the name of the database table
     * 
     * @return The table name "configuraciones"
     */
    @Override
    protected String getTableName() {
        return "configuraciones";
    }

    /**
     * Gets the column names for the Configuraciones table
     * 
     * @return Array of column names
     */
    @Override
    protected String[] getColumnNames() {
        return new String[] {
                "id_configuraciones", "nombre", "nivel_cabecera", "num_pisos", "costo_total",
                "fecha_creacion", "usuario_creacion", "fecha_modificacion", "usuario_modificacion"
        };
    }

    /**
     * Maps a ResultSet row to a Configuracion entity
     * 
     * @param rs The ResultSet containing the database row
     * @return A new Configuracion object with data from the ResultSet
     * @throws SQLException if a database error occurs
     */
    @Override
    protected Configuracion mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Configuracion(
                rs.getInt("id_configuraciones"),
                rs.getString("nombre"),
                rs.getDouble("nivel_cabecera"),
                rs.getInt("num_pisos"),
                rs.getDouble("costo_total"),
                rs.getString("fecha_creacion"),
                rs.getString("usuario_creacion"),
                rs.getString("fecha_modificacion"),
                rs.getString("usuario_modificacion"));
    }

    /**
     * Sets the parameters for a PreparedStatement based on Configuracion properties
     * 
     * @param ps     The PreparedStatement to set parameters for
     * @param entity The Configuracion entity containing the values to set
     * @throws SQLException if a database error occurs
     */
    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Configuracion entity) throws SQLException {
        ps.setString(1, entity.getNombre());
        ps.setDouble(2, entity.getNivel_cabecera());
        ps.setInt(3, entity.getNum_pisos());
        ps.setDouble(4, entity.getCosto_total());
        ps.setString(5, entity.getFecha_creacion());
        ps.setString(6, entity.getUsuario_creacion());
        ps.setString(7, entity.getFecha_modificacion());
        ps.setString(8, entity.getUsuario_modificacion());
    }

    /**
     * Retrieves the ID of a configuration by its name
     * 
     * @param nombre The name of the configuration
     * @return The ID of the configuration, or -1 if not found
     * @throws SQLException if a database error occurs
     */
    public int getIdByNombre(String nombre) throws SQLException {
        String sql = "SELECT MAX(id_configuraciones) FROM " + getTableName() + " WHERE nombre = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, nombre);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
                return -1;
            }
        }
    }
}