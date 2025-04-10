package com.signalapp.tests;

import java.sql.*;

import com.signalapp.dao.DatabaseConnection;

public class AccessConnection {
    public static void main(String[] args) {
        System.out.println("Listing tables from MS Access database...\n");

        try (Connection connection = DatabaseConnection.getAccessConnection()) {
            DatabaseMetaData metadata = connection.getMetaData();
            ResultSet tables = metadata.getTables(null, null, "%", new String[] { "TABLE" });

            System.out.println("Tables found in MS Access database:");
            System.out.println("----------------------------------");
            while (tables.next()) {
                System.out.println(tables.getString("TABLE_NAME"));
            }

            tables.close();
            connection.close();

        } catch (SQLException | ClassNotFoundException e) {
            System.err.println("Error accessing MS Access database: " + e.getMessage());
            e.printStackTrace();
        }
    }
}