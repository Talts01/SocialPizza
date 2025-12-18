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
    @PostConstruct
    public void init() {
        // Creiamo il Ristoratore (Luigi) se non esiste
        if (userRepository.findByEmail("luigi@pizzeria.it").isEmpty()) {
            userRepository.save(new AppUser(null, "Luigi", "Rossi", "luigi@pizzeria.it", "password123", "RESTAURATEUR"));

        }

        // Creiamo il Pizza Lover (Mario) se non esiste
        if (userRepository.findByEmail("mario@gmail.com").isEmpty()) {
            userRepository.save(new AppUser(null, "Mario", "Bianchi", "mario@gmail.com", "12345", "USER"));

        }
    }
}




