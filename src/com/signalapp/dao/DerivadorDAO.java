package com.signalapp.dao;

import com.signalapp.models.Derivador;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * Data Access Object for the Derivadores table Handles database operations for tap/splitter
 * entities
 */
public class DerivadorDAO extends BaseDAO<Derivador> {

    /**
     * Gets the name of the database table
     * 
     * @return The table name "derivadores"
     */
    @Override
    protected String getTableName() {
        return "derivadores";
    }

    /**
     * Gets the column names for the Derivadores table
     * 
     * @return Array of column names
     */
    @Override
    protected String[] getColumnNames() {
        return new String[] {"id_derivadores", "id_componentes", "atenuacion_derivacion",
                "atenuacion_paso", "directividad", "desacoplo", "perdidas_retorno"};
    }

    /**
     * Maps a ResultSet row to a Derivador entity
     * 
     * @param rs The ResultSet containing the database row
     * @return A new Derivador object with data from the ResultSet
     * @throws SQLException if a database error occurs
     */
    @Override
    protected Derivador mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Derivador(rs.getInt("id_derivadores"), rs.getInt("id_componentes"),
                rs.getDouble("atenuacion_derivacion"), rs.getDouble("atenuacion_paso"),
                rs.getDouble("directividad"), rs.getDouble("desacoplo"),
                rs.getDouble("perdidas_retorno"));
    }

    /**
     * Sets the parameters for a PreparedStatement based on Derivador properties
     * 
     * @param ps The PreparedStatement to set parameters for
     * @param entity The Derivador entity containing the values to set
     * @throws SQLException if a database error occurs
     */
    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Derivador entity)
            throws SQLException {
        ps.setInt(1, entity.getId_componentes());
        ps.setDouble(2, entity.getAtenuacion_derivacion());
        ps.setDouble(3, entity.getAtenuacion_paso());
        ps.setDouble(4, entity.getDirectividad());
        ps.setDouble(5, entity.getDesacoplo());
        ps.setDouble(6, entity.getPerdidas_retorno());
    }

    /**
     * Finds a derivador component by its componente ID
     * 
     * @param componenteId The ID of the associated componente
     * @return The Derivador object if found, null otherwise
     * @throws SQLException if a database error occurs
     */
    public Derivador findByComponenteId(int componenteId) throws SQLException {
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
