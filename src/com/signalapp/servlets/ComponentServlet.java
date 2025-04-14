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
                case "cable":
                    CableDAO cableDAO = new CableDAO();
                    for (Cable cable : cableDAO.findAll()) {
                        Componente componente = componenteDAO.findById(cable.getIdComponente());
                        if (componente != null) {
                            components.add(componente.getModelo());
                        }
                    }
                    break;
                case "derivador":
                    DerivadorDAO derivadorDAO = new DerivadorDAO();
                    for (Derivador derivador : derivadorDAO.findAll()) {
                        Componente componente = componenteDAO.findById(derivador.getIdComponente());
                        if (componente != null) {
                            components.add(componente.getModelo());
                        }
                    }
                    break;
                case "distribuidor":
                    DistribuidorDAO distribuidorDAO = new DistribuidorDAO();
                    for (Distribuidor distribuidor : distribuidorDAO.findAll()) {
                        Componente componente = componenteDAO.findById(distribuidor.getIdComponente());
                        if (componente != null) {
                            components.add(componente.getModelo());
                        }
                    }
                    break;
                case "amplificador":
                    AmplificadorRuidoBaseDAO amplificadorDAO = new AmplificadorRuidoBaseDAO();
                    for (AmplificadorRuidoBase amplificador : amplificadorDAO.findAll()) {
                        Componente componente = componenteDAO.findById(amplificador.getIdComponente());
                        if (componente != null) {
                            components.add(componente.getModelo());
                        }
                    }
                    break;
                case "toma":
                    TomaDAO tomaDAO = new TomaDAO();
                    for (Toma toma : tomaDAO.findAll()) {
                        Componente componente = componenteDAO.findById(toma.getIdComponente());
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

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String type = request.getParameter("type");
        String modelo = request.getParameter("modelo");
        String costo = request.getParameter("costo");
        String usuario = "system";

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
            
            // Format current date in a format the database can understand
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            String currentDate = sdf.format(new java.util.Date());
            
            componente.setFechaCreacion(currentDate);
            componente.setUsuarioCreacion(usuario);
            componente.setFechaModificacion(currentDate);
            componente.setUsuarioModificacion(usuario);

            // Get id_tiposcomponente from TiposComponente
            int idTipo = getTipoComponenteId(type.toLowerCase());
            componente.setIdTipo(idTipo);

            // Insert Componente
            ComponenteDAO componenteDAO = new ComponenteDAO();
            componenteDAO.insert(componente);

            // Get the generated component ID
            int idComponente = getComponenteIdByModelo(modelo);

            // Insert specific component
            switch (type.toLowerCase()) {
                case "cable":
                    Cable cable = new Cable();
                    cable.setIdComponente(idComponente);
                    cable.setLongitudMaxima(100);
                    new CableDAO().insert(cable);
                    break;
                case "derivador":
                    Derivador derivador = new Derivador();
                    derivador.setIdComponente(idComponente);
                    derivador.setAtenuacionInsercion(3.5);
                    derivador.setAtenuacionDerivacion(10.0);
                    derivador.setNumSalidas(2);
                    new DerivadorDAO().insert(derivador);
                    break;
                case "distribuidor":
                    Distribuidor distribuidor = new Distribuidor();
                    distribuidor.setIdComponente(idComponente);
                    distribuidor.setNumSalidas(4);
                    distribuidor.setAtenuacionDistribucion(3.5);
                    new DistribuidorDAO().insert(distribuidor);
                    break;
                case "amplificador":
                    AmplificadorRuidoBase amplificador = new AmplificadorRuidoBase();
                    amplificador.setIdComponente(idComponente);
                    amplificador.setAtenuacion(0.0);
                    amplificador.setGanancia(20.0);
                    amplificador.setFiguraRuido(3.0);
                    new AmplificadorRuidoBaseDAO().insert(amplificador);
                    break;
                case "toma":
                    Toma toma = new Toma();
                    toma.setIdComponente(idComponente);
                    toma.setAtenuacion(1);
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

    private int getTipoComponenteId(String tipoNombre) throws SQLException {
        TiposComponenteDAO tiposComponenteDAO = new TiposComponenteDAO();
        int idTipo = tiposComponenteDAO.getIdByNombre(tipoNombre);
        if (idTipo == -1) {
            throw new SQLException("Invalid component type");
        }
        return idTipo;
    }

    private int getComponenteIdByModelo(String modelo) throws SQLException {
        ComponenteDAO componenteDAO = new ComponenteDAO();
        int idComponente = componenteDAO.getIdByModelo(modelo);
        if (idComponente == -1) {
            throw new SQLException("Could not retrieve component ID");
        }
        return idComponente;
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