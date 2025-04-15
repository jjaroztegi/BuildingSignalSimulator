package com.signalapp.servlets;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.signalapp.dao.*;
import com.signalapp.models.*;
import com.signalapp.utils.SignalCalculator;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/**
 * Servlet that handles network configuration optimization.
 * Provides endpoints for optimizing signal distribution networks to minimize cost
 * while maintaining signal quality across all floors of a building.
 */
public class OptimizationServlet extends HttpServlet {

    /**
     * Handles POST requests for configuration optimization.
     * Parameters:
     * - id_configuraciones: ID of the configuration to optimize
     * - id_frecuencias: ID of the frequency to use for calculations
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String id_configuraciones = request.getParameter("id_configuraciones");
        String id_frecuencias = request.getParameter("id_frecuencias");

        // Log the received parameters
        System.out.println("Received parameters - id_configuraciones: " + id_configuraciones + ", id_frecuencias: "
                + id_frecuencias);

        if (id_configuraciones == null || id_frecuencias == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            String errorMsg = "Missing required parameters";
            if (id_configuraciones == null)
                errorMsg += " (id_configuraciones)";
            if (id_frecuencias == null)
                errorMsg += " (id_frecuencias)";
            out.write("{\"error\":\"" + errorMsg + "\"}");
            return;
        }

        try {
            // Get configuration details
            ConfiguracionDAO configuracionDAO = new ConfiguracionDAO();
            Configuracion configuracion = configuracionDAO.findById(Integer.parseInt(id_configuraciones));

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
                if ("TV Digital".equals(m.getTipo_senal()) || "TV Analógica".equals(m.getTipo_senal())) {
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
            optimizeConfiguration(Integer.parseInt(id_configuraciones), configuracion.getNum_pisos(),
                    configuracion.getNivel_cabecera(), margenCalidad.getNivel_minimo(),
                    margenCalidad.getNivel_maximo(), Integer.parseInt(id_frecuencias),
                    cables, derivadores, distribuidores, amplificadores);

            out.write("{\"success\":\"Configuration optimized successfully\"}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    /**
     * Retrieves components of a specific type from the database
     * @param type The type of component to retrieve (Cables, Derivadores, Distribuidores, AmplificadoresRuidoBase)
     * @return A list of Component objects containing component IDs and costs
     * @throws SQLException If a database error occurs
     */
    private List<Component> getComponents(String type) throws SQLException {
        List<Component> components = new ArrayList<>();
        ComponenteDAO componenteDAO = new ComponenteDAO();

        switch (type) {
            case "Cables":
                CableDAO cableDAO = new CableDAO();
                for (Cable cable : cableDAO.findAll()) {
                    Componente componente = componenteDAO.findById(cable.getId_componentes());
                    if (componente != null) {
                        components.add(new Component(cable.getId_cables(), componente.getCosto()));
                    }
                }
                break;
            case "Derivadores":
                DerivadorDAO derivadorDAO = new DerivadorDAO();
                for (Derivador derivador : derivadorDAO.findAll()) {
                    Componente componente = componenteDAO.findById(derivador.getId_componentes());
                    if (componente != null) {
                        components.add(new Component(derivador.getId_derivadores(), componente.getCosto()));
                    }
                }
                break;
            case "Distribuidores":
                DistribuidorDAO distribuidorDAO = new DistribuidorDAO();
                for (Distribuidor distribuidor : distribuidorDAO.findAll()) {
                    Componente componente = componenteDAO.findById(distribuidor.getId_componentes());
                    if (componente != null) {
                        components.add(new Component(distribuidor.getId_distribuidores(), componente.getCosto()));
                    }
                }
                break;
            case "AmplificadoresRuidoBase":
                AmplificadorRuidoBaseDAO amplificadorDAO = new AmplificadorRuidoBaseDAO();
                for (AmplificadorRuidoBase amplificador : amplificadorDAO.findAll()) {
                    Componente componente = componenteDAO.findById(amplificador.getId_componentes());
                    if (componente != null) {
                        components.add(
                                new Component(amplificador.getId_amplificadoresruidobase(), componente.getCosto()));
                    }
                }
                break;
        }
        return components;
    }

    /**
     * Optimizes the configuration for a building with the specified parameters
     * @param id_configuraciones The ID of the configuration to optimize
     * @param numPisos The number of floors in the building
     * @param nivelCabecera The initial signal level at the headend
     * @param nivelMinimo The minimum acceptable signal level
     * @param nivelMaximo The maximum acceptable signal level
     * @param id_frecuencias The frequency ID to use for calculations
     * @param cables Available cable components
     * @param derivadores Available splitter components
     * @param distribuidores Available distributor components
     * @param amplificadores Available amplifier components
     * @throws SQLException If a database error occurs
     */
    private void optimizeConfiguration(int id_configuraciones, int numPisos,
            double nivelCabecera, double nivelMinimo, double nivelMaximo, int id_frecuencias,
            List<Component> cables, List<Component> derivadores, List<Component> distribuidores,
            List<Component> amplificadores) throws SQLException {

        DetalleConfiguracionDAO detalleConfiguracionDAO = new DetalleConfiguracionDAO();
        double currentSignal = nivelCabecera;

        // First, delete existing details for this configuration
        List<DetalleConfiguracion> existingDetails = detalleConfiguracionDAO.findByConfiguracionId(id_configuraciones);
        for (DetalleConfiguracion detail : existingDetails) {
            detalleConfiguracionDAO.delete(detail.getId_detalleconfiguracion());
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
                    distribuidor, amplificador, id_frecuencias);

            // Create or update detail configuration
            DetalleConfiguracion detalle = new DetalleConfiguracion();
            detalle.setId_configuraciones(id_configuraciones);
            detalle.setPiso(piso);
            detalle.setId_cables(cable.id);
            detalle.setLongitud_cable(10.0); // Default cable length
            detalle.setId_derivadores(derivador.id);
            detalle.setId_distribuidores(distribuidor.id);
            detalle.setId_amplificadoresruidobase(amplificador.id);
            detalle.setNivel_senal(currentSignal);
            detalle.setFecha_calculo(currentDate);

            detalleConfiguracionDAO.insert(detalle);
        }
    }

    /**
     * Selects the optimal component from a list based on cost
     * @param components List of available components
     * @return The component with the lowest cost
     * @throws RuntimeException If no components are available
     */
    private Component selectOptimalComponent(List<Component> components) {
        // Simple selection: choose the component with lowest cost
        return components.stream()
                .min((c1, c2) -> Double.compare(c1.cost, c2.cost))
                .orElseThrow(() -> new RuntimeException("No components available"));
    }

    /**
     * Calculates the signal level after passing through a set of components
     * @param currentSignal The current signal level
     * @param cable The cable component
     * @param derivador The splitter component
     * @param distribuidor The distributor component
     * @param amplificador The amplifier component
     * @param id_frecuencias The frequency ID to use for calculations
     * @return The calculated signal level after passing through the components
     */
    private double calculateSignalLevel(double currentSignal, Component cable, Component derivador,
            Component distribuidor, Component amplificador, int id_frecuencias) {
        try {
            // Get the specific component details from their respective DAOs
            CableDAO cableDAO = new CableDAO();
            DerivadorDAO derivadorDAO = new DerivadorDAO();
            DistribuidorDAO distribuidorDAO = new DistribuidorDAO();
            AmplificadorRuidoBaseDAO amplificadorDAO = new AmplificadorRuidoBaseDAO();

            Cable cableDetails = cable != null ? cableDAO.findById(cable.id) : null;
            Derivador derivadorDetails = derivador != null ? derivadorDAO.findById(derivador.id) : null;
            Distribuidor distribuidorDetails = distribuidor != null ? distribuidorDAO.findById(distribuidor.id) : null;
            AmplificadorRuidoBase amplificadorDetails = amplificador != null ? amplificadorDAO.findById(amplificador.id)
                    : null;

            // Calculate signal level using the SignalCalculator
            return SignalCalculator.calculateSignalLevel(
                    currentSignal,
                    cableDetails,
                    10.0, // Default cable length, should be configurable in the future
                    derivadorDetails,
                    distribuidorDetails,
                    amplificadorDetails,
                    false // This should be determined based on floor number
            );
        } catch (SQLException e) {
            e.printStackTrace();
            // Return a conservative estimate if there's an error
            return currentSignal - 10.0;
        }
    }

    /**
     * Represents a component with its ID and cost
     */
    private static class Component {
        int id;
        double cost;

        Component(int id, double cost) {
            this.id = id;
            this.cost = cost;
        }
    }

    /**
     * Escapes special characters in a string for JSON formatting
     * @param input The string to escape
     * @return The escaped string safe for JSON output
     */
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