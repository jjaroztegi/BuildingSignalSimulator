package com.signalapp.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.signalapp.models.ResultadoSimulacion;

/**
 * Data Access Object for the ResultadosSimulacion table Handles database operations for simulation
 * result entities
 */
public class ResultadoSimulacionDAO extends BaseDAO<ResultadoSimulacion> {

    @Override
    protected String getTableName() {
        return "resultados_simulacion";
    }

    @Override
    protected String[] getColumnNames() {
        return new String[] {"id_resultados_simulacion", "id_simulaciones", "piso", "nivel_senal",
                "costo_piso", "estado"};
    }

    @Override
    protected ResultadoSimulacion mapResultSetToEntity(ResultSet rs) throws SQLException {
        ResultadoSimulacion resultado = new ResultadoSimulacion();
        resultado.setId_resultados_simulacion(rs.getInt("id_resultados_simulacion"));
        resultado.setId_simulaciones(rs.getInt("id_simulaciones"));
        resultado.setPiso(rs.getInt("piso"));
        resultado.setNivel_senal(rs.getDouble("nivel_senal"));
        resultado.setCosto_piso(rs.getDouble("costo_piso"));
        resultado.setEstado(rs.getString("estado"));
        return resultado;
    }

    @Override
    protected void setPreparedStatementParams(PreparedStatement stmt, ResultadoSimulacion entity)
            throws SQLException {
        stmt.setInt(1, entity.getId_simulaciones());
        stmt.setInt(2, entity.getPiso());
        stmt.setDouble(3, entity.getNivel_senal());
        stmt.setDouble(4, entity.getCosto_piso());
        stmt.setString(5, entity.getEstado());
    }

    /**
     * Find all results for a specific simulation
     * 
     * @param idSimulacion The simulation ID
     * @return List of results for the simulation
     * @throws SQLException If a database error occurs
     */
    public List<ResultadoSimulacion> findBySimulacionId(int idSimulacion) throws SQLException {
        List<ResultadoSimulacion> resultados = new ArrayList<>();
        String sql = "SELECT * FROM resultados_simulacion WHERE id_simulaciones = ? ORDER BY piso";

        try (Connection conn = DerbyConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, idSimulacion);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                resultados.add(mapResultSetToEntity(rs));
            }
        }

        return resultados;
    }

    /**
     * Delete all results for a specific simulation
     * 
     * @param idSimulacion The simulation ID
     * @throws SQLException If a database error occurs
     */
    public void deleteBySimulacionId(int idSimulacion) throws SQLException {
        String sql = "DELETE FROM resultados_simulacion WHERE id_simulaciones = ?";

        try (Connection conn = DerbyConnection.getConnection();
                PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, idSimulacion);
            stmt.executeUpdate();
        }
    }
}
