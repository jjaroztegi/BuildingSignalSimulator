package com.signalapp.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Singleton class that manages the connection to the MS Access database
 * Provides methods to get and close database connections
 */
public class AccessConnection {
    static String root = "";
    static {
        String os = System.getProperty("os.name").toLowerCase();

        if (os.contains("win")) {
            root = "C:/Temp/Tomcat/webapps/BuildingSignalSimulator/WEB-INF/";
        // Mac os
        } else if (os.contains("mac")){
            root = "/opt/homebrew/opt/tomcat/libexec/webapps/BuildingSignalSimulator/WEB-INF/";
        }
        // Docker
        else{
            root = "/usr/local/tomcat/webapps/BuildingSignalSimulator/WEB-INF/";
        }
    }

    private static final String DB_URL = "jdbc:ucanaccess://" + root + "database/signal_distribution.accdb";
    private static Connection connection;
    private static AccessConnection instance;
    private static final Object LOCK = new Object();

    /**
     * Private constructor to prevent instantiation
     * Initializes the database connection
     * @throws SQLException if a database error occurs
     */
    private AccessConnection() throws SQLException {
        initializeConnection();
    }

    /**
     * Initializes the database connection using the UCanAccess driver
     * @throws SQLException if a database error occurs
     */
    private void initializeConnection() throws SQLException {
        try {
            Class.forName("net.ucanaccess.jdbc.UcanaccessDriver");
            connection = DriverManager.getConnection(DB_URL);
        } catch (ClassNotFoundException e) {
            throw new SQLException("Failed to load UCanAccess driver", e);
        }
    }

    /**
     * Gets a connection to the database
     * Creates a new connection if one doesn't exist or if the existing one is closed
     * @return A Connection object to the database
     * @throws SQLException if a database error occurs
     */
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

    /**
     * Closes the database connection
     * @throws SQLException if a database error occurs
     */
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