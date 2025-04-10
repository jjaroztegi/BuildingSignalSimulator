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

public class SignalCalculationServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String idConfiguracion = request.getParameter("id_configuracion");

        if (idConfiguracion == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Missing id_configuracion\"}");
            return;
        }

        try (Connection connection = DatabaseConnection.getAccessConnection()) {
            String query = "SELECT piso, nivel_senal FROM DetalleConfiguracion WHERE id_configuracion = ? ORDER BY piso";
            try (PreparedStatement stmt = connection.prepareStatement(query)) {
                stmt.setInt(1, Integer.parseInt(idConfiguracion));
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
        } catch (SQLException | ClassNotFoundException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}