package com.signalapp.dao;

import com.signalapp.models.TipoComponente;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class TiposComponenteDAO extends BaseDAO<TipoComponente> {
    
    @Override
    protected String getTableName() {
        return "TiposComponente";
    }

    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_tiposcomponente", "nombre"
        };
    }

    @Override
    protected TipoComponente mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new TipoComponente(
            rs.getInt("id_tiposcomponente"),
            rs.getString("nombre")
        );
    }

    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, TipoComponente entity) throws SQLException {
        ps.setString(1, entity.getNombre());
    }
    
    public int getIdByNombre(String nombre) throws SQLException {
        String sql = "SELECT id_tiposcomponente FROM " + getTableName() + " WHERE nombre = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setString(1, nombre);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("id_tiposcomponente");
                }
                return -1;
            }
        }
    }
} 