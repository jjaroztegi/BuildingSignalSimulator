package com.signalapp.dao;

import com.signalapp.models.Derivador;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class DerivadorDAO extends BaseDAO<Derivador> {
    
    @Override
    protected String getTableName() {
        return "Derivadores";
    }

    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_derivadores", "id_componentes", "atenuacion_insercion", "atenuacion_derivacion",
            "num_salidas", "directividad", "desacoplo"
        };
    }

    @Override
    protected Derivador mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new Derivador(
            rs.getInt("id_derivadores"),
            rs.getInt("id_componentes"),
            rs.getDouble("atenuacion_insercion"),
            rs.getDouble("atenuacion_derivacion"),
            rs.getInt("num_salidas"),
            rs.getDouble("directividad"),
            rs.getDouble("desacoplo")
        );
    }

    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, Derivador entity) throws SQLException {
        ps.setInt(1, entity.getId_componentes());
        ps.setDouble(2, entity.getAtenuacion_insercion());
        ps.setDouble(3, entity.getAtenuacion_derivacion());
        ps.setInt(4, entity.getNum_salidas());
        ps.setDouble(5, entity.getDirectividad());
        ps.setDouble(6, entity.getDesacoplo());
    }
} 