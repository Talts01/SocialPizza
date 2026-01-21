package com.socialpizza.backend.controller;

import com.socialpizza.backend.entity.AppUser;
import com.socialpizza.backend.service.AppUserService;
import com.socialpizza.backend.session.SessionData;
import jakarta.servlet.http.HttpSession; // Importante!
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
// La prof usa allowCredentials = "true" per permettere i cookie di sessione
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    @Autowired
    private AppUserService userService;

    @PostMapping("/login")
    public ResponseEntity<SessionData> login(@RequestBody AppUser loginData, HttpSession session) {
        // Verifica credenziali tramite Service (come facevamo già)
        // Nota: Assicurati che userService.login restituisca l'utente o lanci eccezione
        try {
            AppUser user = userService.login(loginData.getEmail(), loginData.getPassword());

            // COSA CAMBIA: Salviamo l'utente nella sessione del server!
            session.setAttribute("username", user.getEmail());

            // Restituiamo l'oggetto SessionData come la prof
            return ResponseEntity.ok(new SessionData(user.getName(), user.getRole(), "Login effettuato"));

        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(new SessionData("", "", "Credenziali errate"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<SessionData> logout(HttpSession session) {
        session.invalidate(); // Distrugge la sessione (Logout)
        return ResponseEntity.ok(new SessionData("", "", "Logout effettuato"));
    }

    // Endpoint per verificare se la sessione è ancora attiva
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body("Non autenticato");
        }
        
        // Recupera l'utente dal database
        AppUser user = userService.findByEmail(username);
        if (user == null) {
            return ResponseEntity.status(401).body("Utente non trovato");
        }
        
        return ResponseEntity.ok(new SessionData(user.getName(), user.getRole(), "Sessione attiva"));
    }

    // Lascia pure la registrazione com'era, quella va bene
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AppUser user) {
        try {
            AppUser savedUser = userService.registerUser(user);
            return ResponseEntity.ok(savedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}