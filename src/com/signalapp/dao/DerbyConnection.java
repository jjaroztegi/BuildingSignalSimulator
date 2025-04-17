package com.signalapp.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Class that manages the connection to the Derby database
 * Provides methods to get and close database connections
 */
public class DerbyConnection {
    private static final String DB_URL = "jdbc:derby:database/signal_distribution";
    private Connection connection;

    /**
     * Constructor that establishes a connection to the Derby database
     * 
     * @throws SQLException if a database error occurs
     */
    public DerbyConnection() throws SQLException {
        try {
            Class.forName("org.apache.derby.jdbc.EmbeddedDriver");
            connection = DriverManager.getConnection(DB_URL);
        } catch (ClassNotFoundException e) {
            throw new SQLException("Failed to load Derby driver", e);
        }
    }

    /**
     * Gets the database connection
     * 
     * @return The Connection object to the database
     */
    public Connection getConnection() {
        return connection;
    }

    /**
     * Closes the database connection
     * 
     * @throws SQLException if a database error occurs
     */
    public void close() throws SQLException {
        if (connection != null && !connection.isClosed()) {
            connection.close();
        }
    }
}