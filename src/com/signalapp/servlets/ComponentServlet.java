package com.signalapp.servlets;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.signalapp.dao.AccessConnection;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
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

        try (Connection connection = new AccessConnection().getConnection()) {
            String query = getComponentQuery(type);
            if (query == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"error\":\"Invalid component type\"}");
                return;
            }

            try (PreparedStatement stmt = connection.prepareStatement(query)) {
                ResultSet rs = stmt.executeQuery();
                List<String> components = new ArrayList<>();

                while (rs.next()) {
                    components.add(rs.getString(1));
                }

                StringBuilder jsonBuilder = new StringBuilder("[");
                boolean first = true;
                for (String component : components) {
                    if (!first) {
                        jsonBuilder.append(",");
                    }
                    first = false;
                    jsonBuilder.append("\"").append(component).append("\"");
                }
                jsonBuilder.append("]");

                out.write(jsonBuilder.toString());
            }
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    private String getComponentQuery(String type) {
        switch (type.toLowerCase()) {
            case "cables":
                return "SELECT c.modelo FROM Cables t JOIN Componentes c ON t.id_componente = c.id_componente";
            case "derivadores":
                return "SELECT c.modelo FROM Derivadores t JOIN Componentes c ON t.id_componente = c.id_componente";
            case "distribuidores":
                return "SELECT c.modelo FROM Distribuidores t JOIN Componentes c ON t.id_componente = c.id_componente";
            case "amplificadores":
                return "SELECT c.modelo FROM AmplificadoresRuidoBase t JOIN Componentes c ON t.id_componente = c.id_componente";
            case "tomas":
                return "SELECT c.modelo FROM Tomas t JOIN Componentes c ON t.id_componente = c.id_componente";
            default:
                return null;
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

        try (Connection connection = new AccessConnection().getConnection()) {
            connection.setAutoCommit(false);

            // Insert into Componentes first
            String insertComponentQuery = "INSERT INTO Componentes (id_tipo, modelo, costo, fecha_creacion, usuario_creacion, fecha_modificacion, usuario_modificacion) "
                    +
                    "VALUES ((SELECT id_tipo FROM TiposComponente WHERE nombre = ?), ?, ?, Now(), ?, Now(), ?)";

            try (PreparedStatement componentStmt = connection.prepareStatement(insertComponentQuery)) {
                componentStmt.setString(1, type);
                componentStmt.setString(2, modelo);
                componentStmt.setDouble(3, Double.parseDouble(costo));
                componentStmt.setString(4, usuario);
                componentStmt.setString(5, usuario);
                componentStmt.executeUpdate();
            }

            // Get the generated component ID
            int idComponente;
            String getComponentIdQuery = "SELECT MAX(id_componente) FROM Componentes WHERE modelo = ?";
            try (PreparedStatement idStmt = connection.prepareStatement(getComponentIdQuery)) {
                idStmt.setString(1, modelo);
                ResultSet rs = idStmt.executeQuery();
                if (rs.next()) {
                    idComponente = rs.getInt(1);
                } else {
                    throw new SQLException("Could not retrieve component ID");
                }
            }

            // Insert into specific component table
            String insertSpecificQuery = getSpecificComponentQuery(type);
            if (insertSpecificQuery == null) {
                connection.rollback();
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.write("{\"error\":\"Invalid component type\"}");
                return;
            }

            try (PreparedStatement specificStmt = connection.prepareStatement(insertSpecificQuery)) {
                specificStmt.setInt(1, idComponente);
                specificStmt.executeUpdate();
            }

            connection.commit();
            out.write("{\"success\":\"Component added successfully\"}");
        } catch (SQLException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.write("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    private String getSpecificComponentQuery(String type) {
        switch (type.toLowerCase()) {
            case "cables":
                return "INSERT INTO Cables (id_componente, longitud_maxima) VALUES (?, 100)";
            case "derivadores":
                return "INSERT INTO Derivadores (id_componente, atenuacion_insercion, atenuacion_derivacion, num_salidas) VALUES (?, 3.5, 10.0, 2)";
            case "distribuidores":
                return "INSERT INTO Distribuidores (id_componente, num_salidas, atenuacion_distribucion) VALUES (?, 4, 3.5)";
            case "amplificadores":
                return "INSERT INTO AmplificadoresRuidoBase (id_componente, atenuacion, ganancia, figura_ruido) VALUES (?, 0.0, 20.0, 3.0)";
            case "tomas":
                return "INSERT INTO Tomas (id_componente, atenuacion, desacoplo) VALUES (?, 1.0, 20.0)";
            default:
                return null;
        }
    }
}