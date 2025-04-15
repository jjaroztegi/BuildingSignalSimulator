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
     * @return The table name "Distribuidores"
     */
    @Override
    protected String getTableName() {
        return "Distribuidores";
    }

    /**
     * Gets the column names for the Distribuidores table
     * @return Array of column names
     */
    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_distribuidores", "id_componentes", "num_salidas", "atenuacion_distribucion", "desacoplo"
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
            rs.getInt("num_salidas"),
            rs.getDouble("atenuacion_distribucion"),
            rs.getDouble("desacoplo")
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
        ps.setInt(2, entity.getNum_salidas());
        ps.setDouble(3, entity.getAtenuacion_distribucion());
        ps.setDouble(4, entity.getDesacoplo());
    }
} 