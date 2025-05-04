package com.signalapp.dao;

import com.signalapp.models.Toma;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Data Access Object for the Tomas table Handles database operations for outlet entities
 */
public class TomaDAO extends BaseDAO<Toma> {

    /**
     * Gets the name of the database table
     * 
     * @return The table name "tomas"
     */
    @Override
    protected String getTableName() {
        return "tomas";
    }

    /**
     * Gets the column names for the Tomas table
     * 
     * @return Array of column names
     */
    @Override
    protected String[] getColumnNames() {
        return new String[] {"id_tomas", "id_componentes", "atenuacion", "desacoplo"};
    }

    /**
     * Maps a ResultSet row to a Toma entity
     * 
     * @param rs The ResultSet containing the database row
     * @return A new Toma object with data from the ResultSet
     * @throws SQLException if a database error occurs
     */
    @Override
    protected Toma mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Toma(rs.getInt("id_tomas"), rs.getInt("id_componentes"),
                rs.getDouble("atenuacion"), rs.getDouble("desacoplo"));
    }

    /**
     * Sets the parameters for a PreparedStatement based on Toma properties
     * 
     * @param ps The PreparedStatement to set parameters for
     * @param entity The Toma entity containing the values to set
     * @throws SQLException if a database error occurs
     */
    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Toma entity)
            throws SQLException {
        ps.setInt(1, entity.getId_componentes());
        ps.setDouble(2, entity.getAtenuacion());
        ps.setDouble(3, entity.getDesacoplo());
    }

    /**
     * Finds a toma component by its componente ID
     * 
     * @param componenteId The ID of the associated componente
     * @return The Toma object if found, null otherwise
     * @throws SQLException if a database error occurs
     */
    public Toma findByComponenteId(int componenteId) throws SQLException {
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
