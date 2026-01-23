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

        HttpSession session = request.getSession(false);
        String user = (session != null) ? (String) session.getAttribute("username") : null;


        if (request.getMethod().equals("OPTIONS")) {
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }

        // 1. Utente loggato: OK
        if (user != null) {
            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }


        String pathname = request.getServletPath();
        if (pathname.startsWith("/api/auth") ||
                pathname.startsWith("/api/resources") ||
                pathname.startsWith("/h2-console")) {

            filterChain.doFilter(servletRequest, servletResponse);
            return;
        }

        // 3. Accesso negato
        // Nota: Nel progetto della prof usa SC_UNAUTHORIZED senza messaggio custom,
        // ma puoi lasciare il tuo messaggio se preferisci.
        res.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Accesso Negato: Effettua il Login");
    }
}