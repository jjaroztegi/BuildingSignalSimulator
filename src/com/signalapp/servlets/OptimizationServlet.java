package com.signalapp.servlets;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.signalapp.dao.*;
import com.signalapp.models.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class OptimizationServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String idConfiguracion = request.getParameter("id_configuraciones");
        String idFrecuencia = request.getParameter("id_frecuencias");

        // Log the received parameters
        System.out.println("Received parameters - id_configuraciones: " + idConfiguracion + ", id_frecuencias: " + idFrecuencia);

        if (idConfiguracion == null || idFrecuencia == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            String errorMsg = "Missing required parameters";
            if (idConfiguracion == null) errorMsg += " (id_configuraciones)";
            if (idFrecuencia == null) errorMsg += " (id_frecuencias)";
            out.write("{\"error\":\"" + errorMsg + "\"}");
            return;
        }

        try {
            // Get configuration details
            ConfiguracionDAO configuracionDAO = new ConfiguracionDAO();
            Configuracion configuracion = configuracionDAO.findById(Integer.parseInt(idConfiguracion));

            if (configuracion == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.write("{\"error\":\"Configuration not found\"}");
                return;
            }

            // Get quality margins
            MargenCalidadDAO margenCalidadDAO = new MargenCalidadDAO();
            List<MargenCalidad> margenes = margenCalidadDAO.findAll();
            MargenCalidad margenCalidad = null;
            for (MargenCalidad m : margenes) {
                if ("TV".equals(m.getTipoSenal())) {
                    margenCalidad = m;
                    break;
                }
            }

            if (margenCalidad == null) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"error\":\"Quality margins not found\"}");
                return;
            }

            // Get available components
            List<Component> cables = getComponents("Cables");
            List<Component> derivadores = getComponents("Derivadores");
            List<Component> distribuidores = getComponents("Distribuidores");
            List<Component> amplificadores = getComponents("AmplificadoresRuidoBase");

            // Optimize configuration
            optimizeConfiguration(Integer.parseInt(idConfiguracion), configuracion.getNumPisos(),
                    configuracion.getNivelCabecera(), margenCalidad.getNivelMinimo(),
                    margenCalidad.getNivelMaximo(), Integer.parseInt(idFrecuencia),
                    cables, derivadores, distribuidores, amplificadores);

            out.write("{\"success\":\"Configuration optimized successfully\"}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    private List<Component> getComponents(String type) throws SQLException {
        List<Component> components = new ArrayList<>();
        ComponenteDAO componenteDAO = new ComponenteDAO();

        switch (type) {
            case "Cables":
                CableDAO cableDAO = new CableDAO();
                for (Cable cable : cableDAO.findAll()) {
                    Componente componente = componenteDAO.findById(cable.getIdComponente());
                    if (componente != null) {
                        components.add(new Component(cable.getIdCable(), componente.getCosto()));
                    }
                }
                break;
            case "Derivadores":
                DerivadorDAO derivadorDAO = new DerivadorDAO();
                for (Derivador derivador : derivadorDAO.findAll()) {
                    Componente componente = componenteDAO.findById(derivador.getIdComponente());
                    if (componente != null) {
                        components.add(new Component(derivador.getIdDerivador(), componente.getCosto()));
                    }
                }
                break;
            case "Distribuidores":
                DistribuidorDAO distribuidorDAO = new DistribuidorDAO();
                for (Distribuidor distribuidor : distribuidorDAO.findAll()) {
                    Componente componente = componenteDAO.findById(distribuidor.getIdComponente());
                    if (componente != null) {
                        components.add(new Component(distribuidor.getIdDistribuidor(), componente.getCosto()));
                    }
                }
                break;
            case "AmplificadoresRuidoBase":
                AmplificadorRuidoBaseDAO amplificadorDAO = new AmplificadorRuidoBaseDAO();
                for (AmplificadorRuidoBase amplificador : amplificadorDAO.findAll()) {
                    Componente componente = componenteDAO.findById(amplificador.getIdComponente());
                    if (componente != null) {
                        components.add(new Component(amplificador.getIdAmplificadorRuidoBase(), componente.getCosto()));
                    }
                }
                break;
        }
        return components;
    }

    private void optimizeConfiguration(int idConfiguracion, int numPisos,
            double nivelCabecera, double nivelMinimo, double nivelMaximo, int idFrecuencia,
            List<Component> cables, List<Component> derivadores, List<Component> distribuidores,
            List<Component> amplificadores) throws SQLException {

        DetalleConfiguracionDAO detalleConfiguracionDAO = new DetalleConfiguracionDAO();
        double currentSignal = nivelCabecera;

        // First, delete existing details for this configuration
        List<DetalleConfiguracion> existingDetails = detalleConfiguracionDAO.findByConfiguracionId(idConfiguracion);
        for (DetalleConfiguracion detail : existingDetails) {
            detalleConfiguracionDAO.delete(detail.getIdDetalle());
        }

        // Format current date in a format the database can understand
        java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String currentDate = sdf.format(new java.util.Date());

        for (int piso = 1; piso <= numPisos; piso++) {
            // Select components based on signal level
            Component cable = selectOptimalComponent(cables);
            Component derivador = selectOptimalComponent(derivadores);
            Component distribuidor = selectOptimalComponent(distribuidores);
            Component amplificador = selectOptimalComponent(amplificadores);

            // Calculate signal level after components
            currentSignal = calculateSignalLevel(currentSignal, cable, derivador,
                    distribuidor, amplificador, idFrecuencia);

            // Create or update detail configuration
            DetalleConfiguracion detalle = new DetalleConfiguracion();
            detalle.setIdConfiguracion(idConfiguracion);
            detalle.setPiso(piso);
            detalle.setIdCable(cable.id);
            detalle.setLongitudCable(10.0); // Default cable length
            detalle.setIdDerivador(derivador.id);
            detalle.setIdDistribuidor(distribuidor.id);
            detalle.setIdAmplificadorRuidoBase(amplificador.id);
            detalle.setNivelSenal(currentSignal);
            detalle.setFechaCalculo(currentDate);

            detalleConfiguracionDAO.insert(detalle);
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

    private String escapeJson(String input) {
        StringBuilder sb = new StringBuilder();
        for (char c : input.toCharArray()) {
            switch (c) {
                case '"':
                    sb.append("\\\"");
                    break;
                case '\\':
                    sb.append("\\\\");
                    break;
                case '\b':
                    sb.append("\\b");
                    break;
                case '\f':
                    sb.append("\\f");
                    break;
                case '\n':
                    sb.append("\\n");
                    break;
                case '\r':
                    sb.append("\\r");
                    break;
                case '\t':
                    sb.append("\\t");
                    break;
                default:
                    if (c < ' ') {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
            }
        }
        return sb.toString();
    }
}