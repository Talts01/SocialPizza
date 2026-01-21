package com.socialpizza.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SecurityConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Permetti l'accesso a H2 Console senza autenticazione
        registry.addViewController("/h2-console/**").setViewName("forward:/h2-console/");
    }
}
