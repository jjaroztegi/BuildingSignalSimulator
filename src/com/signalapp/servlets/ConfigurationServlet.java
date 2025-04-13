package com.signalapp.servlets;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.signalapp.dao.AccessConnection;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class ConfigurationServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try (Connection connection = new AccessConnection().getConnection()) {
            String query = "SELECT id_configuracion, nombre, nivel_cabecera, num_pisos, costo_total FROM Configuraciones";
            try (PreparedStatement stmt = connection.prepareStatement(query)) {
                try (ResultSet rs = stmt.executeQuery()) {
                    StringBuilder jsonBuilder = new StringBuilder("[");
                    boolean first = true;
                    while (rs.next()) {
                        if (!first) {
                            jsonBuilder.append(",");
                        }
                        first = false;
                        jsonBuilder.append(String.format(
                                "{\"id\":%d,\"nombre\":\"%s\",\"nivel_cabecera\":%.2f,\"num_pisos\":%d,\"costo_total\":%.2f}",
                                rs.getInt("id_configuracion"),
                                escapeJson(rs.getString("nombre")),
                                rs.getDouble("nivel_cabecera"),
                                rs.getInt("num_pisos"),
                                rs.getDouble("costo_total")));
                    }
                    jsonBuilder.append("]");
                    out.write(jsonBuilder.toString());
                }
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String nombre = request.getParameter("nombre");
        String nivelCabecera = request.getParameter("nivel_cabecera");
        String numPisos = request.getParameter("num_pisos");

        if (nombre == null || nivelCabecera == null || numPisos == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Missing required parameters\"}");
            return;
        }

        try (Connection connection = new AccessConnection().getConnection()) {
            connection.setAutoCommit(false);

            String query = "INSERT INTO Configuraciones (nombre, nivel_cabecera, num_pisos, costo_total) VALUES (?, ?, ?, 0)";
            try (PreparedStatement stmt = connection.prepareStatement(query)) {
                stmt.setString(1, nombre);
                stmt.setDouble(2, Double.parseDouble(nivelCabecera));
                stmt.setInt(3, Integer.parseInt(numPisos));
                stmt.executeUpdate();

                // Get the generated ID
                try (PreparedStatement idStmt = connection
                        .prepareStatement("SELECT MAX(id_configuracion) FROM Configuraciones")) {
                    try (ResultSet rs = idStmt.executeQuery()) {
                        if (rs.next()) {
                            int idConfiguracion = rs.getInt(1);
                            connection.commit();
                            out.write("{\"success\":\"Configuration created successfully\",\"id\":" + idConfiguracion
                                    + "}");
                        } else {
                            throw new SQLException("Could not retrieve configuration ID");
                        }
                    }
                }
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String idConfiguracion = request.getParameter("id_configuracion");
        String nombre = request.getParameter("nombre");
        String nivelCabecera = request.getParameter("nivel_cabecera");
        String numPisos = request.getParameter("num_pisos");

        if (idConfiguracion == null || nombre == null || nivelCabecera == null || numPisos == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Missing required parameters\"}");
            return;
        }

        try (Connection connection = new AccessConnection().getConnection()) {
            connection.setAutoCommit(false);

            String query = "UPDATE Configuraciones SET nombre = ?, nivel_cabecera = ?, num_pisos = ? WHERE id_configuracion = ?";
            try (PreparedStatement stmt = connection.prepareStatement(query)) {
                stmt.setString(1, nombre);
                stmt.setDouble(2, Double.parseDouble(nivelCabecera));
                stmt.setInt(3, Integer.parseInt(numPisos));
                stmt.setInt(4, Integer.parseInt(idConfiguracion));
                int rows = stmt.executeUpdate();

                if (rows == 0) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.write("{\"error\":\"Configuration not found\"}");
                    return;
                }

                connection.commit();
                out.write("{\"success\":\"Configuration updated successfully\"}");
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String idConfiguracion = request.getParameter("id_configuracion");
        if (idConfiguracion == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Missing configuration ID\"}");
            return;
        }

        try (Connection connection = new AccessConnection().getConnection()) {
            connection.setAutoCommit(false);

            String query = "DELETE FROM Configuraciones WHERE id_configuracion = ?";
            try (PreparedStatement stmt = connection.prepareStatement(query)) {
                stmt.setInt(1, Integer.parseInt(idConfiguracion));
                int rows = stmt.executeUpdate();

                if (rows == 0) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.write("{\"error\":\"Configuration not found\"}");
                    return;
                }

                connection.commit();
                out.write("{\"success\":\"Configuration deleted successfully\"}");
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    private String escapeJson(String input) {
        if (input == null)
            return "";
        return input.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}