package com.signalapp.dao;

import com.signalapp.models.Distribuidor;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class DistribuidorDAO extends BaseDAO<Distribuidor> {
    
    @Override
    protected String getTableName() {
        return "Distribuidores";
    }

    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_distribuidores", "id_componentes", "num_salidas", "atenuacion_distribucion", "desacoplo"
        };
    }

    @Override
    protected Distribuidor mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Distribuidor(
            rs.getInt("id_distribuidores"),
            rs.getInt("id_componentes"),
            rs.getInt("num_salidas"),
            rs.getDouble("atenuacion_distribucion"),
            rs.getDouble("desacoplo")
        );
    }

    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Distribuidor entity) throws SQLException {
        ps.setInt(1, entity.getId_componentes());
        ps.setInt(2, entity.getNum_salidas());
        ps.setDouble(3, entity.getAtenuacion_distribucion());
        ps.setDouble(4, entity.getDesacoplo());
    }
} 