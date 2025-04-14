package com.signalapp.dao;

import com.signalapp.models.Configuracion;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class ConfiguracionDAO extends BaseDAO<Configuracion> {
    
    @Override
    protected String getTableName() {
        return "Configuraciones";
    }

    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "nombre", "nivel_cabecera", "num_pisos", "costo_total",
            "fecha_creacion", "usuario_creacion", "fecha_modificacion", "usuario_modificacion"
        };
    }

    @Override
    protected Configuracion mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Configuracion(
            rs.getInt("id_configuraciones"),
            rs.getString("nombre"),
            rs.getDouble("nivel_cabecera"),
            rs.getInt("num_pisos"),
            rs.getDouble("costo_total"),
            rs.getString("fecha_creacion"),
            rs.getString("usuario_creacion"),
            rs.getString("fecha_modificacion"),
            rs.getString("usuario_modificacion")
        );
    }

    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Configuracion entity) throws SQLException {
        ps.setString(1, entity.getNombre());
        ps.setDouble(2, entity.getNivelCabecera());
        ps.setInt(3, entity.getNumPisos());
        ps.setDouble(4, entity.getCostoTotal());
        ps.setString(5, entity.getFechaCreacion());
        ps.setString(6, entity.getUsuarioCreacion());
        ps.setString(7, entity.getFechaModificacion());
        ps.setString(8, entity.getUsuarioModificacion());
    }

    public int getIdByNombre(String nombre) throws SQLException {
        String sql = "SELECT MAX(id_configuraciones) FROM " + getTableName() + " WHERE nombre = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, nombre);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
                return -1;
            }
        }
    }
} 