package com.signalapp.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class AccessConnection {
    private static final String DB_URL = "jdbc:ucanaccess://database/signal_distribution.accdb";
    private static Connection connection;
    private static AccessConnection instance;
    private static final Object LOCK = new Object();

    private AccessConnection() throws SQLException {
        initializeConnection();
    }

    private void initializeConnection() throws SQLException {
        try {
            Class.forName("net.ucanaccess.jdbc.UcanaccessDriver");
            connection = DriverManager.getConnection(DB_URL);
        } catch (ClassNotFoundException e) {
            throw new SQLException("Failed to load UCanAccess driver", e);
        }
    }

    public static Connection getConnection() throws SQLException {
        synchronized (LOCK) {
            if (instance == null) {
                instance = new AccessConnection();
            }
            
            // Validate connection and reconnect if necessary
            if (connection == null || connection.isClosed()) {
                instance.initializeConnection();
            }
            
            try {
                // Test the connection with a simple validation query
                if (!connection.isValid(5)) { // 5 second timeout
                    instance.initializeConnection();
                }
            } catch (SQLException e) {
                // If validation fails, try to reconnect
                instance.initializeConnection();
            }
            
            return connection;
        }
    }

    public static void close() throws SQLException {
        synchronized (LOCK) {
            if (connection != null && !connection.isClosed()) {
                connection.close();
                connection = null;
                instance = null;
            }
        }
    }
}