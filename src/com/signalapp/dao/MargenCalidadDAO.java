package com.signalapp.dao;

import com.signalapp.models.MargenCalidad;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class MargenCalidadDAO extends BaseDAO<MargenCalidad> {
    
    @Override
    protected String getTableName() {
        return "MargenesCalidad";
    }

    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_margenescalidad", "tipo_senal", "nivel_minimo", "nivel_maximo"
        };
    }

    @Override
    protected MargenCalidad mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new MargenCalidad(
            rs.getInt("id_margenescalidad"),
            rs.getString("tipo_senal"),
            rs.getDouble("nivel_minimo"),
            rs.getDouble("nivel_maximo")
        );
    }

    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, MargenCalidad entity) throws SQLException {
        ps.setString(1, entity.getTipo_senal());
        ps.setDouble(2, entity.getNivel_minimo());
        ps.setDouble(3, entity.getNivel_maximo());
    }
} 