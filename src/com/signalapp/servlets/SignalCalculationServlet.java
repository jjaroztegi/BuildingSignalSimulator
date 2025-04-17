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
import java.util.*;

/**
 * Servlet to handle signal calculations and validation for building
 * configurations
 */
public class SignalCalculationServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    /**
     * Handles POST requests to calculate signal levels and validate against margins
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try {
            // Parse request body
            StringBuilder body = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                body.append(line);
            }

            String json = body.toString();

            // Extract parameters
            int numPisos = extractIntValue(json, "num_pisos");
            double nivelCabecera = extractDoubleValue(json, "nivel_cabecera");
            String tipoSenal = extractStringValue(json, "tipo_senal");

            // Extract components array
            List<ComponentConfig> components = extractComponents(json);

            // Sort components by floor and validate configuration
            validateConfiguration(components);

            // Calculate signal levels and costs per floor
            Map<Integer, FloorSignalInfo> signalLevels = calculateSignalLevels(numPisos, nivelCabecera, components);

            // Calculate total cost
            double totalCost = 0.0;
            for (FloorSignalInfo info : signalLevels.values()) {
                totalCost += info.floorCost;
            }

            // Validate against margins
            MargenCalidadDAO margenDAO = new MargenCalidadDAO();
            List<MargenCalidad> margenes = margenDAO.findAll();
            double minLevel = Double.MAX_VALUE;
            double maxLevel = Double.MIN_VALUE;

            for (MargenCalidad margen : margenes) {
                if (margen.getTipo_senal().equals(tipoSenal)) {
                    minLevel = margen.getNivel_minimo();
                    maxLevel = margen.getNivel_maximo();
                    break;
                }
            }

            // Build response JSON
            StringBuilder jsonBuilder = new StringBuilder();
            jsonBuilder.append("{");
            jsonBuilder.append("\"signal_levels\":[");

            boolean first = true;
            for (Map.Entry<Integer, FloorSignalInfo> entry : signalLevels.entrySet()) {
                if (!first) {
                    jsonBuilder.append(",");
                }
                first = false;

                int floor = entry.getKey();
                FloorSignalInfo info = entry.getValue();
                String status = (info.finalLevel >= minLevel && info.finalLevel <= maxLevel) ? "ok" : "error";

                jsonBuilder.append("{");
                jsonBuilder.append("\"floor\":").append(floor).append(",");
                jsonBuilder.append("\"level\":").append(String.format("%.2f", info.finalLevel)).append(",");
                jsonBuilder.append("\"status\":\"").append(status).append("\",");
                jsonBuilder.append("\"floor_cost\":").append(String.format("%.2f", info.floorCost)).append(",");
                jsonBuilder.append("\"components\":[");

                boolean firstComp = true;
                for (ComponentEffect effect : info.componentEffects) {
                    if (!firstComp) {
                        jsonBuilder.append(",");
                    }
                    firstComp = false;

                    jsonBuilder.append("{");
                    jsonBuilder.append("\"type\":\"").append(effect.type).append("\",");
                    jsonBuilder.append("\"model\":\"").append(effect.model).append("\",");
                    jsonBuilder.append("\"attenuation\":").append(String.format("%.2f", effect.attenuation))
                            .append(",");
                    jsonBuilder.append("\"cost\":").append(String.format("%.2f", effect.cost));
                    jsonBuilder.append("}");
                }

                jsonBuilder.append("]");
                jsonBuilder.append("}");
            }

            jsonBuilder.append("],");
            jsonBuilder.append("\"margins\":{");
            jsonBuilder.append("\"min\":").append(minLevel).append(",");
            jsonBuilder.append("\"max\":").append(maxLevel);
            jsonBuilder.append("},");
            jsonBuilder.append("\"total_cost\":").append(String.format("%.2f", totalCost));
            jsonBuilder.append("}");

            out.write(jsonBuilder.toString());

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    /**
     * Validates the component configuration for logical errors
     */
    private void validateConfiguration(List<ComponentConfig> components) throws SQLException {
        Map<Integer, List<ComponentConfig>> componentsByFloor = new HashMap<>();

        // Group components by floor
        for (ComponentConfig config : components) {
            componentsByFloor.computeIfAbsent(config.floor, k -> new ArrayList<>()).add(config);
        }

        // Validate each floor's configuration
        for (Map.Entry<Integer, List<ComponentConfig>> entry : componentsByFloor.entrySet()) {
            List<ComponentConfig> floorComponents = entry.getValue();

            // Count component types
            int derivadores = 0;
            int distribuidores = 0;
            int tomas = 0;

            for (ComponentConfig comp : floorComponents) {
                switch (comp.type.toLowerCase()) {
                    case "derivador":
                        derivadores++;
                        break;
                    case "distribuidor":
                        distribuidores++;
                        break;
                    case "toma":
                        tomas++;
                        break;
                }
            }

            // Validation rules
            if (derivadores > 1) {
                throw new SQLException("Multiple derivadores on floor " + entry.getKey() + " are not allowed");
            }
            if (distribuidores > 1) {
                throw new SQLException("Multiple distribuidores on floor " + entry.getKey() + " are not allowed");
            }
            if (derivadores > 0 && distribuidores > 0) {
                throw new SQLException("Cannot have both derivador and distribuidor on floor " + entry.getKey());
            }
        }
    }

    /**
     * Calculates signal levels for each floor based on components and initial level
     */
    private Map<Integer, FloorSignalInfo> calculateSignalLevels(int numPisos, double nivelCabecera,
            List<ComponentConfig> components) throws SQLException {
        Map<Integer, FloorSignalInfo> levels = new HashMap<>();

        // Initialize all floors
        for (int i = 1; i <= numPisos; i++) {
            levels.put(i, new FloorSignalInfo(nivelCabecera));
        }

        // Group components by floor
        Map<Integer, List<ComponentConfig>> componentsByFloor = new HashMap<>();
        for (ComponentConfig config : components) {
            componentsByFloor.computeIfAbsent(config.floor, k -> new ArrayList<>()).add(config);
        }

        // Process each floor
        for (int floor = 1; floor <= numPisos; floor++) {
            List<ComponentConfig> floorComponents = componentsByFloor.getOrDefault(floor, new ArrayList<>());
            FloorSignalInfo info = levels.get(floor);
            double currentLevel = info.finalLevel;
            double floorCost = 0.0;

            // Process components in order: derivador/distribuidor first, then coaxial, then
            // toma
            for (String type : Arrays.asList("derivador", "distribuidor", "coaxial", "toma")) {
                for (ComponentConfig config : floorComponents) {
                    if (config.type.toLowerCase().equals(type)) {
                        ComponentInfo componentInfo = getComponentInfo(config);
                        currentLevel -= componentInfo.attenuation;
                        floorCost += componentInfo.cost;
                        info.componentEffects.add(new ComponentEffect(
                                config.type,
                                config.model,
                                componentInfo.attenuation,
                                componentInfo.cost));
                    }
                }
            }

            info.finalLevel = currentLevel;
            info.floorCost = floorCost;
        }

        return levels;
    }

    private static class ComponentInfo {
        double attenuation;
        double cost;

        ComponentInfo(double attenuation, double cost) {
            this.attenuation = attenuation;
            this.cost = cost;
        }
    }

    private ComponentInfo getComponentInfo(ComponentConfig config) throws SQLException {
        ComponenteDAO componenteDAO = new ComponenteDAO();
        Componente componente = componenteDAO.findByModelo(config.model);

        if (componente == null) {
            throw new SQLException("Component not found: " + config.model);
        }

        double attenuation;
        switch (config.type.toLowerCase()) {
            case "coaxial":
                CoaxialDAO coaxialDAO = new CoaxialDAO();
                Coaxial coaxial = coaxialDAO.findByComponenteId(componente.getId_componentes());
                attenuation = (coaxial.getAtenuacion_470mhz() + coaxial.getAtenuacion_694mhz()) / 2;
                break;

            case "derivador":
                DerivadorDAO derivadorDAO = new DerivadorDAO();
                Derivador derivador = derivadorDAO.findByComponenteId(componente.getId_componentes());
                attenuation = derivador.getAtenuacion_derivacion();
                break;

            case "distribuidor":
                DistribuidorDAO distribuidorDAO = new DistribuidorDAO();
                Distribuidor distribuidor = distribuidorDAO.findByComponenteId(componente.getId_componentes());
                attenuation = distribuidor.getAtenuacion_distribucion();
                break;

            case "toma":
                TomaDAO tomaDAO = new TomaDAO();
                Toma toma = tomaDAO.findByComponenteId(componente.getId_componentes());
                attenuation = toma.getAtenuacion();
                break;

            default:
                throw new SQLException("Invalid component type: " + config.type);
        }

        return new ComponentInfo(attenuation, componente.getCosto());
    }

    // Helper class to store component configuration
    private static class ComponentConfig {
        String type;
        String model;
        int floor;

        ComponentConfig(String type, String model, int floor) {
            this.type = type;
            this.model = model;
            this.floor = floor;
        }
    }

    // Helper class to store signal information for a floor
    private static class FloorSignalInfo {
        double finalLevel;
        double floorCost;
        List<ComponentEffect> componentEffects;

        FloorSignalInfo(double initialLevel) {
            this.finalLevel = initialLevel;
            this.floorCost = 0.0;
            this.componentEffects = new ArrayList<>();
        }
    }

    // Helper class to store component effect on signal
    private static class ComponentEffect {
        String type;
        String model;
        double attenuation;
        double cost;

        ComponentEffect(String type, String model, double attenuation, double cost) {
            this.type = type;
            this.model = model;
            this.attenuation = attenuation;
            this.cost = cost;
        }
    }

    // Helper methods to parse JSON without external libraries
    private int extractIntValue(String json, String key) {
        String value = extractStringValue(json, key);
        return Integer.parseInt(value);
    }

    private double extractDoubleValue(String json, String key) {
        String value = extractStringValue(json, key);
        return Double.parseDouble(value);
    }

    private String extractStringValue(String json, String key) {
        int start = json.indexOf("\"" + key + "\"");
        if (start == -1)
            throw new IllegalArgumentException("Missing key: " + key);

        start = json.indexOf(":", start) + 1;
        while (start < json.length() && Character.isWhitespace(json.charAt(start)))
            start++;

        boolean isString = json.charAt(start) == '"';
        if (isString)
            start++;

        int end = start;
        if (isString) {
            end = json.indexOf("\"", start);
        } else {
            while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '.'))
                end++;
        }

        return json.substring(start, end);
    }

    private List<ComponentConfig> extractComponents(String json) {
        List<ComponentConfig> components = new ArrayList<>();

        int start = json.indexOf("\"components\"");
        if (start == -1)
            return components;

        start = json.indexOf("[", start);
        int end = json.indexOf("]", start);
        String componentsArray = json.substring(start + 1, end);

        // Split into individual component objects
        int depth = 0;
        StringBuilder component = new StringBuilder();

        for (char c : componentsArray.toCharArray()) {
            if (c == '{')
                depth++;
            else if (c == '}')
                depth--;

            component.append(c);

            if (depth == 0 && component.length() > 0) {
                String componentJson = component.toString().trim();
                if (componentJson.startsWith("{") && componentJson.endsWith("}")) {
                    components.add(new ComponentConfig(
                            extractStringValue(componentJson, "type"),
                            extractStringValue(componentJson, "model"),
                            extractIntValue(componentJson, "floor")));
                }
                component = new StringBuilder();
            }
        }

        return components;
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