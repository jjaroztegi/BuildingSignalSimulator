package com.signalapp.dao;

import com.signalapp.models.AmplificadorRuidoBase;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class AmplificadorRuidoBaseDAO extends BaseDAO<AmplificadorRuidoBase> {
    
    @Override
    protected String getTableName() {
        return "AmplificadoresRuidoBase";
    }

    @Override
    protected String[] getColumnNames() {
        return new String[] {
            "id_componentes", "atenuacion", "ganancia", "figura_ruido"
        };
    }

    @Override
    protected AmplificadorRuidoBase mapResultSetToEntity(ResultSet rs) throws SQLException {
        return new AmplificadorRuidoBase(
            rs.getInt("id_amplificadoresruidobase"),
            rs.getInt("id_componentes"),
            rs.getDouble("atenuacion"),
            rs.getDouble("ganancia"),
            rs.getDouble("figura_ruido")
        );
    }

    @Override
    protected void setPreparedStatementParams(PreparedStatement ps, AmplificadorRuidoBase entity) throws SQLException {
        ps.setInt(1, entity.getIdComponente());
        ps.setDouble(2, entity.getAtenuacion());
        ps.setDouble(3, entity.getGanancia());
        ps.setDouble(4, entity.getFiguraRuido());
    }
} 