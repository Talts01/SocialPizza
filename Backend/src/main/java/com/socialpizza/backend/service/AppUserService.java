package com.socialpizza.backend.service;

import com.socialpizza.backend.entity.AppUser;
import com.socialpizza.backend.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;

import java.util.Optional;

@Service // Fondamentale: dice a Spring che questa classe contiene Logica di Business. È l'etichetta che fa capire a Spring Boot che questa classe deve essere caricata all'avvio.
public class AppUserService {

    @Autowired // Dice a Spring: "Dammi tu l'istanza del Repository, non voglio crearla io con new"
    private AppUserRepository userRepository;

    // METODO 1: REGISTRAZIONE
    public AppUser registerUser(AppUser user) {
        // Controllo se esiste già un utente con questa email
        Optional<AppUser> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Email già registrata!");
        }
        // Se non esiste, salvo il nuovo utente
        return userRepository.save(user);
    }

    // METODO 2: LOGIN (Semplificato)
    public AppUser login(String email, String password) {
        // Cerco l'utente per email
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        // Controllo se la password corrisponde


        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Password errata");
        }

        return user;
    }

    // METODO 3: TROVA UTENTE PER ID (Utile per dopo)
    public AppUser getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utente non trovato con ID: " + id));
    }

    // METODO 4: TROVA UTENTE PER EMAIL
    public AppUser findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElse(null);
    }

    @PostConstruct
    public void init() {
        // Creiamo il Ristoratore (Luigi) se non esiste
        if (userRepository.findByEmail("luigi@pizzeria.it").isEmpty()) {
            AppUser luigi = new AppUser();
            luigi.setName("Luigi");
            luigi.setSurname("Rossi");
            luigi.setEmail("luigi@pizzeria.it");
            luigi.setPassword("password123");
            luigi.setRole("RESTAURATEUR");
            luigi.setIsVerified(true); // I ristoratori iniziali sono verificati
            luigi.setBio("Proprietario della Pizzeria Da Luigi");
            userRepository.save(luigi);
        }

        // Creiamo il Pizza Lover (Mario) se non esiste
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

        // Creiamo l'Admin se non esiste
        if (userRepository.findByEmail("admin@socialpizza.it").isEmpty()) {
            AppUser admin = new AppUser();
            admin.setName("Admin");
            admin.setSurname("SocialPizza");
            admin.setEmail("admin@socialpizza.it");
            admin.setPassword("admin123");
            admin.setRole("ADMIN");
            admin.setIsVerified(true);
            admin.setBio("Amministratore della piattaforma");
            userRepository.save(admin);
        }
    }
}




