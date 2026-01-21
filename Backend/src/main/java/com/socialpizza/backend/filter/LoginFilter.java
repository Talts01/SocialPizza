package com.socialpizza.backend.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
@Order(1)
public class LoginFilter implements Filter {

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse res = (HttpServletResponse) servletResponse;

        // Gestione CORS per permettere a React di comunicare
        // (La prof lo gestisce diversamente, ma per sicurezza lasciamo passare le OPTIONS)
        if (request.getMethod().equals("OPTIONS")) {
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }

        HttpSession session = request.getSession(false); // false = non crearla se non c'è
        // Verifichiamo se c'è un utente salvato nella sessione
        String user = (session != null) ? (String) session.getAttribute("username") : null;

        // 1. Se l'utente è loggato, passa pure
        if (user != null) {
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }

        // 2. Se l'utente NON è loggato, ma sta chiedendo di fare login/register, passa pure
        // NOTA: Qui adattiamo il percorso al tuo AuthController (/api/auth)
        String pathname = request.getServletPath();
        if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/resources") || pathname.startsWith("/h2-console") || pathname.startsWith("/api/debug")) { // Lasciamo pubbliche anche le risorse base, h2-console e debug se serve
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }


        res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");

        res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Accesso Negato: Effettua il Login");
    }
}