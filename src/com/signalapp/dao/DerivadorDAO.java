package com.signalapp.dao;

import com.signalapp.models.Derivador;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Data Access Object for the Derivadores table
 * Handles database operations for tap/splitter entities
 */
public class DerivadorDAO extends BaseDAO<Derivador> {
    
    /**
     * Gets the name of the database table
     * @return The table name "Derivadores"
     */
    @Override
    protected String getTableName() {
        return "Derivadores";
    }

    /**
     * Gets the column names for the Derivadores table
     * @return Array of column names
     */
    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_derivadores", "id_componentes", "atenuacion_insercion", "atenuacion_derivacion",
            "num_salidas", "directividad", "desacoplo"
        };
    }

    /**
     * Maps a ResultSet row to a Derivador entity
     * @param rs The ResultSet containing the database row
     * @return A new Derivador object with data from the ResultSet
     * @throws SQLException if a database error occurs
     */
    @Override
    protected Derivador mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Derivador(
            rs.getInt("id_derivadores"),
            rs.getInt("id_componentes"),
            rs.getDouble("atenuacion_insercion"),
            rs.getDouble("atenuacion_derivacion"),
            rs.getInt("num_salidas"),
            rs.getDouble("directividad"),
            rs.getDouble("desacoplo")
        );
    }

    /**
     * Sets the parameters for a PreparedStatement based on Derivador properties
     * @param ps The PreparedStatement to set parameters for
     * @param entity The Derivador entity containing the values to set
     * @throws SQLException if a database error occurs
     */
    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Derivador entity) throws SQLException {
        ps.setInt(1, entity.getId_componentes());
        ps.setDouble(2, entity.getAtenuacion_insercion());
        ps.setDouble(3, entity.getAtenuacion_derivacion());
        ps.setInt(4, entity.getNum_salidas());
        ps.setDouble(5, entity.getDirectividad());
        ps.setDouble(6, entity.getDesacoplo());
    }
} 