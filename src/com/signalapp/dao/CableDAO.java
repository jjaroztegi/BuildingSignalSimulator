package com.signalapp.dao;

import com.signalapp.models.Cable;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class CableDAO extends BaseDAO<Cable> {
    
    @Override
    protected String getTableName() {
        return "Cables";
    }

    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_cables", "id_componentes", "longitud_maxima"
        };
    }

    @Override
    protected Cable mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Cable(
            rs.getInt("id_cables"),
            rs.getInt("id_componentes"),
            rs.getDouble("longitud_maxima")
        );
    }

    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Cable entity) throws SQLException {
        ps.setInt(1, entity.getId_componentes());
        ps.setDouble(2, entity.getLongitud_maxima());
    }
} 