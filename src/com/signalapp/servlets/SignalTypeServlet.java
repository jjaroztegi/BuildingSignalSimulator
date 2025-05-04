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

/**
 * Servlet to fetch signal types and their quality margins from the margenes_calidad table.
 */
public class SignalTypeServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
     */
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        try {
            MargenCalidadDAO margenCalidadDAO = new MargenCalidadDAO();
            List<MargenCalidad> margenes = margenCalidadDAO.findAll();

            // Build JSON array of objects with type and margins
            StringBuilder jsonBuilder = new StringBuilder("[");
            String currentType = null;

            for (MargenCalidad margen : margenes) {
                String tipoSenal = margen.getTipo_senal();

                if (!tipoSenal.equals(currentType)) {
                    // Close previous object if not first
                    if (currentType != null) {
                        jsonBuilder.append("}");
                        jsonBuilder.append(",");
                    }

                    // Start new object
                    jsonBuilder.append("{");
                    jsonBuilder.append("\"type\":\"").append(escapeJson(tipoSenal)).append("\",");
                    jsonBuilder.append("\"min\":").append(margen.getNivel_minimo()).append(",");
                    jsonBuilder.append("\"max\":").append(margen.getNivel_maximo());

                    currentType = tipoSenal;
                }
            }

            // Close last object if exists
            if (currentType != null) {
                jsonBuilder.append("}");
            }

            jsonBuilder.append("]");
            out.write(jsonBuilder.toString());

        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
            e.printStackTrace();
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
        return input.replace("\\", "\\\\").replace("\"", "\\\"").replace("\b", "\\b")
                .replace("\f", "\\f").replace("\n", "\\n").replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
