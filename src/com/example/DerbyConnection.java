package com.example;

import java.sql.*;

public class DerbyConnection {
    public static void main(String[] args) {
        try {
            Class.forName("org.apache.derby.jdbc.EmbeddedDriver");

            String connectionString = "jdbc:derby:database/signal_distribution";

            Connection connection = DriverManager.getConnection(connectionString);

            DatabaseMetaData metadata = connection.getMetaData();
            ResultSet tables = metadata.getTables(null, "APP", "%", null);

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