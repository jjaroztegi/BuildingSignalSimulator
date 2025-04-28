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

public class SimulationHistoryServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    /**
     * Handles GET requests for simulation history
     * Retrieves all simulations for a specific configuration and returns them as
     * JSON
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String idConfiguracion = request.getParameter("id_configuraciones");
        if (idConfiguracion == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Falta el ID de la configuracion\"}");
            return;
        }

        try {
            SimulacionDAO simulacionDAO = new SimulacionDAO();
            List<Simulacion> simulaciones = simulacionDAO.getByConfiguracion(Integer.parseInt(idConfiguracion));

            StringBuilder jsonBuilder = new StringBuilder("[");
            boolean first = true;
            for (Simulacion simulacion : simulaciones) {
                if (!first) {
                    jsonBuilder.append(",");
                }
                first = false;

                // Build JSON object with proper escaping
                jsonBuilder.append("{");
                jsonBuilder.append("\"id_simulaciones\":").append(simulacion.getId_simulaciones()).append(",");
                jsonBuilder.append("\"id_configuraciones\":").append(simulacion.getId_configuraciones()).append(",");
                jsonBuilder.append("\"frecuencia\":").append(simulacion.getFrecuencia()).append(",");
                jsonBuilder.append("\"tipo_senal\":\"").append(escapeJson(simulacion.getTipo_senal())).append("\",");
                jsonBuilder.append("\"costo_total\":").append(simulacion.getCosto_total()).append(",");
                jsonBuilder.append("\"estado\":\"").append(escapeJson(simulacion.getEstado())).append("\",");
                jsonBuilder.append("\"fecha_simulacion\":\"").append(escapeJson(simulacion.getFecha_simulacion())).append("\",");
                jsonBuilder.append("\"nombre_edificio\":\"").append(escapeJson(simulacion.getNombre_edificio())).append("\",");
                jsonBuilder.append("\"nivel_cabecera\":").append(simulacion.getNivel_cabecera()).append(",");
                jsonBuilder.append("\"num_pisos\":").append(simulacion.getNum_pisos());
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
     * Handles POST requests to create new simulation history entries
     * Creates a new simulation record with the specified parameters
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

            // Extract parameters from JSON
            String idConfiguracion = extractStringValue(json, "id_configuraciones");
            String frecuencia = extractStringValue(json, "frecuencia");
            String tipoSenal = extractStringValue(json, "tipo_senal");
            String costoTotal = extractStringValue(json, "costo_total");
            String estado = extractStringValue(json, "estado");

            if (idConfiguracion.isEmpty() || frecuencia.isEmpty() || tipoSenal.isEmpty() ||
                    costoTotal.isEmpty() || estado.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"error\":\"Faltan parametros requeridos\"}");
                return;
            }

            Simulacion simulacion = new Simulacion();
            simulacion.setId_configuraciones(Integer.parseInt(idConfiguracion));
            simulacion.setFrecuencia(Integer.parseInt(frecuencia));
            simulacion.setTipo_senal(tipoSenal);
            simulacion.setCosto_total(Double.parseDouble(costoTotal));
            simulacion.setEstado(estado);

            // Add current date
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String currentDate = sdf.format(new java.util.Date());
            simulacion.setFecha_simulacion(currentDate);

            SimulacionDAO simulacionDAO = new SimulacionDAO();
            simulacionDAO.insert(simulacion);

            // Get the generated ID
            int idSimulacion = simulacionDAO.getLatestByConfiguracion(Integer.parseInt(idConfiguracion))
                    .getId_simulaciones();
            if (idSimulacion == -1) {
                throw new SQLException("No se pudo obtener el ID de la simulacion");
            }

            out.write("{\"success\":\"Simulacion guardada exitosamente\",\"id\":" + idSimulacion + "}");
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
     * Handles DELETE requests to remove simulation history entries
     * Deletes a simulation with the specified ID
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
            out.write("{\"error\":\"Falta el ID de la simulacion\"}");
            return;
        }

        try {
            // First delete all schematic components associated with this simulation
            EsquematicoDAO esquematicoDAO = new EsquematicoDAO();
            esquematicoDAO.deleteBySimulacion(Integer.parseInt(idSimulacion));

            // Then delete the simulation itself
            SimulacionDAO simulacionDAO = new SimulacionDAO();
            simulacionDAO.delete(Integer.parseInt(idSimulacion));

            out.write("{\"success\":\"Simulacion eliminada exitosamente\"}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    /**
     * Escapes special characters in a string for JSON formatting
     * 
     * @param input The string to escape
     * @return The escaped string safe for JSON output
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