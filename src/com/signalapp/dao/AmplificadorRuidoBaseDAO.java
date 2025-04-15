package com.signalapp.dao;

import com.signalapp.models.AmplificadorRuidoBase;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Data Access Object for the AmplificadoresRuidoBase table
 * Handles database operations for noise figure amplifier entities
 */
public class AmplificadorRuidoBaseDAO extends BaseDAO<AmplificadorRuidoBase> {
    
    /**
     * Gets the name of the database table
     * @return The table name "AmplificadoresRuidoBase"
     */
    @Override
    protected String getTableName() {
        return "AmplificadoresRuidoBase";
    }

    /**
     * Gets the column names for the AmplificadoresRuidoBase table
     * @return Array of column names
     */
    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_amplificadoresruidobase", "id_componentes", "atenuacion", "ganancia", "figura_ruido"
        };
    }

    /**
     * Maps a ResultSet row to an AmplificadorRuidoBase entity
     * @param rs The ResultSet containing the database row
     * @return A new AmplificadorRuidoBase object with data from the ResultSet
     * @throws SQLException if a database error occurs
     */
    @Override
    protected AmplificadorRuidoBase mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new AmplificadorRuidoBase(
            rs.getInt("id_amplificadoresruidobase"),
            rs.getInt("id_componentes"),
            rs.getDouble("atenuacion"),
            rs.getDouble("ganancia"),
            rs.getDouble("figura_ruido")
        );
    }

    /**
     * Sets the parameters for a PreparedStatement based on AmplificadorRuidoBase properties
     * @param ps The PreparedStatement to set parameters for
     * @param entity The AmplificadorRuidoBase entity containing the values to set
     * @throws SQLException if a database error occurs
     */
    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, AmplificadorRuidoBase entity) throws SQLException {
        ps.setInt(1, entity.getId_componentes());
        ps.setDouble(2, entity.getAtenuacion());
        ps.setDouble(3, entity.getGanancia());
        ps.setDouble(4, entity.getFigura_ruido());
    }
} 