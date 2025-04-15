package com.signalapp.dao;

import com.signalapp.models.Cable;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Data Access Object for the Cables table
 * Handles database operations for cable entities
 */
public class CableDAO extends BaseDAO<Cable> {
    
    /**
     * Gets the table name for this DAO
     */
    @Override
    protected String getTableName() {
        return "Cables";
    }

    /**
     * Gets the column names for this DAO's table
     */
    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_cables", "id_componentes", "longitud_maxima"
        };
    }

    /**
     * Maps a database row to a Cable entity
     */
    @Override
    protected Cable mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Cable(
            rs.getInt("id_cables"),
            rs.getInt("id_componentes"),
            rs.getDouble("longitud_maxima")
        );
    }

    /**
     * Sets parameters for database operations
     */
    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Cable entity) throws SQLException {
        ps.setInt(1, entity.getId_componentes());
        ps.setDouble(2, entity.getLongitud_maxima());
    }
} 