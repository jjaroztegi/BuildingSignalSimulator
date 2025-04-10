package com.example;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.*;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DatabaseInfoServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        Connection connection = null;
        ResultSet tables = null;
        String dbType = "Unknown";
        String driverClass = null;
        String connectionString = null;
        String schema = "APP"; // Default schema for user tables in Derby
        String[] tableTypes = null;

        String requestUri = request.getRequestURI();

        out.println("<html>");
        out.println("<body>");

        try {
            if (requestUri.endsWith("/dbtables_access")) {
                dbType = "MS Access";
                driverClass = "net.ucanaccess.jdbc.UcanaccessDriver";
                String dbPath = getServletContext().getRealPath("/WEB-INF/database/signal_distribution.accdb");
                connectionString = "jdbc:ucanaccess://" + dbPath;
                tableTypes = new String[] { "TABLE" }; // UCanAccess uses TABLE type
                // MS Access doesn't use schemas in the same way; set schema to null
                schema = null;
            } else if (requestUri.endsWith("/dbtables_derby")) {
                dbType = "Derby";
                driverClass = "org.apache.derby.jdbc.EmbeddedDriver";
                String dbPath = "database/signal_distribution"; // Relative path to Derby DB folder
                connectionString = "jdbc:derby:" + dbPath;
                tableTypes = null; // Derby uses null for default table types
            } else {
                out.println("<h1>Error: Unknown database request</h1>");
                out.println("</body></html>");
                return;
            }

            out.println("<h1>Table Names (" + dbType + ")</h1>");

            Class.forName(driverClass);
            connection = DriverManager.getConnection(connectionString);
            DatabaseMetaData metadata = connection.getMetaData();
            tables = metadata.getTables(null, schema, "%", tableTypes);

            while (tables.next()) {
                String tableName = tables.getString("TABLE_NAME");
                if (tableName != null) {
                     out.println(tableName + "<br>");
                }
            }

        } catch (Exception e) {
            out.println("Error: " + e.getMessage());
        }

        out.println("</body>");
        out.println("</html>");
    }
}