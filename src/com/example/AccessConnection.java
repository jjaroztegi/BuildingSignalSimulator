package com.example;

import java.sql.*;

public class AccessConnection {
    public static void main(String[] args) {
        try {
            Class.forName("net.ucanaccess.jdbc.UcanaccessDriver");

            String dbPath = "database/signal_distribution.accdb";
            String connectionString = "jdbc:ucanaccess://" + dbPath;

            Connection connection = DriverManager.getConnection(connectionString);

            DatabaseMetaData metadata = connection.getMetaData();
            ResultSet tables = metadata.getTables(null, null, "%", null);

            System.out.println("Connected successfully! Tables in database:");
            while (tables.next()) {
                System.out.println(tables.getString("TABLE_NAME"));
            }

            tables.close();
            connection.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
