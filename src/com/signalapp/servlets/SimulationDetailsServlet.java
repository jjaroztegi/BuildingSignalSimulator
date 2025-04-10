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

public class SimulationDetailsServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try (Connection connection = DatabaseConnection.getAccessConnection()) {
            // First check if there's any active configuration
            String checkQuery = "SELECT COUNT(*) as count FROM Configuraciones";
            try (PreparedStatement checkStmt = connection.prepareStatement(checkQuery)) {
                ResultSet checkResult = checkStmt.executeQuery();
                if (checkResult.next() && checkResult.getInt("count") == 0) {
                    // No configurations exist yet
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.write("{\"message\": \"No active configuration found\"}");
                    return;
                }
            }

            // If we get here, we have at least one configuration
            // For now, we'll use the most recent configuration
            String query = "SELECT dc.piso, dc.nivel_senal as nivel_final " +
                         "FROM DetalleConfiguracion dc " +
                         "INNER JOIN Configuraciones c ON dc.id_configuracion = c.id_configuracion " +
                         "ORDER BY c.fecha_creacion DESC, dc.piso";

            try (PreparedStatement stmt = connection.prepareStatement(query)) {
                ResultSet rs = stmt.executeQuery();
                
                StringBuilder jsonBuilder = new StringBuilder("[");
                boolean first = true;
                
                while (rs.next()) {
                    if (!first) {
                        jsonBuilder.append(",");
                    }
                    first = false;
                    
                    jsonBuilder.append(String.format(
                        "{\"piso\":%d,\"nivel_final\":%.2f}",
                        rs.getInt("piso"),
                        rs.getDouble("nivel_final")
                    ));
                }
                
                jsonBuilder.append("]");
                out.write(jsonBuilder.toString());
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + e.getMessage() + "\"}");
            e.printStackTrace();
        }
    }
}