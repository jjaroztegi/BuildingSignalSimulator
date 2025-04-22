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
        String model = request.getParameter("model");

        if (type == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Missing component type parameter\"}");
            return;
        }

        try {
            // If model is provided, return detailed information for that specific component
            if (model != null) {
                ComponenteDAO componenteDAO = new ComponenteDAO();
                Componente componente = componenteDAO.findByModelo(model);

                if (componente == null) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    out.write("{\"error\":\"Componente no encontrado\"}");
                    return;
                }

                StringBuilder jsonBuilder = new StringBuilder("{");
                jsonBuilder.append("\"costo\":").append(componente.getCosto()).append(",");

                // Add specific component details based on type
                switch (type.toLowerCase()) {
                    case "coaxial":
                        CoaxialDAO coaxialDAO = new CoaxialDAO();
                        Coaxial coaxial = coaxialDAO.findByComponenteId(componente.getId_componentes());
                        if (coaxial != null) {
                            jsonBuilder.append("\"atenuacion_470mhz\":").append(coaxial.getAtenuacion_470mhz())
                                    .append(",");
                            jsonBuilder.append("\"atenuacion_694mhz\":").append(coaxial.getAtenuacion_694mhz());
                        }
                        break;
                    case "derivador":
                        DerivadorDAO derivadorDAO = new DerivadorDAO();
                        Derivador derivador = derivadorDAO.findByComponenteId(componente.getId_componentes());
                        if (derivador != null) {
                            jsonBuilder.append("\"atenuacion_derivacion\":")
                                    .append(derivador.getAtenuacion_derivacion()).append(",");
                            jsonBuilder.append("\"atenuacion_paso\":").append(derivador.getAtenuacion_paso())
                                    .append(",");
                            jsonBuilder.append("\"directividad\":").append(derivador.getDirectividad()).append(",");
                            jsonBuilder.append("\"desacoplo\":").append(derivador.getDesacoplo()).append(",");
                            jsonBuilder.append("\"perdidas_retorno\":").append(derivador.getPerdidas_retorno());
                        }
                        break;
                    case "distribuidor":
                        DistribuidorDAO distribuidorDAO = new DistribuidorDAO();
                        Distribuidor distribuidor = distribuidorDAO.findByComponenteId(componente.getId_componentes());
                        if (distribuidor != null) {
                            jsonBuilder.append("\"numero_salidas\":").append(distribuidor.getNumero_salidas())
                                    .append(",");
                            jsonBuilder.append("\"atenuacion_distribucion\":")
                                    .append(distribuidor.getAtenuacion_distribucion()).append(",");
                            jsonBuilder.append("\"desacoplo\":").append(distribuidor.getDesacoplo()).append(",");
                            jsonBuilder.append("\"perdidas_retorno\":").append(distribuidor.getPerdidas_retorno());
                        }
                        break;
                    case "toma":
                        TomaDAO tomaDAO = new TomaDAO();
                        Toma toma = tomaDAO.findByComponenteId(componente.getId_componentes());
                        if (toma != null) {
                            jsonBuilder.append("\"atenuacion\":").append(toma.getAtenuacion()).append(",");
                            jsonBuilder.append("\"desacoplo\":").append(toma.getDesacoplo());
                        }
                        break;
                    default:
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        out.write("{\"error\":\"Tipo de componente no válido\"}");
                        return;
                }
                jsonBuilder.append("}");
                out.write(jsonBuilder.toString());
                return;
            }

            // If no model provided, return list of models for the type (existing
            // functionality)
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
                    out.write("{\"error\":\"Tipo de componente no válido\"}");
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
     * Creates a new component record with the specified type, model, and properties
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String type = request.getParameter("type");
        String modelo = request.getParameter("modelo");
        String costo = request.getParameter("costo");
        String propertiesJson = request.getParameter("properties");

        if (type == null || modelo == null || costo == null || propertiesJson == null) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.write("{\"error\":\"Faltan parámetros requeridos\"}");
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

            // Parse properties
            propertiesJson = propertiesJson.trim();

            // Remove curly braces and split into key-value pairs
            String[] pairs = propertiesJson.substring(1, propertiesJson.length() - 1).split(",");
            java.util.Map<String, String> properties = new java.util.HashMap<>();

            for (String pair : pairs) {
                String[] keyValue = pair.split(":");
                if (keyValue.length != 2)
                    continue;

                String key = keyValue[0].trim().replace("\"", "");
                String value = keyValue[1].trim().replace("\"", "");
                properties.put(key, value);
            }

            // Insert specific component with properties from request
            switch (type.toLowerCase()) {
                case "coaxial":
                    Coaxial coaxial = new Coaxial();
                    coaxial.setId_componentes(idComponente);
                    coaxial.setAtenuacion_470mhz(Double.parseDouble(properties.get("atenuacion_470mhz")));
                    coaxial.setAtenuacion_694mhz(Double.parseDouble(properties.get("atenuacion_694mhz")));
                    new CoaxialDAO().insert(coaxial);
                    break;
                case "derivador":
                    Derivador derivador = new Derivador();
                    derivador.setId_componentes(idComponente);
                    derivador.setAtenuacion_derivacion(Double.parseDouble(properties.get("atenuacion_derivacion")));
                    derivador.setAtenuacion_paso(Double.parseDouble(properties.get("atenuacion_paso")));
                    derivador.setDirectividad(Double.parseDouble(properties.get("directividad")));
                    derivador.setDesacoplo(Double.parseDouble(properties.get("desacoplo")));
                    derivador.setPerdidas_retorno(Double.parseDouble(properties.get("perdidas_retorno")));
                    new DerivadorDAO().insert(derivador);
                    break;
                case "distribuidor":
                    Distribuidor distribuidor = new Distribuidor();
                    distribuidor.setId_componentes(idComponente);
                    distribuidor.setNumero_salidas(Integer.parseInt(properties.get("numero_salidas")));
                    distribuidor
                            .setAtenuacion_distribucion(Double.parseDouble(properties.get("atenuacion_distribucion")));
                    distribuidor.setDesacoplo(Double.parseDouble(properties.get("desacoplo")));
                    distribuidor.setPerdidas_retorno(Double.parseDouble(properties.get("perdidas_retorno")));
                    new DistribuidorDAO().insert(distribuidor);
                    break;
                case "toma":
                    Toma toma = new Toma();
                    toma.setId_componentes(idComponente);
                    toma.setAtenuacion(Double.parseDouble(properties.get("atenuacion")));
                    toma.setDesacoplo(Double.parseDouble(properties.get("desacoplo")));
                    new TomaDAO().insert(toma);
                    break;
                default:
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    out.write("{\"error\":\"Tipo de componente no válido\"}");
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
     * 
     * @param tipoNombre The name of the component type
     * @return The ID of the component type
     * @throws SQLException If a database error occurs or the type is invalid
     */
    private int getTipoComponenteId(String tipoNombre) throws SQLException {
        // Map the frontend type names to database type names
        String dbTipoNombre;
        switch (tipoNombre) {
            case "coaxial":
                dbTipoNombre = "Cable Coaxial";
                break;
            case "toma":
                dbTipoNombre = "Base de Toma";
                break;
            case "derivador":
                dbTipoNombre = "Derivador";
                break;
            case "distribuidor":
                dbTipoNombre = "Distribuidor";
                break;
            default:
                throw new SQLException("Tipo de componente no válido");
        }

        TiposComponenteDAO tiposComponenteDAO = new TiposComponenteDAO();
        int idTipo = tiposComponenteDAO.getIdByNombre(dbTipoNombre);
        if (idTipo == -1) {
            throw new SQLException("Tipo de componente no válido");
        }
        return idTipo;
    }

    /**
     * Retrieves the component ID based on the model name
     * 
     * @param modelo The model name of the component
     * @return The ID of the component
     * @throws SQLException If a database error occurs or the component is not found
     */
    private int getComponenteIdByModelo(String modelo) throws SQLException {
        ComponenteDAO componenteDAO = new ComponenteDAO();
        int idComponente = componenteDAO.getIdByModelo(modelo);
        if (idComponente == -1) {
            throw new SQLException("No se pudo obtener el ID del componente");
        }
        return idComponente;
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