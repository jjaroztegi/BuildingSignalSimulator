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

public class QualityValidationServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
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
            // Get configuration details
            String configQuery = "SELECT nivel_cabecera, num_pisos FROM Configuraciones WHERE id_configuracion = ?";
            try (PreparedStatement configStmt = connection.prepareStatement(configQuery)) {
                configStmt.setInt(1, Integer.parseInt(idConfiguracion));
                try (ResultSet configRs = configStmt.executeQuery()) {
                    if (!configRs.next()) {
                        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                        out.write("{\"error\":\"Configuration not found\"}");
                        return;
                    }

                    double nivelCabecera = configRs.getDouble("nivel_cabecera");
                    int numPisos = configRs.getInt("num_pisos");

                    // Get quality margins
                    String marginsQuery = "SELECT nivel_minimo, nivel_maximo FROM MargenesCalidad WHERE tipo_senal = 'TV'";
                    try (PreparedStatement marginsStmt = connection.prepareStatement(marginsQuery)) {
                        try (ResultSet marginsRs = marginsStmt.executeQuery()) {
                            if (!marginsRs.next()) {
                                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                                out.write("{\"error\":\"Quality margins not found\"}");
                                return;
                            }

                            double nivelMinimo = marginsRs.getDouble("nivel_minimo");
                            double nivelMaximo = marginsRs.getDouble("nivel_maximo");

                            // Build response
                            StringBuilder jsonBuilder = new StringBuilder("{");
                            jsonBuilder.append("\"nivel_cabecera\":").append(nivelCabecera).append(",");
                            jsonBuilder.append("\"num_pisos\":").append(numPisos).append(",");
                            jsonBuilder.append("\"nivel_minimo\":").append(nivelMinimo).append(",");
                            jsonBuilder.append("\"nivel_maximo\":").append(nivelMaximo);
                            jsonBuilder.append("}");

                            out.write(jsonBuilder.toString());
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
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String tipoSenal = request.getParameter("tipo_senal");
        String nivelMinimo = request.getParameter("nivel_minimo");
        String nivelMaximo = request.getParameter("nivel_maximo");

        if (tipoSenal == null || nivelMinimo == null || nivelMaximo == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Missing required parameters\"}");
            return;
        }

        try (Connection connection = new AccessConnection().getConnection()) {
            connection.setAutoCommit(false);

            String query = "INSERT INTO MargenesCalidad (tipo_senal, nivel_minimo, nivel_maximo) VALUES (?, ?, ?)";
            try (PreparedStatement stmt = connection.prepareStatement(query)) {
                stmt.setString(1, tipoSenal);
                stmt.setDouble(2, Double.parseDouble(nivelMinimo));
                stmt.setDouble(3, Double.parseDouble(nivelMaximo));
                stmt.executeUpdate();
                connection.commit();
                out.write("{\"success\":\"Quality margins added successfully\"}");
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}