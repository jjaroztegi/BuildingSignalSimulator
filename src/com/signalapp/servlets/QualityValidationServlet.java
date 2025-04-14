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

public class QualityValidationServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        // Check if this is a request for signal types
        if ("true".equals(request.getParameter("get_signal_types"))) {
            try {
                MargenCalidadDAO margenCalidadDAO = new MargenCalidadDAO();
                List<MargenCalidad> margenes = margenCalidadDAO.findAll();
                
                StringBuilder jsonBuilder = new StringBuilder("[");
                boolean first = true;
                for (MargenCalidad margen : margenes) {
                    if (!first) {
                        jsonBuilder.append(",");
                    }
                    jsonBuilder.append("{")
                              .append("\"tipo_senal\":\"").append(escapeJson(margen.getTipo_senal())).append("\",")
                              .append("\"nivel_minimo\":").append(margen.getNivel_minimo()).append(",")
                              .append("\"nivel_maximo\":").append(margen.getNivel_maximo())
                              .append("}");
                    first = false;
                }
                jsonBuilder.append("]");
                out.write(jsonBuilder.toString());
                return;
            } catch (SQLException e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
                return;
            }
        }

        // Handle existing validation logic
        String idConfiguracion = request.getParameter("id_configuraciones");
        String tipoSenal = request.getParameter("tipo_senal");

        if (idConfiguracion == null || tipoSenal == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Missing required parameters: id_configuraciones and tipo_senal\"}");
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

            // Get quality margins for the specified signal type
            MargenCalidadDAO margenCalidadDAO = new MargenCalidadDAO();
            List<MargenCalidad> margenes = margenCalidadDAO.findAll();
            MargenCalidad margenCalidad = null;
            for (MargenCalidad m : margenes) {
                if (tipoSenal.equals(m.getTipo_senal())) {
                    margenCalidad = m;
                    break;
                }
            }

            if (margenCalidad == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.write("{\"error\":\"Quality margins not found for signal type: " + tipoSenal + "\"}");
                return;
            }

            // Get signal levels per floor
            List<FloorSignalLevel> floorLevels = getFloorSignalLevels(Integer.parseInt(idConfiguracion));

            // Build response array
            StringBuilder jsonBuilder = new StringBuilder("[");
            boolean first = true;

            for (FloorSignalLevel level : floorLevels) {
                if (!first) {
                    jsonBuilder.append(",");
                }
                first = false;

                boolean isValid = SignalCalculator.isSignalValid(level.signalLevel, tipoSenal);

                jsonBuilder.append("{")
                        .append("\"piso\":").append(level.floor)
                        .append(",\"nivel_senal\":").append(level.signalLevel)
                        .append(",\"is_valid\":").append(isValid)
                        .append("}");
            }
            jsonBuilder.append("]");

            out.write(jsonBuilder.toString());
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    private List<FloorSignalLevel> getFloorSignalLevels(int idConfiguracion) throws SQLException {
        List<FloorSignalLevel> levels = new ArrayList<>();

        DetalleConfiguracionDAO detalleConfiguracionDAO = new DetalleConfiguracionDAO();
        List<DetalleConfiguracion> detalles = detalleConfiguracionDAO.findByConfiguracionId(idConfiguracion);

        for (DetalleConfiguracion detalle : detalles) {
            FloorSignalLevel level = new FloorSignalLevel();
            level.floor = detalle.getPiso();
            level.signalLevel = detalle.getNivel_senal();
            levels.add(level);
        }

        return levels;
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String tipoSenal = request.getParameter("tipo_senal");
        String nivelMinimo = request.getParameter("nivel_minimo");
        String nivelMaximo = request.getParameter("nivel_maximo");

        if (tipoSenal == null || nivelMinimo == null || nivelMaximo == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Missing required parameters\"}");
            return;
        }

        try {
            MargenCalidad margenCalidad = new MargenCalidad();
            margenCalidad.setTipo_senal(tipoSenal);
            margenCalidad.setNivel_minimo(Double.parseDouble(nivelMinimo));
            margenCalidad.setNivel_maximo(Double.parseDouble(nivelMaximo));

            MargenCalidadDAO margenCalidadDAO = new MargenCalidadDAO();
            margenCalidadDAO.insert(margenCalidad);

            out.write("{\"success\":\"Quality margins added successfully\"}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
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

    private static class FloorSignalLevel {
        int floor;
        double signalLevel;
    }
}