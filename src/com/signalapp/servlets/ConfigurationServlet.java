package com.signalapp.servlets;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.signalapp.dao.*;
import com.signalapp.models.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.List;
import java.net.URLDecoder;
import java.io.UnsupportedEncodingException;

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
            out.write("{\"error\":\"Faltan parametros requeridos\"}");
            return;
        }

        try {
            int numPisosInt = Integer.parseInt(numPisos);
            if (numPisosInt < 1 || numPisosInt > 50) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"error\":\"El número de pisos debe estar entre 1 y 50\"}");
                return;
            }

            Configuracion configuracion = new Configuracion();
            configuracion.setNombre(nombre);
            configuracion.setNivel_cabecera(Double.parseDouble(nivelCabecera));
            configuracion.setNum_pisos(numPisosInt);
            configuracion.setCosto_total(0.0);

            // Check if configuration with same name already exists
            ConfiguracionDAO configuracionDAO = new ConfiguracionDAO();
            if (configuracionDAO.existsByName(nombre)) {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                out.write("{\"error\":\"Ya existe una configuracion con ese nombre\"}");
                return;
            }

            // Add current date and user information
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String currentDate = sdf.format(new java.util.Date());
            configuracion.setFecha_creacion(currentDate);
            configuracion.setUsuario_creacion("admin");
            configuracion.setFecha_modificacion(currentDate);
            configuracion.setUsuario_modificacion("admin");

            configuracionDAO.insert(configuracion);

            // Get the generated ID
            int idConfiguracion = configuracionDAO.getIdByNombre(nombre);
            if (idConfiguracion == -1) {
                throw new SQLException("No se pudo obtener el ID de la configuracion");
            }

            out.write("{\"success\":\"Configuracion creada exitosamente\",\"id\":" + idConfiguracion + "}");
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

        // Read the request body
        StringBuilder requestBody = new StringBuilder();
        String line;
        try (BufferedReader reader = request.getReader()) {
            while ((line = reader.readLine()) != null) {
                requestBody.append(line);
            }
        }

        // Parse the URL-encoded parameters from the body
        String idConfiguracion = null;
        String nombre = null;
        String nivelCabecera = null;
        String numPisos = null;

        String[] pairs = requestBody.toString().split("&");
        for (String pair : pairs) {
            String[] keyValue = pair.split("=", 2); // Limit split to 2
            if (keyValue.length == 2) {
                try {
                    String key = URLDecoder.decode(keyValue[0], "UTF-8");
                    String value = URLDecoder.decode(keyValue[1], "UTF-8");

                    switch (key) {
                        case "id_configuraciones":
                            idConfiguracion = value;
                            break;
                        case "nombre":
                            nombre = value;
                            break;
                        case "nivel_cabecera":
                            nivelCabecera = value;
                            break;
                        case "num_pisos":
                            numPisos = value;
                            break;
                    }
                } catch (UnsupportedEncodingException e) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.write(
                            "{\"error\":\"Error al decodificar los parametros: " + escapeJson(e.getMessage()) + "\"}");
                    return;
                }
            }
        }

        if (idConfiguracion == null || nombre == null || nivelCabecera == null || numPisos == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Faltan parametros requeridos\"}");
            return;
        }

        try {
            // Validate number of floors
            int numPisosInt = Integer.parseInt(numPisos);
            if (numPisosInt < 1 || numPisosInt > 50) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"error\":\"El número de pisos debe estar entre 1 y 50\"}");
                return;
            }

            ConfiguracionDAO configuracionDAO = new ConfiguracionDAO();

            // First, get the existing configuration to preserve its data
            int id = Integer.parseInt(idConfiguracion);
            Configuracion existingConfig = configuracionDAO.findById(id);

            if (existingConfig == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.write("{\"error\":\"Configuración no encontrada\"}");
                return;
            }

            // Check if another configuration with the same name exists (excluding current
            // config)
            if (!nombre.equals(existingConfig.getNombre()) && configuracionDAO.existsByName(nombre)) {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                out.write("{\"error\":\"Ya existe una configuracion con ese nombre\"}");
                return;
            }

            // Update only the fields that should change
            existingConfig.setNombre(nombre);
            existingConfig.setNivel_cabecera(Double.parseDouble(nivelCabecera));
            existingConfig.setNum_pisos(numPisosInt);

            // Update modification tracking
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String currentDate = sdf.format(new java.util.Date());
            existingConfig.setFecha_modificacion(currentDate);
            existingConfig.setUsuario_modificacion("admin");

            configuracionDAO.update(existingConfig, id);

            out.write("{\"success\":\"Configuracion actualizada exitosamente\"}");
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Formato de número inválido\"}");
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
            out.write("{\"error\":\"Falta el ID de la configuracion\"}");
            return;
        }

        try {
            ConfiguracionDAO configuracionDAO = new ConfiguracionDAO();
            configuracionDAO.delete(Integer.parseInt(idConfiguracion));
            out.write("{\"success\":\"Configuracion eliminada exitosamente\"}");
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