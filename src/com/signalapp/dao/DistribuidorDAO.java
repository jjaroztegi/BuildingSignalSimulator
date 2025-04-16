package com.signalapp.dao;

import com.signalapp.models.Distribuidor;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Data Access Object for the Distribuidores table
 * Handles database operations for splitter/distributor entities
 */
public class DistribuidorDAO extends BaseDAO<Distribuidor> {
    
    /**
     * Gets the name of the database table
     * @return The table name "distribuidores"
     */
    @Override
    protected String getTableName() {
        return "distribuidores";
    }

    /**
     * Gets the column names for the Distribuidores table
     * @return Array of column names
     */
    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_distribuidores", "id_componentes", "numero_salidas", "atenuacion_distribucion", 
            "desacoplo", "perdidas_retorno"
        };
    }

    /**
     * Maps a ResultSet row to a Distribuidor entity
     * @param rs The ResultSet containing the database row
     * @return A new Distribuidor object with data from the ResultSet
     * @throws SQLException if a database error occurs
     */
    @Override
    protected Distribuidor mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Distribuidor(
            rs.getInt("id_distribuidores"),
            rs.getInt("id_componentes"),
            rs.getInt("numero_salidas"),
            rs.getDouble("atenuacion_distribucion"),
            rs.getDouble("desacoplo"),
            rs.getDouble("perdidas_retorno")
        );
    }

    /**
     * Sets the parameters for a PreparedStatement based on Distribuidor properties
     * @param ps The PreparedStatement to set parameters for
     * @param entity The Distribuidor entity containing the values to set
     * @throws SQLException if a database error occurs
     */
    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Distribuidor entity) throws SQLException {
        ps.setInt(1, entity.getId_componentes());
        ps.setInt(2, entity.getNumero_salidas());
        ps.setDouble(3, entity.getAtenuacion_distribucion());
        ps.setDouble(4, entity.getDesacoplo());
        ps.setDouble(5, entity.getPerdidas_retorno());
    }

    /**
     * Finds a distribuidor component by its componente ID
     * @param componenteId The ID of the associated componente
     * @return The Distribuidor object if found, null otherwise
     * @throws SQLException if a database error occurs
     */
    public Distribuidor findByComponenteId(int componenteId) throws SQLException {
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