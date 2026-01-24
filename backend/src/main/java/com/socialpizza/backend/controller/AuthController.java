package com.socialpizza.backend.controller;

import com.socialpizza.backend.entity.AppUser;
import com.socialpizza.backend.service.AppUserService;
import com.socialpizza.backend.session.SessionData;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${cors.allowed.origins}", allowCredentials = "true")
public class AuthController {

    @Autowired
    private AppUserService userService;

    @PostMapping("/login")
    public ResponseEntity<SessionData> login(@RequestBody AppUser loginData, HttpSession session) {
        try {
            AppUser user = userService.login(loginData.getEmail(), loginData.getPassword());
            session.setAttribute("username", user.getEmail());
            return ResponseEntity.ok(new SessionData(user.getName(), user.getRole(), "Login effettuato"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(new SessionData("", "", "Credenziali errate"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<SessionData> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(new SessionData("", "", "Logout effettuato"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        String username = (String) session.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).body("Non autenticato");
        }
        AppUser user = userService.findByEmail(username);
        if (user == null) {
            return ResponseEntity.status(401).body("Utente non trovato");
        }
        return ResponseEntity.ok(new SessionData(user.getName(), user.getRole(), "Sessione attiva"));
    }

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