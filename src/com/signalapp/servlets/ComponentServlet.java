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
import java.util.ArrayList;
import java.util.List;

public class ComponentServlet extends HttpServlet {

    /**
     * Handles GET requests for component information
     * Retrieves a list of component models based on the specified component type
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String type = request.getParameter("type");
        if (type == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Missing component type parameter\"}");
            return;
        }

        try {
            List<String> components = new ArrayList<>();
            ComponenteDAO componenteDAO = new ComponenteDAO();

            switch (type.toLowerCase()) {
                case "coaxial":
                    CoaxialDAO coaxialDAO = new CoaxialDAO();
                    for (Coaxial coaxial : coaxialDAO.findAll()) {
                        Componente componente = componenteDAO.findById(coaxial.getId_componentes());
                        if (componente != null) {
                            components.add(componente.getModelo());
                        }
                    }
                    break;
                case "derivador":
                    DerivadorDAO derivadorDAO = new DerivadorDAO();
                    for (Derivador derivador : derivadorDAO.findAll()) {
                        Componente componente = componenteDAO.findById(derivador.getId_componentes());
                        if (componente != null) {
                            components.add(componente.getModelo());
                        }
                    }
                    break;
                case "distribuidor":
                    DistribuidorDAO distribuidorDAO = new DistribuidorDAO();
                    for (Distribuidor distribuidor : distribuidorDAO.findAll()) {
                        Componente componente = componenteDAO.findById(distribuidor.getId_componentes());
                        if (componente != null) {
                            components.add(componente.getModelo());
                        }
                    }
                    break;
                case "toma":
                    TomaDAO tomaDAO = new TomaDAO();
                    for (Toma toma : tomaDAO.findAll()) {
                        Componente componente = componenteDAO.findById(toma.getId_componentes());
                        if (componente != null) {
                            components.add(componente.getModelo());
                        }
                    }
                    break;
                default:
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.write("{\"error\":\"Invalid component type\"}");
                    return;
            }

            StringBuilder jsonBuilder = new StringBuilder("[");
            boolean first = true;
            for (String component : components) {
                if (!first) {
                    jsonBuilder.append(",");
                }
                first = false;
                jsonBuilder.append("\"").append(escapeJson(component)).append("\"");
            }
            jsonBuilder.append("]");

            out.write(jsonBuilder.toString());
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    /**
     * Handles POST requests to add new components
     * Creates a new component record with the specified type, model, and cost
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String type = request.getParameter("type");
        String modelo = request.getParameter("modelo");
        String costo = request.getParameter("costo");

        if (type == null || modelo == null || costo == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Missing required parameters\"}");
            return;
        }

        try {
            // Create and insert Componente
            Componente componente = new Componente();
            componente.setModelo(modelo);
            componente.setCosto(Double.parseDouble(costo));

            // Get id_tipos_componente from TiposComponente
            int idTipo = getTipoComponenteId(type.toLowerCase());
            componente.setId_tipos_componente(idTipo);

            // Insert Componente
            ComponenteDAO componenteDAO = new ComponenteDAO();
            componenteDAO.insert(componente);

            // Get the generated component ID
            int idComponente = getComponenteIdByModelo(modelo);

            // Insert specific component
            switch (type.toLowerCase()) {
                case "coaxial":
                    Coaxial coaxial = new Coaxial();
                    coaxial.setId_componentes(idComponente);
                    coaxial.setAtenuacion_470mhz(0.0);
                    coaxial.setAtenuacion_694mhz(0.0);
                    new CoaxialDAO().insert(coaxial);
                    break;
                case "derivador":
                    Derivador derivador = new Derivador();
                    derivador.setId_componentes(idComponente);
                    derivador.setAtenuacion_derivacion(10.0);
                    derivador.setAtenuacion_paso(3.5);
                    derivador.setDirectividad(20.0);
                    derivador.setDesacoplo(20.0);
                    derivador.setPerdidas_retorno(16.0);
                    new DerivadorDAO().insert(derivador);
                    break;
                case "distribuidor":
                    Distribuidor distribuidor = new Distribuidor();
                    distribuidor.setId_componentes(idComponente);
                    distribuidor.setNumero_salidas(4);
                    distribuidor.setAtenuacion_distribucion(3.5);
                    distribuidor.setDesacoplo(20.0);
                    distribuidor.setPerdidas_retorno(16.0);
                    new DistribuidorDAO().insert(distribuidor);
                    break;
                case "toma":
                    Toma toma = new Toma();
                    toma.setId_componentes(idComponente);
                    toma.setAtenuacion(1.0);
                    toma.setDesacoplo(20.0);
                    new TomaDAO().insert(toma);
                    break;
                default:
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.write("{\"error\":\"Invalid component type\"}");
                    return;
            }

            out.write("{\"success\":\"Component added successfully\"}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + escapeJson(e.getMessage()) + "\"}");
        }
    }

    /**
     * Retrieves the component type ID based on the type name
     * @param tipoNombre The name of the component type
     * @return The ID of the component type
     * @throws SQLException If a database error occurs or the type is invalid
     */
    private int getTipoComponenteId(String tipoNombre) throws SQLException {
        TiposComponenteDAO tiposComponenteDAO = new TiposComponenteDAO();
        int idTipo = tiposComponenteDAO.getIdByNombre(tipoNombre);
        if (idTipo == -1) {
            throw new SQLException("Invalid component type");
        }
        return idTipo;
    }

    /**
     * Retrieves the component ID based on the model name
     * @param modelo The model name of the component
     * @return The ID of the component
     * @throws SQLException If a database error occurs or the component is not found
     */
    private int getComponenteIdByModelo(String modelo) throws SQLException {
        ComponenteDAO componenteDAO = new ComponenteDAO();
        int idComponente = componenteDAO.getIdByModelo(modelo);
        if (idComponente == -1) {
            throw new SQLException("Could not retrieve component ID");
        }
        return idComponente;
    }

    /**
     * Escapes special characters in a string for JSON formatting
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