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
import java.util.List;

public class SimulationResultsServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    /**
     * Handles GET requests for simulation results
     * Retrieves all results for a specific simulation and returns them as JSON
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String idSimulacion = request.getParameter("id_simulaciones");
        if (idSimulacion == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Falta el ID de la simulación\"}");
            return;
        }

        try {
            ResultadoSimulacionDAO resultadoDAO = new ResultadoSimulacionDAO();
            List<ResultadoSimulacion> resultados = resultadoDAO.findBySimulacionId(Integer.parseInt(idSimulacion));

            StringBuilder jsonBuilder = new StringBuilder("[");
            boolean first = true;
            for (ResultadoSimulacion resultado : resultados) {
                if (!first) {
                    jsonBuilder.append(",");
                }
                first = false;

                jsonBuilder.append("{");
                jsonBuilder.append("\"id_resultados_simulacion\":").append(resultado.getId_resultados_simulacion())
                        .append(",");
                jsonBuilder.append("\"id_simulaciones\":").append(resultado.getId_simulaciones()).append(",");
                jsonBuilder.append("\"piso\":").append(resultado.getPiso()).append(",");
                jsonBuilder.append("\"nivel_senal\":").append(resultado.getNivel_senal()).append(",");
                jsonBuilder.append("\"costo_piso\":").append(resultado.getCosto_piso()).append(",");
                jsonBuilder.append("\"estado\":\"").append(escapeJson(resultado.getEstado())).append("\"");
                jsonBuilder.append("}");
            }
            jsonBuilder.append("]");
            out.write(jsonBuilder.toString());
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    /**
     * Handles POST requests to save simulation results
     * Creates new result records for each floor
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            // Read request body
            StringBuilder body = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                body.append(line);
            }
            String json = body.toString();

            // Extract simulation ID
            String idSimulacion = extractStringValue(json, "id_simulaciones");
            if (idSimulacion.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"error\":\"Falta el ID de la simulación\"}");
                return;
            }

            // Extract results array
            String resultsStr = extractArrayValue(json, "results");
            if (resultsStr.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"error\":\"Faltan los resultados de la simulación\"}");
                return;
            }

            ResultadoSimulacionDAO resultadoDAO = new ResultadoSimulacionDAO();

            // Parse and save each result
            String[] resultItems = resultsStr.split("\\},\\{");
            for (String item : resultItems) {
                // Clean up the item string
                item = item.replace("[{", "").replace("}]", "");

                ResultadoSimulacion resultado = new ResultadoSimulacion();
                resultado.setId_simulaciones(Integer.parseInt(idSimulacion));
                resultado.setPiso(Integer.parseInt(extractStringValue(item, "floor")));
                resultado.setNivel_senal(Double.parseDouble(extractStringValue(item, "level")));
                resultado.setCosto_piso(Double.parseDouble(extractStringValue(item, "floor_cost")));
                resultado.setEstado(extractStringValue(item, "status"));

                resultadoDAO.insert(resultado);
            }

            out.write("{\"success\":\"Resultados guardados exitosamente\"}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    /**
     * Handles DELETE requests to remove simulation results
     * Deletes all results for a specific simulation
     */
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String idSimulacion = request.getParameter("id_simulaciones");
        if (idSimulacion == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Falta el ID de la simulación\"}");
            return;
        }

        try {
            ResultadoSimulacionDAO resultadoDAO = new ResultadoSimulacionDAO();
            resultadoDAO.deleteBySimulacionId(Integer.parseInt(idSimulacion));
            out.write("{\"success\":\"Resultados eliminados exitosamente\"}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    /**
     * Extracts a string value from JSON
     */
    private String extractStringValue(String json, String key) {
        int start = json.indexOf("\"" + key + "\"");
        if (start == -1) {
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

    /**
     * Extracts an array value from JSON
     */
    private String extractArrayValue(String json, String key) {
        int start = json.indexOf("\"" + key + "\"");
        if (start == -1) {
            return "";
        }

        start = json.indexOf("[", start);
        if (start == -1) {
            return "";
        }

        int end = start + 1;
        int depth = 1;
        while (end < json.length() && depth > 0) {
            if (json.charAt(end) == '[')
                depth++;
            if (json.charAt(end) == ']')
                depth--;
            end++;
        }

        return json.substring(start, end);
    }

    /**
     * Escapes special characters in a string for JSON formatting
     */
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
