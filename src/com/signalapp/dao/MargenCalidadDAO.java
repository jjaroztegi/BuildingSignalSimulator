package com.signalapp.dao;

import com.signalapp.models.MargenCalidad;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Data Access Object for the MargenesCalidad table
 * Handles database operations for signal quality margin entities
 */
public class MargenCalidadDAO extends BaseDAO<MargenCalidad> {
    
    /**
     * Gets the name of the database table
     * @return The table name "margenes_calidad"
     */
    @Override
    protected String getTableName() {
        return "margenes_calidad";
    }

    /**
     * Gets the column names for the MargenesCalidad table
     * @return Array of column names
     */
    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_margenes_calidad", "tipo_senal", "nivel_minimo", "nivel_maximo"
        };
    }

    /**
     * Maps a ResultSet row to a MargenCalidad entity
     * @param rs The ResultSet containing the database row
     * @return A new MargenCalidad object with data from the ResultSet
     * @throws SQLException if a database error occurs
     */
    @Override
    protected MargenCalidad mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new MargenCalidad(
            rs.getInt("id_margenes_calidad"),
            rs.getString("tipo_senal"),
            rs.getDouble("nivel_minimo"),
            rs.getDouble("nivel_maximo")
        );
    }

    /**
     * Sets the parameters for a PreparedStatement based on MargenCalidad properties
     * @param ps The PreparedStatement to set parameters for
     * @param entity The MargenCalidad entity containing the values to set
     * @throws SQLException if a database error occurs
     */
    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, MargenCalidad entity) throws SQLException {
        ps.setString(1, entity.getTipo_senal());
        ps.setDouble(2, entity.getNivel_minimo());
        ps.setDouble(3, entity.getNivel_maximo());
    }
} 