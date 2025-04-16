package com.signalapp.dao;

import com.signalapp.models.TipoComponente;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Data Access Object for managing component types in the database.
 * Handles CRUD operations for the TiposComponente table, which stores
 * different categories of network components (e.g., cables, amplifiers, splitters).
 */
public class TiposComponenteDAO extends BaseDAO<TipoComponente> {
    
    /**
     * Returns the name of the database table for component types.
     * @return The table name "tipos_componente"
     */
    @Override
    protected String getTableName() {
        return "tipos_componente";
    }

    /**
     * Returns the column names for the TiposComponente table.
     * @return Array containing "id_tipos_componente", "nombre", and "descripcion"
     */
    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_tipos_componente", "nombre", "descripcion"
        };
    }

    /**
     * Maps a database result set row to a TipoComponente entity.
     * @param rs The ResultSet containing the database row
     * @return A new TipoComponente object with data from the row
     * @throws SQLException if there is an error accessing the ResultSet
     */
    @Override
    protected TipoComponente mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new TipoComponente(
            rs.getInt("id_tipos_componente"),
            rs.getString("nombre"),
            rs.getString("descripcion")
        );
    }

    /**
     * Sets the parameters for database operations using a TipoComponente entity.
     * @param ps The PreparedStatement to set parameters for
     * @param entity The TipoComponente entity containing the data
     * @throws SQLException if there is an error setting the parameters
     */
    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, TipoComponente entity) throws SQLException {
        ps.setString(1, entity.getNombre());
        ps.setString(2, entity.getDescripcion());
    }
    
    /**
     * Retrieves the ID of a component type by its name.
     * @param nombre The name of the component type to search for
     * @return The ID of the component type if found, -1 if not found
     * @throws SQLException if a database error occurs during the query
     */
    public int getIdByNombre(String nombre) throws SQLException {
        String sql = "SELECT id_tipos_componente FROM " + getTableName() + " WHERE nombre = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, nombre);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id_tipos_componente");
                }
                return -1;
            }
        }
    }
} 