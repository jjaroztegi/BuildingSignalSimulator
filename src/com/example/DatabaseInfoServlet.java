package com.example;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class DatabaseInfoServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        out.println("<html>");
        out.println("<body>");
        out.println("<h1>Table Names</h1>");

        try {
            Class.forName("net.ucanaccess.jdbc.UcanaccessDriver");
            String dbPath = getServletContext().getRealPath("/WEB-INF/database/signal_distribution.accdb");
            String connectionString = "jdbc:ucanaccess://" + dbPath;
            Connection connection = DriverManager.getConnection(connectionString);
            DatabaseMetaData metadata = connection.getMetaData();
            ResultSet tables = metadata.getTables(null, null, "%", new String[] { "TABLE" });

            while (tables.next()) {
                out.println(tables.getString("TABLE_NAME") + "<br>");
            }

            tables.close();
            connection.close();

        } catch (Exception e) {
            out.println("Error: " + e.getMessage());
        }

        out.println("</body>");
        out.println("</html>");
    }
}