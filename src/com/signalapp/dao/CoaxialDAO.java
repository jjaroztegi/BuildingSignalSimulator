package com.signalapp.dao;

import com.signalapp.models.Coaxial;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Data Access Object for the Coaxiales table
 * Handles database operations for coaxial cable entities
 */
public class CoaxialDAO extends BaseDAO<Coaxial> {

    /**
     * Gets the table name for this DAO
     */
    @Override
    protected String getTableName() {
        return "coaxiales";
    }

    /**
     * Gets the column names for this DAO's table
     */
    @Override
    protected String[] getColumnNames() {
        return new String[] {
                "id_coaxiales", "id_componentes", "atenuacion_470mhz", "atenuacion_694mhz"
        };
    }

    /**
     * Maps a database row to a Coaxial entity
     */
    @Override
    protected Coaxial mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Coaxial(
                rs.getInt("id_coaxiales"),
                rs.getInt("id_componentes"),
                rs.getDouble("atenuacion_470mhz"),
                rs.getDouble("atenuacion_694mhz"));
    }

    /**
     * Sets parameters for database operations
     */
    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Coaxial entity) throws SQLException {
        ps.setInt(1, entity.getId_componentes());
        ps.setDouble(2, entity.getAtenuacion_470mhz());
        ps.setDouble(3, entity.getAtenuacion_694mhz());
    }

    /**
     * Finds a coaxial component by its componente ID
     * 
     * @param componenteId The ID of the associated componente
     * @return The Coaxial object if found, null otherwise
     * @throws SQLException if a database error occurs
     */
    public Coaxial findByComponenteId(int componenteId) throws SQLException {
        String sql = "SELECT * FROM " + getTableName() + " WHERE id_componentes = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, componenteId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToEntity(rs);
                }
                return null;
            }
        }
    }
}