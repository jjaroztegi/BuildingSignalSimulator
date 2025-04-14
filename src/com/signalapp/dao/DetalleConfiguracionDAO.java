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
            "id_detallesconfiguracion", "id_configuraciones", "piso", "id_cables", "longitud_cable",
            "id_derivadores", "id_distribuidores", "id_amplificadoresruidobase",
            "nivel_senal", "fecha_calculo"
        };
    }

    @Override
    protected DetalleConfiguracion mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new DetalleConfiguracion(
            rs.getInt("id_detallesconfiguracion"),
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
        // id_detallesconfiguracion is auto-generated
        ps.setInt(1, entity.getId_configuraciones());
        ps.setInt(2, entity.getPiso());
        ps.setInt(3, entity.getId_cables());
        ps.setDouble(4, entity.getLongitud_cable());
        ps.setObject(5, entity.getId_derivadores());
        ps.setObject(6, entity.getId_distribuidores());
        ps.setObject(7, entity.getId_amplificadoresruidobase());
        ps.setDouble(8, entity.getNivel_senal());
        ps.setString(9, entity.getFecha_calculo());
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