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
import java.util.ArrayList;
import java.util.List;

public class OptimizationServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String idConfiguracion = request.getParameter("id_configuracion");
        String idFrecuencia = request.getParameter("id_frecuencia");

        if (idConfiguracion == null || idFrecuencia == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Missing required parameters\"}");
            return;
        }

        try (Connection connection = new AccessConnection().getConnection()) {
            connection.setAutoCommit(false);

            // Get configuration details
            String configQuery = "SELECT nivel_cabecera, num_pisos FROM Configuraciones WHERE id_configuracion = ?";
            try (PreparedStatement configStmt = connection.prepareStatement(configQuery)) {
                configStmt.setInt(1, Integer.parseInt(idConfiguracion));
                ResultSet configRs = configStmt.executeQuery();

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
                    ResultSet marginsRs = marginsStmt.executeQuery();
                    if (!marginsRs.next()) {
                        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        out.write("{\"error\":\"Quality margins not found\"}");
                        return;
                    }

                    double nivelMinimo = marginsRs.getDouble("nivel_minimo");
                    double nivelMaximo = marginsRs.getDouble("nivel_maximo");

                    // Get available components
                    List<Component> cables = getComponents(connection, "Cables", "id_cable");
                    List<Component> derivadores = getComponents(connection, "Derivadores", "id_derivador");
                    List<Component> distribuidores = getComponents(connection, "Distribuidores", "id_distribuidor");
                    List<Component> amplificadores = getComponents(connection, "AmplificadoresRuidoBase",
                            "id_amplificador_ruido_base");

                    // Optimize configuration
                    optimizeConfiguration(connection, Integer.parseInt(idConfiguracion), numPisos, nivelCabecera,
                            nivelMinimo, nivelMaximo, Integer.parseInt(idFrecuencia),
                            cables, derivadores, distribuidores, amplificadores);

                    connection.commit();
                    out.write("{\"success\":\"Configuration optimized successfully\"}");
                }
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    private List<Component> getComponents(Connection connection, String table, String idColumn) throws SQLException {
        List<Component> components = new ArrayList<>();
        String query = "SELECT " + idColumn + ", c.costo FROM " + table + " t " +
                "JOIN Componentes c ON t.id_componente = c.id_componente";

        try (PreparedStatement stmt = connection.prepareStatement(query)) {
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                components.add(new Component(rs.getInt(1), rs.getDouble(2)));
            }
        }
        return components;
    }

    private void optimizeConfiguration(Connection connection, int idConfiguracion, int numPisos,
            double nivelCabecera, double nivelMinimo, double nivelMaximo, int idFrecuencia,
            List<Component> cables, List<Component> derivadores, List<Component> distribuidores,
            List<Component> amplificadores) throws SQLException {

        // This is a simplified optimization approach
        // In a real implementation, you would use a more sophisticated algorithm
        // to find the optimal combination of components

        String updateQuery = "UPDATE DetalleConfiguracion SET " +
                "id_cable = ?, longitud_cable = ?, " +
                "id_derivador = ?, id_distribuidor = ?, " +
                "id_amplificador_ruido_base = ?, nivel_senal = ?, " +
                "fecha_calculo = Now() " +
                "WHERE id_configuracion = ? AND piso = ?";

        try (PreparedStatement updateStmt = connection.prepareStatement(updateQuery)) {
            double currentSignal = nivelCabecera;

            for (int piso = 1; piso <= numPisos; piso++) {
                // Select components based on signal level
                Component cable = selectOptimalComponent(cables);
                Component derivador = selectOptimalComponent(derivadores);
                Component distribuidor = selectOptimalComponent(distribuidores);
                Component amplificador = selectOptimalComponent(amplificadores);

                // Calculate signal level after components
                currentSignal = calculateSignalLevel(currentSignal, cable, derivador,
                        distribuidor, amplificador, idFrecuencia);

                // Update database
                updateStmt.setInt(1, cable.id);
                updateStmt.setDouble(2, 10.0); // Default cable length
                updateStmt.setInt(3, derivador.id);
                updateStmt.setInt(4, distribuidor.id);
                updateStmt.setInt(5, amplificador.id);
                updateStmt.setDouble(6, currentSignal);
                updateStmt.setInt(7, idConfiguracion);
                updateStmt.setInt(8, piso);
                updateStmt.addBatch();
            }

            updateStmt.executeBatch();
        }
    }

    private Component selectOptimalComponent(List<Component> components) {
        // Simple selection: choose the component with lowest cost
        return components.stream()
                .min((c1, c2) -> Double.compare(c1.cost, c2.cost))
                .orElseThrow(() -> new RuntimeException("No components available"));
    }

    private double calculateSignalLevel(double inputSignal, Component cable, Component derivador,
            Component distribuidor, Component amplificador, int idFrecuencia) {
        // Simplified signal level calculation
        // In a real implementation, you would use the actual component properties
        // and calculate the exact signal level based on attenuation/gain values
        return inputSignal - 5.0; // Placeholder calculation
    }

    private static class Component {
        int id;
        double cost;

        Component(int id, double cost) {
            this.id = id;
            this.cost = cost;
        }
    }
}