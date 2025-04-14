package com.signalapp.dao;

import com.signalapp.models.DetalleConfiguracion;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class DetalleConfiguracionDAO extends BaseDAO<DetalleConfiguracion> {
    
    @Override
    protected String getTableName() {
        return "DetalleConfiguracion";
    }

    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_configuraciones", "piso", "id_cables", "longitud_cable",
            "id_derivadores", "id_distribuidores", "id_amplificadoresruidobase",
            "nivel_senal", "fecha_calculo"
        };
    }

    @Override
    protected DetalleConfiguracion mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new DetalleConfiguracion(
            rs.getInt("id_detalles"),
            rs.getInt("id_configuraciones"),
            rs.getInt("piso"),
            rs.getInt("id_cables"),
            rs.getDouble("longitud_cable"),
            rs.getObject("id_derivadores", Integer.class),
            rs.getObject("id_distribuidores", Integer.class),
            rs.getObject("id_amplificadoresruidobase", Integer.class),
            rs.getDouble("nivel_senal"),
            rs.getString("fecha_calculo")
        );
    }

    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, DetalleConfiguracion entity) throws SQLException {
        ps.setInt(1, entity.getIdConfiguracion());
        ps.setInt(2, entity.getPiso());
        ps.setInt(3, entity.getIdCable());
        ps.setDouble(4, entity.getLongitudCable());
        ps.setObject(5, entity.getIdDerivador());
        ps.setObject(6, entity.getIdDistribuidor());
        ps.setObject(7, entity.getIdAmplificadorRuidoBase());
        ps.setDouble(8, entity.getNivelSenal());
        ps.setString(9, entity.getFechaCalculo());
    }
    
    public List<DetalleConfiguracion> findByConfiguracionId(int idConfiguracion) throws SQLException {
        String sql = "SELECT * FROM " + getTableName() + " WHERE id_configuraciones = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, idConfiguracion);
            try (ResultSet rs = ps.executeQuery()) {
                List<DetalleConfiguracion> entities = new ArrayList<>();
                while (rs.next()) {
                    entities.add(mapResultSetToEntity(rs));
                }
                return entities;
            }
        }
    }
} 