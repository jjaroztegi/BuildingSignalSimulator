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

public class ConfigurationServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    /**
     * Handles GET requests for configuration information
     * Retrieves all configurations from the database and returns them as JSON
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            ConfiguracionDAO configuracionDAO = new ConfiguracionDAO();
            List<Configuracion> configuraciones = configuracionDAO.findAll();

            StringBuilder jsonBuilder = new StringBuilder("[");
            boolean first = true;
            for (Configuracion config : configuraciones) {
                if (!first) {
                    jsonBuilder.append(",");
                }
                first = false;
                
                // Build JSON object with proper escaping
                jsonBuilder.append("{");
                jsonBuilder.append("\"id_configuraciones\":").append(config.getId_configuraciones()).append(",");
                jsonBuilder.append("\"nombre\":\"").append(escapeJson(config.getNombre())).append("\",");
                jsonBuilder.append("\"nivel_cabecera\":").append(config.getNivel_cabecera()).append(",");
                jsonBuilder.append("\"num_pisos\":").append(config.getNum_pisos()).append(",");
                jsonBuilder.append("\"costo_total\":").append(config.getCosto_total()).append(",");
                jsonBuilder.append("\"fecha_creacion\":\"").append(escapeJson(config.getFecha_creacion())).append("\"");
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
     * Handles POST requests to create new configurations
     * Creates a new configuration with the specified name, headend level, and
     * number of floors
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String nombre = request.getParameter("nombre");
        String nivelCabecera = request.getParameter("nivel_cabecera");
        String numPisos = request.getParameter("num_pisos");

        if (nombre == null || nivelCabecera == null || numPisos == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Faltan parámetros requeridos\"}");
            return;
        }

        try {
            Configuracion configuracion = new Configuracion();
            configuracion.setNombre(nombre);
            configuracion.setNivel_cabecera(Double.parseDouble(nivelCabecera));
            configuracion.setNum_pisos(Integer.parseInt(numPisos));
            configuracion.setCosto_total(0.0);

            // Add current date and user information
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String currentDate = sdf.format(new java.util.Date());
            configuracion.setFecha_creacion(currentDate);
            configuracion.setUsuario_creacion("admin");
            configuracion.setFecha_modificacion(currentDate);
            configuracion.setUsuario_modificacion("admin");

            ConfiguracionDAO configuracionDAO = new ConfiguracionDAO();
            configuracionDAO.insert(configuracion);

            // Get the generated ID
            int idConfiguracion = configuracionDAO.getIdByNombre(nombre);
            if (idConfiguracion == -1) {
                throw new SQLException("No se pudo obtener el ID de la configuración");
            }

            out.write("{\"success\":\"Configuration created successfully\",\"id\":" + idConfiguracion + "}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    /**
     * Handles PUT requests to update existing configurations
     * Updates a configuration with the specified ID, name, headend level, and
     * number of floors
     */
    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String idConfiguracion = request.getParameter("id_configuraciones");
        String nombre = request.getParameter("nombre");
        String nivelCabecera = request.getParameter("nivel_cabecera");
        String numPisos = request.getParameter("num_pisos");

        if (idConfiguracion == null || nombre == null || nivelCabecera == null || numPisos == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Faltan parámetros requeridos\"}");
            return;
        }

        try {
            Configuracion configuracion = new Configuracion();
            configuracion.setId_configuraciones(Integer.parseInt(idConfiguracion));
            configuracion.setNombre(nombre);
            configuracion.setNivel_cabecera(Double.parseDouble(nivelCabecera));
            configuracion.setNum_pisos(Integer.parseInt(numPisos));

            ConfiguracionDAO configuracionDAO = new ConfiguracionDAO();
            configuracionDAO.update(configuracion, Integer.parseInt(idConfiguracion));

            out.write("{\"success\":\"Configuration updated successfully\"}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    /**
     * Handles DELETE requests to remove configurations
     * Deletes a configuration with the specified ID
     */
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String idConfiguracion = request.getParameter("id_configuraciones");
        if (idConfiguracion == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Falta el ID de la configuración\"}");
            return;
        }

        try {
            ConfiguracionDAO configuracionDAO = new ConfiguracionDAO();
            configuracionDAO.delete(Integer.parseInt(idConfiguracion));
            out.write("{\"success\":\"Configuration deleted successfully\"}");
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