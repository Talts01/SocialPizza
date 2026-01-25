package com.socialpizza.backend.service;

import com.socialpizza.backend.entity.AppUser;
import com.socialpizza.backend.repository.AppUserRepository;
import com.socialpizza.backend.repository.ParticipationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.PostConstruct;

import java.util.Optional;

@Service
public class AppUserService {

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private ParticipationRepository participationRepository;

    // REGISTRAZIONE CON VALIDAZIONI
    public AppUser registerUser(AppUser user) {
        // Validazione nome
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            throw new RuntimeException("Nome obbligatorio");
        }
        
        // Validazione email
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new RuntimeException("Email obbligatoria");
        }
        if (!user.getEmail().contains("@")) {
            throw new RuntimeException("Email non valida");
        }
        
        Optional<AppUser> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email già registrata");
        }
        
        // Validazione password
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            throw new RuntimeException("Password deve avere almeno 6 caratteri");
        }
        
        // Validazione ruolo
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("USER");
        } else {
            String role = user.getRole().toUpperCase();
            if (!role.equals("USER") && !role.equals("RESTAURATEUR") && !role.equals("ADMIN")) {
                throw new RuntimeException("Ruolo non valido (USER, RESTAURATEUR, ADMIN)");
            }
            user.setRole(role);
        }
        
        return userRepository.save(user);
    }

    // LOGIN
    public AppUser login(String email, String password) {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Password errata");
        }
        return user;
    }

    // UTILITY
    public AppUser getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utente non trovato con ID: " + id));
    }

    public AppUser findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    // BAN ACCOUNT (ELIMINA UTENTE)
    @Transactional
    public void banUser(Long userId, Long adminId) {
        // Verifica che admin esista e sia ADMIN
        AppUser admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin non trovato"));
        
        if (!"ADMIN".equals(admin.getRole())) {
            throw new RuntimeException("Solo ADMIN possono bannare utenti");
        }
        
        // Verifica utente da bannare esista
        AppUser userToBan = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));
        
        // Non puoi bannare te stesso
        if (userId.equals(adminId)) {
            throw new RuntimeException("Non puoi bannare te stesso");
        }
        
        // Non puoi bannare un altro ADMIN
        if ("ADMIN".equals(userToBan.getRole())) {
            throw new RuntimeException("Non puoi bannare un altro ADMIN");
        }
        
        // Cancella tutte le partecipazioni
        participationRepository.deleteByUserId(userId);
        
        // Cancella utente
        userRepository.deleteById(userId);
    }

    @PostConstruct
    public void init() {
    }
}