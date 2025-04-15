package com.signalapp.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Base Data Access Object class that provides common database operations
 * @param <T> The entity type this DAO handles
 */
public abstract class BaseDAO<T> {
    protected Connection connection;

    /**
     * Constructor that establishes a database connection
     * @throws RuntimeException if database connection fails
     */
    public BaseDAO() {
        try {
            this.connection = AccessConnection.getConnection();
        } catch (SQLException e) {
        e.printStackTrace();
        throw new RuntimeException("Database connection error", e); // Rethrow as a runtime exception
        }
    }

    /**
     * Gets the name of the database table this DAO operates on
     * @return The table name
     */
    protected abstract String getTableName();
    
    /**
     * Gets the column names for the database table
     * @return Array of column names
     */
    protected abstract String[] getColumnNames();
    
    /**
     * Maps a ResultSet row to an entity object
     * @param rs The ResultSet containing the database row
     * @return The mapped entity object
     * @throws SQLException if a database error occurs
     */
    protected abstract T mapResultSetToEntity(ResultSet rs) throws SQLException;
    
    /**
     * Sets the parameters for a PreparedStatement based on entity properties
     * @param ps The PreparedStatement to set parameters for
     * @param entity The entity containing the values to set
     * @throws SQLException if a database error occurs
     */
    protected abstract void setPreparedStatementParams(PreparedStatement ps, T entity) throws SQLException;

    /**
     * Retrieves all records from the database table
     * @return A list of all entities
     * @throws SQLException if a database error occurs
     */
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

    /**
     * Retrieves a single record by its ID
     * @param id The ID of the record to retrieve
     * @return The entity with the specified ID, or null if not found
     * @throws SQLException if a database error occurs
     */
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

    /**
     * Inserts a new record into the database
     * @param entity The entity to insert
     * @throws SQLException if a database error occurs
     */
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

    /**
     * Updates an existing record in the database
     * @param entity The entity with updated values
     * @param id The ID of the record to update
     * @throws SQLException if a database error occurs
     */
    public void update(T entity, int id) throws SQLException {
        String setClause = String.join(" = ?, ", getColumnNames()) + " = ?";
        String sql = "UPDATE " + getTableName() + " SET " + setClause + " WHERE id_" + getTableName().toLowerCase() + " = ?";
        
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            setPreparedStatementParams(ps, entity);
            ps.setInt(getColumnNames().length + 1, id);
            ps.executeUpdate();
        }
    }

    /**
     * Deletes a record from the database
     * @param id The ID of the record to delete
     * @throws SQLException if a database error occurs
     */
    public void delete(int id) throws SQLException {
        String sql = "DELETE FROM " + getTableName() + " WHERE id_" + getTableName().toLowerCase() + " = ?";
        try (PreparedStatement ps = connection.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }
} 