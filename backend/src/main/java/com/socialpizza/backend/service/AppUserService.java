package com.socialpizza.backend.service;

import com.socialpizza.backend.entity.AppUser;
import com.socialpizza.backend.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import java.util.Optional;

@Service
public class AppUserService {

    @Autowired
    private AppUserRepository userRepository;

    // REGISTRAZIONE
    public AppUser registerUser(AppUser user) {
        Optional<AppUser> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email già registrata!");
        }
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
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

    @PostConstruct
    public void init() {
        // Creazione Admin
        if (userRepository.findByEmail("admin@socialpizza.it").isEmpty()) {
            AppUser admin = new AppUser();
            admin.setName("Admin");
            admin.setSurname("SocialPizza");
            admin.setEmail("admin@socialpizza.it");
            admin.setPassword("admin123");
            admin.setRole("ADMIN");
            admin.setIsVerified(true);
            admin.setBio("Super admin di SocialPizza");
            userRepository.save(admin);
        }

        // Creazione Ristoratore (Luigi)
        if (userRepository.findByEmail("luigi@pizzeria.it").isEmpty()) {
            AppUser luigi = new AppUser();
            luigi.setName("Luigi");
            luigi.setSurname("Rossi");
            luigi.setEmail("luigi@pizzeria.it");
            luigi.setPassword("password123");
            luigi.setRole("RESTAURATEUR");
            luigi.setIsVerified(true);
            luigi.setBio("Proprietario della Pizzeria Da Luigi");
            userRepository.save(luigi);
        }

        // Creazione Pizza Lover (Mario)
        if (userRepository.findByEmail("mario@gmail.com").isEmpty()) {
            AppUser mario = new AppUser();
            mario.setName("Mario");
            mario.setSurname("Bianchi");
            mario.setEmail("mario@gmail.com");
            mario.setPassword("12345");
            mario.setRole("USER");
            mario.setIsVerified(false);
            mario.setBio("Amante di pizza e anime");
            userRepository.save(mario);
        }
    }
}