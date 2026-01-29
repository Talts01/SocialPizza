package com.socialpizza.backend.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.io.IOException;

/**
 * Filtro di sicurezza globale che intercetta tutte le richieste HTTP in arrivo.
 * Verifica se l'utente ha una sessione attiva prima di permettere l'accesso alle risorse protette..
 */
@Component
@Order(1) // Definisce la priorità del filtro nella catena (1 = alta priorità)
public class LoginFilter implements Filter {

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        // accedere ai metodi specifici HTTP
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse res = (HttpServletResponse) servletResponse;

        // Recupera la sessione esistente
        HttpSession session = request.getSession(false);
        String user = (session != null) ? (String) session.getAttribute("username") : null;

        // Gestione pre-flight CORS (OPTIONS)
        if (request.getMethod().equals("OPTIONS")) {
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }

        // Se l'utente è già loggato, lascia passare la richiesta verso il Controller
        if (user != null) {
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }


        // Definisce quali percorsi sono accessibili
        String pathname = request.getServletPath();
        if (pathname.startsWith("/api/auth") ||       // Login, Logout, Register
                pathname.startsWith("/api/resources") ||  // Liste città, categorie (ResourceController)
                pathname.startsWith("/h2-console")) {     // Console del database per debug

            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }

        // Blocco accesso
        res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Accesso Negato: Effettua il Login");
    }
}