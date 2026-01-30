package com.socialpizza.backend.service;

import com.socialpizza.backend.entity.AppUser;
import com.socialpizza.backend.entity.Restaurant;
import com.socialpizza.backend.entity.SocialEvent;
import com.socialpizza.backend.repository.AppUserRepository;
import com.socialpizza.backend.repository.ParticipationRepository;
import com.socialpizza.backend.repository.RestaurantRepository;
import com.socialpizza.backend.repository.SocialEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Gestisce registrazione, login, recupero dati e operazioni amministrative
 */
@Service
public class AppUserService {

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private ParticipationRepository participationRepository;

    @Autowired
    private SocialEventRepository eventRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    /**
     * Registra un nuovo utente nel sistema.
     */
    public AppUser registerUser(AppUser user) {
        //  Validazione Campi
        if (user.getName() == null || user.getName().trim().isEmpty()) throw new RuntimeException("Nome obbligatorio");
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) throw new RuntimeException("Email obbligatoria");

        // Controllo formato e se ci sono altre email uguali
        if (!user.getEmail().contains("@")) throw new RuntimeException("Email non valida");
        if (userRepository.findByEmail(user.getEmail()).isPresent()) throw new RuntimeException("Email già registrata");

        // Controllo Password maggiore di 6 caratteri
        if (user.getPassword() == null || user.getPassword().length() < 6) throw new RuntimeException("Password min 6 caratteri");

        // Gestione Ruoli
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("UTENTE");
        } else {
            String role = user.getRole().toUpperCase();
            if (!role.equals("UTENTE") && !role.equals("RISTORATORE") && !role.equals("ADMIN")) {
                throw new RuntimeException("Ruolo non valido");
            }
            user.setRole(role);
        }

        return userRepository.save(user);
    }

    /**
     * Gestisce il login verificando email e password.
     */
    public AppUser login(String email, String password) {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        if (!user.getPassword().equals(password)) throw new RuntimeException("Password errata");
        return user;
    }


    /**
     * Recupera un utente tramite ID, lanciando un errore se non esiste.
     */
    public AppUser getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utente non trovato ID: " + id));
    }

    /**
     * Recupera un utente tramite Email.
     */
    public AppUser findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }


    /**
     * Banna un utente dal sistema.
     */
    @Transactional
    public void banUser(Long userId, Long adminId) {
        // Verifica che chi sta bannando sia davvero un Admin
        AppUser admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin non trovato"));

        if (!"ADMIN".equals(admin.getRole())) throw new RuntimeException("Solo ADMIN possono bannare");

        // Verifica che l'utente da bannare esista e non sia l'admin stesso
        AppUser userToBan = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utente da bannare non trovato"));

        if (userId.equals(adminId)) {
            throw new RuntimeException("Non puoi bannare te stesso");
        }

        // RACCOLTA DATI DA ELIMINARE
        // Dobbiamo trovare tutti gli eventi collegati all'utente.
        Set<SocialEvent> eventsToDelete = new HashSet<>();

        eventsToDelete.addAll(eventRepository.findByOrganizerId(userId));


        List<Restaurant> userRestaurants = restaurantRepository.findByOwnerId(userId);
        for (Restaurant r : userRestaurants) {
            eventsToDelete.addAll(eventRepository.findByRestaurantId(r.getId()));
        }

        // ESECUZIONE CANCELLAZIONI
        for (SocialEvent event : eventsToDelete) {
            participationRepository.deleteByEventId(event.getId());
            eventRepository.delete(event);
        }

        restaurantRepository.deleteAll(userRestaurants);

        participationRepository.deleteByUserId(userId);
        userRepository.deleteById(userId);
    }

}