package com.signalapp.dao;

import com.signalapp.models.Componente;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Data Access Object for the Componentes table
 * Handles database operations for component entities
 */
public class ComponenteDAO extends BaseDAO<Componente> {
    
    /**
     * Gets the name of the database table
     * @return The table name "Componentes"
     */
    @Override
    protected String getTableName() {
        return "Componentes";
    }

    /**
     * Gets the column names for the Componentes table
     * @return Array of column names
     */
    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_componentes", "id_tiposcomponente", "modelo", "costo", "fecha_creacion", 
            "usuario_creacion", "fecha_modificacion", "usuario_modificacion"
        };
    }

    /**
     * Maps a ResultSet row to a Componente entity
     * @param rs The ResultSet containing the database row
     * @return A new Componente object with data from the ResultSet
     * @throws SQLException if a database error occurs
     */
    @Override
    protected Componente mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Componente(
            rs.getInt("id_componentes"),
            rs.getInt("id_tiposcomponente"),
            rs.getString("modelo"),
            rs.getDouble("costo"),
            rs.getString("fecha_creacion"),
            rs.getString("usuario_creacion"),
            rs.getString("fecha_modificacion"),
            rs.getString("usuario_modificacion")
        );
    }

    /**
     * Sets the parameters for a PreparedStatement based on Componente properties
     * @param ps The PreparedStatement to set parameters for
     * @param entity The Componente entity containing the values to set
     * @throws SQLException if a database error occurs
     */
    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Componente entity) throws SQLException {
        ps.setInt(1, entity.getId_tiposcomponente());
        ps.setString(2, entity.getModelo());
        ps.setDouble(3, entity.getCosto());
        ps.setString(4, entity.getFecha_creacion());
        ps.setString(5, entity.getUsuario_creacion());
        ps.setString(6, entity.getFecha_modificacion());
        ps.setString(7, entity.getUsuario_modificacion());
    }

    /**
     * Retrieves the ID of a component by its model name
     * @param modelo The model name of the component
     * @return The ID of the component, or -1 if not found
     * @throws SQLException if a database error occurs
     */
    public int getIdByModelo(String modelo) throws SQLException {
        String sql = "SELECT MAX(id_componentes) FROM " + getTableName() + " WHERE modelo = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, modelo);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
                return -1;
            }
        }
    }
} 