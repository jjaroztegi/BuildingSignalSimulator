package com.signalapp.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public abstract class BaseDAO<T> {
    protected Connection connection;

    public BaseDAO() {
        try {
            this.connection = AccessConnection.getConnection();
        } catch (SQLException e) {
        e.printStackTrace();
        throw new RuntimeException("Database connection error", e); // Rethrow as a runtime exception
        }
    }

    protected abstract String getTableName();
    protected abstract String[] getColumnNames();
    protected abstract T mapResultSetToEntity(ResultSet rs) throws SQLException;
    protected abstract void setPreparedStatementParams(PreparedStatement ps, T entity) throws SQLException;

    public List<T> findAll() throws SQLException {
        String sql = "SELECT * FROM " + getTableName();
        try (PreparedStatement ps = connection.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            List<T> entities = new ArrayList<>();
            while (rs.next()) {
                entities.add(mapResultSetToEntity(rs));
            }
            return entities;
        }
    }

    public T findById(int id) throws SQLException {
        String sql = "SELECT * FROM " + getTableName() + " WHERE id_" + getTableName().toLowerCase() + " = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToEntity(rs);
                }
                return null;
            }
        }
    }

    public void insert(T entity) throws SQLException {
        // Get all column names except the ID column
        String[] columns = getColumnNames();
        String[] insertColumns = new String[columns.length - 1];
        for (int i = 1; i < columns.length; i++) {
            insertColumns[i-1] = columns[i];
        }
        
        String columnsStr = String.join(", ", insertColumns);
        String placeholders = String.join(", ", insertColumns).replaceAll("[^,]+", "?");
        String sql = "INSERT INTO " + getTableName() + " (" + columnsStr + ") VALUES (" + placeholders + ")";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            setPreparedStatementParams(ps, entity);
            ps.executeUpdate();
        }
    }

    public void update(T entity, int id) throws SQLException {
        String setClause = String.join(" = ?, ", getColumnNames()) + " = ?";
        String sql = "UPDATE " + getTableName() + " SET " + setClause + " WHERE id_" + getTableName().toLowerCase() + " = ?";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            setPreparedStatementParams(ps, entity);
            ps.setInt(getColumnNames().length + 1, id);
            ps.executeUpdate();
        }
    }

    public void delete(int id) throws SQLException {
        String sql = "DELETE FROM " + getTableName() + " WHERE id_" + getTableName().toLowerCase() + " = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }
} 