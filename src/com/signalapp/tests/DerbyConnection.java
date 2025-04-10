package com.signalapp.tests;

import java.sql.*;

import com.signalapp.dao.DatabaseConnection;

public class DerbyConnection {
    public static void main(String[] args) {
        System.out.println("Listing tables from Derby database...\n");

        try (Connection connection = DatabaseConnection.getDerbyConnection()) {
            DatabaseMetaData metadata = connection.getMetaData();
            // In Derby, we use "APP" schema which is the default schema
            ResultSet tables = metadata.getTables(null, "APP", "%", new String[] { "TABLE" });

            System.out.println("Tables found in Derby database:");
            System.out.println("------------------------------");
            while (tables.next()) {
                String tableName = tables.getString("TABLE_NAME");
                System.out.println(tableName);
            }

            tables.close();
            connection.close();

        } catch (SQLException | ClassNotFoundException e) {
            System.err.println("Error accessing Derby database: " + e.getMessage());
            e.printStackTrace();
        }
    }
}