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
import java.sql.SQLException;

public class ConfigurationServlet extends HttpServlet {

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

        try (Connection connection = DatabaseConnection.getAccessConnection()) {
            String insertConfigQuery = "INSERT INTO Configuraciones (nombre, nivel_cabecera, num_pisos, fecha_creacion, usuario_creacion) VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'system')";
            try (PreparedStatement preparedStatement = connection.prepareStatement(insertConfigQuery)) {
                preparedStatement.setString(1, nombre);
                preparedStatement.setDouble(2, Double.parseDouble(nivelCabecera));
                preparedStatement.setInt(3, Integer.parseInt(numPisos));
                preparedStatement.executeUpdate();
            }

            out.write("{\"success\":\"Configuration created successfully\"}");
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

        // Placeholder for configuration retrieval logic
        out.write("[{\"id\":1,\"name\":\"Config A\"},{\"id\":2,\"name\":\"Config B\"}]");
    }
}