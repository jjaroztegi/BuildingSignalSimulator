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

public class SimulationServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String idDetalle = request.getParameter("id_detalle");
        String longitudCable = request.getParameter("longitud_cable");

        if (idDetalle == null || longitudCable == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Missing parameters\"}");
            return;
        }

        try (Connection connection = DatabaseConnection.getAccessConnection()) {
            String updateQuery = "UPDATE DetalleConfiguracion SET longitud_cable = ? WHERE id_detalle = ?";
            try (PreparedStatement updateStatement = connection.prepareStatement(updateQuery)) {
                updateStatement.setDouble(1, Double.parseDouble(longitudCable));
                updateStatement.setInt(2, Integer.parseInt(idDetalle));
                updateStatement.executeUpdate();
            }

            String recalculateQuery = "SELECT piso, nivel_senal - (? / 100) * atenuacion_100m AS nivel_final FROM DetalleConfiguracion d JOIN Cables c ON d.id_cable = c.id_cable JOIN AtenuacionesCable a ON c.id_cable = a.id_cable WHERE id_detalle = ?";
            try (PreparedStatement recalculateStatement = connection.prepareStatement(recalculateQuery)) {
                recalculateStatement.setDouble(1, Double.parseDouble(longitudCable));
                recalculateStatement.setInt(2, Integer.parseInt(idDetalle));
                ResultSet resultSet = recalculateStatement.executeQuery();

                if (resultSet.next()) {
                    out.write(String.format("{\"piso\":%d,\"nivel_final\":%.2f}", resultSet.getInt("piso"),
                            resultSet.getDouble("nivel_final")));
                }
            }
        } catch (SQLException | ClassNotFoundException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try (Connection connection = DatabaseConnection.getAccessConnection()) {
            String query = "SELECT piso, nivel_senal FROM DetalleConfiguracion ORDER BY piso";
            try (PreparedStatement stmt = connection.prepareStatement(query)) {
                ResultSet rs = stmt.executeQuery();
                StringBuilder jsonBuilder = new StringBuilder("[");
                boolean first = true;

                while (rs.next()) {
                    if (!first) {
                        jsonBuilder.append(",");
                    }
                    first = false;
                    jsonBuilder.append(String.format("{\"piso\":%d,\"nivel_senal\":%.2f}", rs.getInt("piso"),
                            rs.getDouble("nivel_senal")));
                }

                jsonBuilder.append("]");
                out.write(jsonBuilder.toString());
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}