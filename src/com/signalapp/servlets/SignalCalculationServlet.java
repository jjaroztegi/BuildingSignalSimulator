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
import java.util.stream.Collectors;

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
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            // Parse request body
            String json = readRequestBody(request);

            // Extract parameters
            int numPisos = extractIntValue(json, "num_pisos");
            double nivelCabecera = extractDoubleValue(json, "nivel_cabecera");
            String tipoSenal = extractStringValue(json, "tipo_senal");
            int frequency = extractIntValue(json, "frequency");
            String selectedCableModel = extractStringValue(json, "selected_cable_model");
            List<ComponentConfig> components = extractComponents(json);

            // Validate configuration
            validateConfiguration(components);

            // Calculate signal levels and validate against margins
            Map<Integer, FloorSignalInfo> signalLevels = calculateSignalLevels(numPisos, nivelCabecera, components,
                    frequency, selectedCableModel);
            MargenCalidad margen = getMargenCalidad(tipoSenal);

            // Build and send response
            String jsonResponse = buildJsonResponse(signalLevels, margen, calculateTotalCost(signalLevels));
            out.write(jsonResponse);

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    /**
     * Reads the complete request body into a string
     */
    private String readRequestBody(HttpServletRequest request) throws IOException {
        StringBuilder body = new StringBuilder();
        String line;
        while ((line = request.getReader().readLine()) != null) {
            body.append(line);
        }
        return body.toString();
    }

    /**
     * Gets margin quality settings for signal type
     */
    private MargenCalidad getMargenCalidad(String tipoSenal) throws SQLException {
        MargenCalidadDAO margenDAO = new MargenCalidadDAO();
        List<MargenCalidad> margenes = margenDAO.findAll();
        return margenes.stream()
                .filter(m -> m.getTipo_senal().equals(tipoSenal))
                .findFirst()
                .orElseThrow(() -> new SQLException(
                        "No se encontraron márgenes de calidad para el tipo de señal: " + tipoSenal));
    }

    /**
     * Calculates total cost from all floor costs
     */
    private double calculateTotalCost(Map<Integer, FloorSignalInfo> signalLevels) {
        return signalLevels.values().stream()
                .mapToDouble(info -> info.floorCost)
                .sum();
    }

    /**
     * Builds JSON response with signal levels, margins and costs
     */
    private String buildJsonResponse(Map<Integer, FloorSignalInfo> signalLevels, MargenCalidad margen,
            double totalCost) {
        StringBuilder jsonBuilder = new StringBuilder();
        jsonBuilder.append("{\"signal_levels\":[");

        boolean first = true;
        for (Map.Entry<Integer, FloorSignalInfo> entry : signalLevels.entrySet()) {
            if (!first)
                jsonBuilder.append(",");
            first = false;

            FloorSignalInfo info = entry.getValue();
            String status = (info.finalLevel >= margen.getNivel_minimo() &&
                    info.finalLevel <= margen.getNivel_maximo()) ? "ok" : "error";

            // Build JSON object with proper escaping
            jsonBuilder.append("{");
            jsonBuilder.append("\"floor\":").append(entry.getKey()).append(",");
            jsonBuilder.append("\"level\":").append(info.finalLevel).append(",");
            jsonBuilder.append("\"status\":\"").append(status).append("\",");
            jsonBuilder.append("\"floor_cost\":").append(info.floorCost).append(",");
            jsonBuilder.append("\"components\":[");

            appendComponentEffects(jsonBuilder, info.componentEffects);

            jsonBuilder.append("]}");
        }

        jsonBuilder.append("],\"margins\":{");
        jsonBuilder.append("\"min\":").append(margen.getNivel_minimo()).append(",");
        jsonBuilder.append("\"max\":").append(margen.getNivel_maximo());
        jsonBuilder.append("},\"total_cost\":").append(totalCost);
        jsonBuilder.append("}");

        return jsonBuilder.toString();
    }

    /**
     * Appends component effects to JSON builder
     */
    private void appendComponentEffects(StringBuilder jsonBuilder, List<ComponentEffect> effects) {
        boolean first = true;
        for (ComponentEffect effect : effects) {
            if (!first)
                jsonBuilder.append(",");
            first = false;

            // Build JSON object with proper escaping
            jsonBuilder.append("{");
            jsonBuilder.append("\"type\":\"").append(escapeJson(effect.type)).append("\",");
            jsonBuilder.append("\"model\":\"").append(escapeJson(effect.model)).append("\",");
            jsonBuilder.append("\"attenuation\":").append(effect.attenuation).append(",");
            jsonBuilder.append("\"cost\":").append(effect.cost);
            jsonBuilder.append("}");
        }
    }

    /**
     * Validates the component configuration for logical errors
     */
    private void validateConfiguration(List<ComponentConfig> components) throws SQLException {
        Map<Integer, List<ComponentConfig>> componentsByFloor = new HashMap<>();
        for (ComponentConfig config : components) {
            componentsByFloor.computeIfAbsent(config.floor, k -> new ArrayList<>()).add(config);
        }

        for (Map.Entry<Integer, List<ComponentConfig>> entry : componentsByFloor.entrySet()) {
            List<ComponentConfig> floorComponents = entry.getValue();
            int floorNum = entry.getKey();

            // Count components by type
            long derivadores = floorComponents.stream()
                    .filter(c -> c.type.equalsIgnoreCase("derivador"))
                    .count();
            long distribuidores = floorComponents.stream()
                    .filter(c -> c.type.equalsIgnoreCase("distribuidor"))
                    .count();
            long tomas = floorComponents.stream()
                    .filter(c -> c.type.equalsIgnoreCase("toma"))
                    .count();

            // Check component limits
            if (derivadores > 1) {
                throw new SQLException("No se permite más de un derivador en el piso " + floorNum);
            }
            if (distribuidores > 2) {
                throw new SQLException("No se permite más de un distribuidor en el piso " + floorNum);
            }
            if (tomas != 2 && tomas != 4 && tomas != 6 && tomas != 8) {
                throw new SQLException("El piso " + floorNum + " debe tener 2 o 4 tomas por cada lado");
            }

            // Check component hierarchy
            boolean hasDerivador = derivadores > 0;
            boolean hasDistribuidor = distribuidores > 0;
            boolean hasTomas = tomas > 0;

            // Validate component relationships
            if (hasTomas && !hasDistribuidor) {
                throw new SQLException("El piso " + floorNum
                        + " tiene tomas pero no tiene distribuidor. Debe añadir un distribuidor antes de añadir tomas.");
            }

            if (hasDistribuidor && !hasDerivador) {
                throw new SQLException("El piso " + floorNum
                        + " tiene distribuidor pero no tiene derivador. Debe añadir un derivador antes de añadir distribuidores.");
            }

            if (hasDistribuidor && !hasTomas) {
                throw new SQLException("El piso " + floorNum
                        + " tiene distribuidor pero no tiene tomas. Debe añadir tomas cuando hay un distribuidor.");
            }

            if (hasDerivador && !hasDistribuidor && !hasTomas) {
                throw new SQLException("El piso " + floorNum
                        + " tiene solo un derivador. Debe añadir al menos un distribuidor o tomas.");
            }
        }
    }

    /**
     * Calculates signal levels for each floor based on components and initial level
     */
    private Map<Integer, FloorSignalInfo> calculateSignalLevels(int numPisos, double nivelCabecera,
            List<ComponentConfig> components, int frequency, String selectedCableModel) throws SQLException {
        Map<Integer, FloorSignalInfo> levels = new HashMap<>();
        ComponenteDAO componenteDAO = new ComponenteDAO();

        // Group components by floor
        Map<Integer, List<ComponentConfig>> componentsByFloor = new HashMap<>();
        for (ComponentConfig config : components) {
            componentsByFloor.computeIfAbsent(config.floor, k -> new ArrayList<>()).add(config);
        }

        double signalDownward = nivelCabecera;

        // Process floors from top to bottom
        for (int floor = numPisos; floor >= 1; floor--) {
            List<ComponentConfig> floorComponents = componentsByFloor.getOrDefault(floor, new ArrayList<>());
            FloorSignalInfo info = new FloorSignalInfo(signalDownward);
            double floorCost = 0.0;
            double signalToStay = signalDownward;

            // Find derivador if present
            Optional<ComponentConfig> derivadorOpt = floorComponents.stream()
                    .filter(c -> c.type.equalsIgnoreCase("derivador"))
                    .findFirst();

            // Apply derivación attenuation (signal staying in this floor)
            if (derivadorOpt.isPresent()) {
                ComponentInfo derivacionInfo = getComponentInfo(derivadorOpt.get(), frequency);
                signalToStay -= derivacionInfo.attenuation;
                floorCost += derivacionInfo.cost;
                info.componentEffects.add(new ComponentEffect(
                        "derivacion",
                        derivadorOpt.get().model,
                        derivacionInfo.attenuation,
                        derivacionInfo.cost));
            }

            // Apply 15m coaxial attenuation within floor using the selected cable model
            if (selectedCableModel != null && !selectedCableModel.isEmpty() && !floorComponents.isEmpty()) {
                ComponentConfig cableConfig = new ComponentConfig("coaxial", selectedCableModel, floor);
                ComponentInfo coaxInfo = getCoaxialInfoByFrequency(cableConfig, frequency);
                double atenuacion15m = (coaxInfo.attenuation / 100.0) * 15.0; // 15m of cable
                signalToStay -= atenuacion15m;
                double cableCost15m = coaxInfo.cost * 15.0; // Cost per meter * 15 meters
                floorCost += cableCost15m;
                info.componentEffects.add(new ComponentEffect(
                        "coaxial_en_planta_15m",
                        selectedCableModel,
                        atenuacion15m,
                        cableCost15m));
            }

            // Apply distribuidor attenuation first
            List<ComponentConfig> distribuidores = floorComponents.stream()
                    .filter(c -> c.type.equalsIgnoreCase("distribuidor"))
                    .collect(Collectors.toList());

            double signalAfterDistribuidor = signalToStay;

            // Apply attenuation only from first distributor
            if (!distribuidores.isEmpty()) {
                ComponentConfig firstDistribuidor = distribuidores.get(0);
                ComponentInfo distribInfo = getComponentInfo(firstDistribuidor, frequency);
                signalAfterDistribuidor -= distribInfo.attenuation;
                info.componentEffects.add(new ComponentEffect(
                        "distribuidor",
                        firstDistribuidor.model,
                        distribInfo.attenuation,
                        distribInfo.cost));
            }

            // Count costs for all distributors
            for (ComponentConfig distribuidor : distribuidores) {
                ComponentInfo distribInfo = getComponentInfo(distribuidor, frequency);
                floorCost += distribInfo.cost;
            }

            // Apply toma attenuation (only once per floor since all tomas have same model)
            double signalAfterToma = signalAfterDistribuidor;
            Optional<ComponentConfig> firstToma = floorComponents.stream()
                    .filter(c -> c.type.equalsIgnoreCase("toma"))
                    .findFirst();

            if (firstToma.isPresent()) {
                ComponentInfo tomaInfo = getComponentInfo(firstToma.get(), frequency);
                signalAfterToma -= tomaInfo.attenuation;
                info.componentEffects.add(new ComponentEffect(
                        "toma",
                        firstToma.get().model,
                        tomaInfo.attenuation,
                        tomaInfo.cost));
            }

            // Calculate total cost for all tomas
            double tomaCosts = floorComponents.stream()
                    .filter(c -> c.type.equalsIgnoreCase("toma"))
                    .mapToDouble(toma -> {
                        try {
                            return getComponentInfo(toma, frequency).cost;
                        } catch (SQLException e) {
                            throw new RuntimeException("Error calculating toma cost", e);
                        }
                    })
                    .sum();
            floorCost += tomaCosts;

            info.finalLevel = signalAfterToma;
            info.floorCost = floorCost;
            levels.put(floor, info);

            // Calculate signal for next floor down
            if (floor > 1) {
                double nextSignal = signalDownward;

                // Apply paso attenuation if derivador present
                if (derivadorOpt.isPresent()) {
                    DerivadorDAO derivadorDAO = new DerivadorDAO();
                    Derivador derivador = derivadorDAO.findByComponenteId(
                            componenteDAO.findByModelo(derivadorOpt.get().model).getId_componentes());
                    nextSignal -= derivador.getAtenuacion_paso();
                }

                // Apply 3m coaxial attenuation between floors using the selected cable model
                if (selectedCableModel != null && !selectedCableModel.isEmpty()) {
                    ComponentConfig cableConfig = new ComponentConfig("coaxial", selectedCableModel, floor);
                    ComponentInfo coaxInfo = getCoaxialInfoByFrequency(cableConfig, frequency);
                    double atenuacion3m = (coaxInfo.attenuation / 100.0) * 3.0; // 3m between floors
                    nextSignal -= atenuacion3m;
                    double cableCost3m = coaxInfo.cost * 3.0; // Cost per meter * 3 meters
                    floorCost += cableCost3m;
                    info.componentEffects.add(new ComponentEffect(
                            "coaxial_entre_pisos_3m",
                            selectedCableModel,
                            atenuacion3m,
                            cableCost3m));
                }

                signalDownward = nextSignal;
            }
        }

        return levels;
    }

    /**
     * Gets component information with interpolated attenuation for coaxial cables
     */
    private ComponentInfo getCoaxialInfoByFrequency(ComponentConfig config, int frequency) throws SQLException {
        ComponenteDAO componenteDAO = new ComponenteDAO();
        Componente componente = componenteDAO.findByModelo(config.model);
        if (componente == null) {
            throw new SQLException("No se encontró el componente: " + config.model);
        }
        CoaxialDAO coaxialDAO = new CoaxialDAO();
        Coaxial coaxial = coaxialDAO.findByComponenteId(componente.getId_componentes());

        // Logarithmic interpolation between 470 MHz and 694 MHz
        double f1 = 470.0;
        double f2 = 694.0;
        double a1 = coaxial.getAtenuacion_470mhz();
        double a2 = coaxial.getAtenuacion_694mhz();

        double logf1 = Math.log10(f1);
        double logf2 = Math.log10(f2);
        double logf = Math.log10(frequency);

        double atenuacionInterpolada = a1 + ((a2 - a1) * (logf - logf1)) / (logf2 - logf1);

        return new ComponentInfo(atenuacionInterpolada, componente.getCosto());
    }

    /**
     * Gets component information for non-coaxial components
     */
    private ComponentInfo getComponentInfo(ComponentConfig config, int frequency) throws SQLException {
        if (config.type.equalsIgnoreCase("coaxial")) {
            return getCoaxialInfoByFrequency(config, frequency);
        }

        ComponenteDAO componenteDAO = new ComponenteDAO();
        Componente componente = componenteDAO.findByModelo(config.model);

        if (componente == null) {
            throw new SQLException("No se encontró el componente: " + config.model);
        }

        double attenuation;
        switch (config.type.toLowerCase()) {
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
                throw new SQLException("Tipo de componente no válido: " + config.type);
        }

        return new ComponentInfo(attenuation, componente.getCosto());
    }

    // Helper classes
    private static class ComponentInfo {
        double attenuation;
        double cost;

        ComponentInfo(double attenuation, double cost) {
            this.attenuation = attenuation;
            this.cost = cost;
        }
    }

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

    // JSON parsing helper methods
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
        if (start == -1) {
            // Return empty string if key not found
            return "";
        }

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