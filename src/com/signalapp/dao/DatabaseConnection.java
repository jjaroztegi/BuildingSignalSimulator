package com.signalapp.dao;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {

    private static final String ACCESS_DB_PATH = "database/signal_distribution.accdb";
    private static final String ACCESS_CONNECTION_STRING = "jdbc:ucanaccess://" + ACCESS_DB_PATH;
    private static final String DERBY_DB_PATH = "database/signal_distribution";
    private static final String DERBY_CONNECTION_STRING = "jdbc:derby:" + DERBY_DB_PATH;

    public static Connection getAccessConnection() throws SQLException, ClassNotFoundException {
        Class.forName("net.ucanaccess.jdbc.UcanaccessDriver");
        return DriverManager.getConnection(ACCESS_CONNECTION_STRING);
    }

    public static Connection getDerbyConnection() throws SQLException, ClassNotFoundException {
        Class.forName("org.apache.derby.jdbc.EmbeddedDriver");
        return DriverManager.getConnection(DERBY_CONNECTION_STRING);
    }
}