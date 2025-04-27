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
     * 
     * @return The table name "componentes"
     */
    @Override
    protected String getTableName() {
        return "componentes";
    }

    /**
     * Gets the column names for the Componentes table
     * 
     * @return Array of column names
     */
    @Override
    protected String[] getColumnNames() {
        return new String[] {
                "id_componentes", "id_tipos_componente", "modelo", "costo"
        };
    }

    /**
     * Maps a ResultSet row to a Componente entity
     * 
     * @param rs The ResultSet containing the database row
     * @return A new Componente object with data from the ResultSet
     * @throws SQLException if a database error occurs
     */
    @Override
    protected Componente mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Componente(
                rs.getInt("id_componentes"),
                rs.getInt("id_tipos_componente"),
                rs.getString("modelo"),
                rs.getDouble("costo"));
    }

    /**
     * Sets the parameters for a PreparedStatement based on Componente properties
     * 
     * @param ps     The PreparedStatement to set parameters for
     * @param entity The Componente entity containing the values to set
     * @throws SQLException if a database error occurs
     */
    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Componente entity) throws SQLException {
        ps.setInt(1, entity.getId_tipos_componente());
        ps.setString(2, entity.getModelo());
        ps.setDouble(3, entity.getCosto());
    }

    /**
     * Retrieves the ID of a component by its model name
     * 
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

    /**
     * Finds a component by its model name
     * 
     * @param modelo The model name to search for
     * @return The Componente object if found, null otherwise
     * @throws SQLException if a database error occurs
     */
    public Componente findByModelo(String modelo) throws SQLException {
        String sql = "SELECT * FROM " + getTableName() + " WHERE modelo = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, modelo);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToEntity(rs);
                }
                return null;
            }
        }
    }

    /**
     * Checks if a component with the given model name already exists
     * 
     * @param modelo The model name of the component to check
     * @return true if a component with the model name exists, false otherwise
     * @throws SQLException if a database error occurs
     */
    public boolean existsByModelo(String modelo) throws SQLException {
        String sql = "SELECT COUNT(*) FROM " + getTableName() + " WHERE modelo = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, modelo);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1) > 0;
                }
                return false;
            }
        }
    }
}