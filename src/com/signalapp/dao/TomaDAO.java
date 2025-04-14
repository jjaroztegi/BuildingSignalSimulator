package com.signalapp.dao;

import com.signalapp.models.Toma;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class TomaDAO extends BaseDAO<Toma> {
    
    @Override
    protected String getTableName() {
        return "Tomas";
    }

    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_tomas", "id_componentes", "atenuacion"
        };
    }

    @Override
    protected Toma mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Toma(
            rs.getInt("id_tomas"),
            rs.getInt("id_componentes"),
            rs.getInt("atenuacion")
        );
    }

    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Toma entity) throws SQLException {
        ps.setInt(1, entity.getIdComponente());
        ps.setInt(2, entity.getAtenuacion());
    }
} 