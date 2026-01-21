package com.socialpizza.backend.controller;

import com.socialpizza.backend.entity.AppUser;
import com.socialpizza.backend.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DebugController {

    @Autowired
    private AppUserRepository appUserRepository;

    // Visualizza tutti gli utenti
    @GetMapping("/users")
    public ResponseEntity<List<AppUser>> getAllUsers() {
        List<AppUser> users = appUserRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // Crea un utente di test
    @PostMapping("/users/create")
    public ResponseEntity<?> createTestUser(@RequestBody Map<String, String> body) {
        try {
            String name = body.getOrDefault("name", "Test");
            String surname = body.getOrDefault("surname", "User");
            String email = body.getOrDefault("email", "test@example.com");
            String password = body.getOrDefault("password", "password123");
            String role = body.getOrDefault("role", "USER");

            AppUser user = new AppUser();
            user.setName(name);
            user.setSurname(surname);
            user.setEmail(email);
            user.setPassword(password); // NOTA: In produzione devi hashare la password!
            user.setRole(role);

            appUserRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Utente creato", "user", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Elimina tutti gli utenti
    @DeleteMapping("/users/clear")
    public ResponseEntity<?> clearAllUsers() {
        appUserRepository.deleteAll();
        return ResponseEntity.ok(Map.of("message", "Tutti gli utenti eliminati"));
    }
}
