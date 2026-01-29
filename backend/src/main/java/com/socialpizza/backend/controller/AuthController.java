package com.socialpizza.backend.controller;

import com.socialpizza.backend.entity.AppUser;
import com.socialpizza.backend.service.AppUserService;
import com.socialpizza.backend.session.SessionData;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Gestisce login, logout, registrazione e verifica dello stato della sessione corrente.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${cors.allowed.origins}", allowCredentials = "true")
public class AuthController {

    @Autowired
    private AppUserService userService;

    /**
     * Gestisce il processo di login.
     */
    @PostMapping("/login")
    public ResponseEntity<SessionData> login(@RequestBody AppUser loginData, HttpSession session) {
        try {
            // Verifica email e password tramite il service
            AppUser user = userService.login(loginData.getEmail(), loginData.getPassword());

            // Inizializza la sessione salvando attributi chiave per controlli futuri
            session.setAttribute("username", user.getEmail());
            session.setAttribute("userId", user.getId());
            session.setAttribute("role", user.getRole());

            // Restituisce i dati al frontend
            return ResponseEntity.ok(new SessionData(user.getEmail(), user.getName(), user.getRole(), "Login effettuato"));
        } catch (RuntimeException e) {
            // 401 Unauthorized se le credenziali sono errate
            return ResponseEntity.status(401).body(new SessionData("", "", "", "Credenziali errate"));
        }
    }

    /**
     * Effettua il logout invalidando la sessione corrente del server.
     */
    @PostMapping("/logout")
    public ResponseEntity<SessionData> logout(HttpSession session) {
        // Invalida la sessione rimuovendo tutti gli attributi salvati
        session.invalidate();
        return ResponseEntity.ok(new SessionData("", "", "", "Logout effettuato"));
    }

    /**
     * Endpoint per verificare se l'utente è attualmente loggato.
     * Utile al frontend per ripristinare lo stato dell'utente al ricaricamento della pagina.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        // Controlla se esiste un utente nella sessione
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body("Non autenticato");
        }

        // Recupera i dati aggiornati dal database per garantire coerenza
        AppUser user = userService.findByEmail(username);
        if (user == null) {
            return ResponseEntity.status(401).body("Utente non trovato");
        }

        return ResponseEntity.ok(new SessionData(user.getEmail(), user.getName(), user.getRole(), "Sessione attiva"));
    }

    /**
     * Gestisce la registrazione di un nuovo utente.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AppUser user) {
        try {
            // Delega la validazione e il salvataggio al service
            AppUser savedUser = userService.registerUser(user);
            return ResponseEntity.ok(savedUser);
        } catch (RuntimeException e) {
            // Restituisce un errore se i dati non sono validi o l'email esiste già
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}