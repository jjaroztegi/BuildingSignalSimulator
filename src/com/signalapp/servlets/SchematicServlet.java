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

public class SchematicServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    /**
     * Handles GET requests for schematic data
     * Retrieves all schematic components for a specific simulation and returns them
     * as JSON
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
            out.write("{\"error\":\"Falta el ID de la simulacion\"}");
            return;
        }

        try {
            EsquematicoDAO esquematicoDAO = new EsquematicoDAO();
            List<Esquematico> componentes = esquematicoDAO.getBySimulacion(Integer.parseInt(idSimulacion));

            StringBuilder jsonBuilder = new StringBuilder("[");
            boolean first = true;
            for (Esquematico componente : componentes) {
                if (!first) {
                    jsonBuilder.append(",");
                }
                first = false;

                // Build JSON object with proper escaping
                jsonBuilder.append("{");
                jsonBuilder.append("\"id_esquematicos\":").append(componente.getId_esquematicos()).append(",");
                jsonBuilder.append("\"id_simulaciones\":").append(componente.getId_simulaciones()).append(",");
                jsonBuilder.append("\"piso\":").append(componente.getPiso()).append(",");
                jsonBuilder.append("\"tipo_componente\":\"").append(escapeJson(componente.getTipo_componente()))
                        .append("\",");
                jsonBuilder.append("\"modelo_componente\":\"").append(escapeJson(componente.getModelo_componente()))
                        .append("\",");
                jsonBuilder.append("\"posicion_x\":").append(componente.getPosicion_x()).append(",");
                jsonBuilder.append("\"posicion_y\":").append(componente.getPosicion_y()).append(",");
                jsonBuilder.append("\"cable_tipo\":\"").append(escapeJson(componente.getCable_tipo())).append("\"");
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
     * Handles POST requests to save schematic components
     * Creates new schematic components for a simulation
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            // Get parameters from request
            String idSimulacion = request.getParameter("id_simulaciones");
            String tipoComponente = request.getParameter("tipo");
            String modeloComponente = request.getParameter("modelo");
            String piso = request.getParameter("piso");
            String posicionX = request.getParameter("posicion_x");
            String posicionY = request.getParameter("posicion_y");
            String cableTipo = request.getParameter("cable_tipo"); // Optional

            // Validate required parameters
            if (idSimulacion == null || tipoComponente == null || modeloComponente == null ||
                piso == null || posicionX == null || posicionY == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"error\":\"Faltan parametros requeridos\"}");
                return;
            }

            Esquematico componente = new Esquematico();
            componente.setId_simulaciones(Integer.parseInt(idSimulacion));
            componente.setTipo_componente(tipoComponente);
            componente.setModelo_componente(modeloComponente);
            componente.setPiso(Integer.parseInt(piso));
            componente.setPosicion_x(Integer.parseInt(posicionX));
            componente.setPosicion_y(Integer.parseInt(posicionY));
            componente.setCable_tipo(cableTipo); // Can be null

            EsquematicoDAO esquematicoDAO = new EsquematicoDAO();
            esquematicoDAO.insert(componente);

            // Get the generated ID
            int idEsquematico = componente.getId_esquematicos();
            if (idEsquematico == -1) {
                throw new SQLException("No se pudo obtener el ID del componente");
            }

            out.write("{\"success\":\"Componente guardado exitosamente\",\"id\":" + idEsquematico + "}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    /**
     * Handles PUT requests to update schematic components
     * Updates an existing schematic component
     */
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String idEsquematico = request.getParameter("id_esquematicos");
        String piso = request.getParameter("piso");
        String tipoComponente = request.getParameter("tipo_componente");
        String modeloComponente = request.getParameter("modelo_componente");
        String posicionX = request.getParameter("posicion_x");
        String posicionY = request.getParameter("posicion_y");
        String cableTipo = request.getParameter("cable_tipo");

        if (idEsquematico == null || piso == null || tipoComponente == null ||
                modeloComponente == null || posicionX == null || posicionY == null ||
                cableTipo == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Faltan parametros requeridos\"}");
            return;
        }

        try {
            Esquematico componente = new Esquematico();
            componente.setId_esquematicos(Integer.parseInt(idEsquematico));
            componente.setPiso(Integer.parseInt(piso));
            componente.setTipo_componente(tipoComponente);
            componente.setModelo_componente(modeloComponente);
            componente.setPosicion_x(Integer.parseInt(posicionX));
            componente.setPosicion_y(Integer.parseInt(posicionY));
            componente.setCable_tipo(cableTipo);

            EsquematicoDAO esquematicoDAO = new EsquematicoDAO();
            esquematicoDAO.update(componente, Integer.parseInt(idEsquematico));

            out.write("{\"success\":\"Componente actualizado exitosamente\"}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    /**
     * Handles DELETE requests to remove schematic components
     * Deletes a schematic component with the specified ID
     */
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String idEsquematico = request.getParameter("id_esquematicos");
        if (idEsquematico == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Falta el ID del componente\"}");
            return;
        }

        try {
            EsquematicoDAO esquematicoDAO = new EsquematicoDAO();
            esquematicoDAO.delete(Integer.parseInt(idEsquematico));

            out.write("{\"success\":\"Componente eliminado exitosamente\"}");
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