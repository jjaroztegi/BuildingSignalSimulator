package com.signalapp.dao;

import com.signalapp.models.Componente;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class ComponenteDAO extends BaseDAO<Componente> {
    
    @Override
    protected String getTableName() {
        return "Componentes";
    }

    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_componentes", "id_tiposcomponente", "modelo", "costo", "fecha_creacion", 
            "usuario_creacion", "fecha_modificacion", "usuario_modificacion"
        };
    }

    @Override
    protected Componente mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Componente(
            rs.getInt("id_componentes"),
            rs.getInt("id_tiposcomponente"),
            rs.getString("modelo"),
            rs.getDouble("costo"),
            rs.getString("fecha_creacion"),
            rs.getString("usuario_creacion"),
            rs.getString("fecha_modificacion"),
            rs.getString("usuario_modificacion")
        );
    }

    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Componente entity) throws SQLException {
        ps.setInt(1, entity.getId_tiposcomponente());
        ps.setString(2, entity.getModelo());
        ps.setDouble(3, entity.getCosto());
        ps.setString(4, entity.getFecha_creacion());
        ps.setString(5, entity.getUsuario_creacion());
        ps.setString(6, entity.getFecha_modificacion());
        ps.setString(7, entity.getUsuario_modificacion());
    }

    public int getIdByModelo(String modelo) throws SQLException {
        String sql = "SELECT MAX(id_componentes) FROM " + getTableName() + " WHERE modelo = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, modelo);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
                return -1;
            }
        }
    }
} 