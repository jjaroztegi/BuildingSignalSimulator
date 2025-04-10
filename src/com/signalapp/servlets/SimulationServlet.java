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
            out.write("{\"error\":\"Missing required parameters\"}");
            return;
        }

        try (Connection connection = DatabaseConnection.getAccessConnection()) {
            // Update the cable length in DetalleConfiguracion
            String updateQuery = "UPDATE DetalleConfiguracion SET longitud_cable = ? WHERE id_detalle = ?";
            try (PreparedStatement updateStatement = connection.prepareStatement(updateQuery)) {
                updateStatement.setDouble(1, Double.parseDouble(longitudCable));
                updateStatement.setInt(2, Integer.parseInt(idDetalle));
                updateStatement.executeUpdate();
            }

            // Recalculate signal levels for the affected floor and subsequent floors
            String recalculateQuery = "SELECT d.piso, c.longitud_cable, a.atenuacion_100m, d.nivel_senal " +
                    "FROM DetalleConfiguracion d " +
                    "JOIN Cables c ON d.id_cable = c.id_cable " +
                    "JOIN AtenuacionesCable a ON c.id_cable = a.id_cable " +
                    "WHERE d.id_detalle = ?";

            try (PreparedStatement recalculateStatement = connection.prepareStatement(recalculateQuery)) {
                recalculateStatement.setInt(1, Integer.parseInt(idDetalle));
                ResultSet resultSet = recalculateStatement.executeQuery();

                StringBuilder jsonResult = new StringBuilder("[");
                boolean first = true;

                while (resultSet.next()) {
                    if (!first) {
                        jsonResult.append(",");
                    }
                    first = false;

                    int piso = resultSet.getInt("piso");
                    double updatedLongitudCable = resultSet.getDouble("longitud_cable");
                    double atenuacion100m = resultSet.getDouble("atenuacion_100m");
                    double nivelSenal = resultSet.getDouble("nivel_senal");

                    double atenuacionTotal = (updatedLongitudCable / 100) * atenuacion100m;
                    double nivelFinal = nivelSenal - atenuacionTotal;

                    jsonResult.append(String.format("{\"piso\":%d,\"nivel_final\":%.2f}", piso, nivelFinal));
                }

                jsonResult.append("]");
                out.write(jsonResult.toString());
            }
        } catch (SQLException | ClassNotFoundException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}