package com.signalapp.servlets;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.signalapp.dao.DatabaseConnection;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class ConfigurationServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String nombre = request.getParameter("nombre");
        String nivelCabeceraStr = request.getParameter("nivel_cabecera");
        String numPisosStr = request.getParameter("num_pisos");
        String usuario = "system";

        // Basic Validation
        if (nombre == null || nombre.trim().isEmpty() || nivelCabeceraStr == null || numPisosStr == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Missing required parameters.\"}");
            return;
        }
        double nivelCabecera;
        int numPisos;
        try {
            nivelCabecera = Double.parseDouble(nivelCabeceraStr);
            numPisos = Integer.parseInt(numPisosStr);
            if (numPisos <= 0)
                throw new NumberFormatException("Floors must be positive.");
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Invalid number format: " + e.getMessage() + "\"}");
            return;
        }

        Connection connection = null;
        PreparedStatement insertConfigStmt = null;
        PreparedStatement insertDetailStmt = null;

        try {
            connection = DatabaseConnection.getAccessConnection();
            connection.setAutoCommit(false); // Transaction

            // 1. Insert Config
            String insertConfigQuery = "INSERT INTO Configuraciones (nombre, nivel_cabecera, num_pisos, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) VALUES (?, ?, ?, Now(), ?, Now(), ?)";
            insertConfigStmt = connection.prepareStatement(insertConfigQuery);
            insertConfigStmt.setString(1, nombre);
            insertConfigStmt.setDouble(2, nivelCabecera);
            insertConfigStmt.setInt(3, numPisos);
            insertConfigStmt.setString(4, usuario);
            insertConfigStmt.setString(5, usuario);
            int affectedRows = insertConfigStmt.executeUpdate();
            if (affectedRows == 0)
                throw new SQLException("Creating configuration failed, no rows affected.");
            insertConfigStmt.close(); // Close before getting MAX ID

            // Get ID using MAX() - More reliable for Access
            int configId;
            String getMaxIdQuery = "SELECT MAX(id_configuracion) FROM Configuraciones WHERE nombre = ?";
            try (PreparedStatement maxIdStmt = connection.prepareStatement(getMaxIdQuery)) {
                maxIdStmt.setString(1, nombre);
                ResultSet rs = maxIdStmt.executeQuery();
                if (rs.next() && !rs.wasNull()) {
                    configId = rs.getInt(1);
                } else {
                    throw new SQLException("Could not retrieve generated key using MAX().");
                }
            }

            // 2. Initialize Details
            String insertDetailQuery = "INSERT INTO DetalleConfiguracion (id_configuracion, piso, nivel_senal, fecha_calculo) VALUES (?, ?, ?, Now())";
            insertDetailStmt = connection.prepareStatement(insertDetailQuery);
            for (int piso = 1; piso <= numPisos; piso++) {
                insertDetailStmt.setInt(1, configId);
                insertDetailStmt.setInt(2, piso);
                insertDetailStmt.setDouble(3, nivelCabecera); // Baseline: initial signal = headend
                insertDetailStmt.addBatch();
            }
            insertDetailStmt.executeBatch();

            connection.commit();
            out.write("{\"success\":\"Configuration '" + nombre + "' created (ID: " + configId + ")\"}");

        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace(); // Log server-side
            if (connection != null) {
                try {
                    connection.rollback();
                } catch (SQLException ex) {
                    /* ignore rollback fail */ }
            }
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            String errorPrefix = (e instanceof ClassNotFoundException) ? "Driver/Dependency Error: "
                    : "Database Error: ";
            out.write("{\"error\":\"" + errorPrefix + e.getMessage().replace("\"", "'") + "\"}");
        } finally {
            try {
                if (insertConfigStmt != null && !insertConfigStmt.isClosed())
                    insertConfigStmt.close();
            } catch (SQLException e) {
                /* ignored */ }
            try {
                if (insertDetailStmt != null)
                    insertDetailStmt.close();
            } catch (SQLException e) {
                /* ignored */ }
            try {
                if (connection != null) {
                    connection.setAutoCommit(true);
                    connection.close();
                }
            } catch (SQLException e) {
                /* ignored */ }
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        // Simple GET response remains useful for testing mapping
        response.setContentType("application/json");
        response.getWriter().write("[{\"message\":\"ConfigurationServlet GET OK. Use POST to create.\"}]");
    }
}