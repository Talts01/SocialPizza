package com.socialpizza.backend.controller;

import com.socialpizza.backend.entity.AppUser;
import com.socialpizza.backend.entity.Category;
import com.socialpizza.backend.entity.Restaurant;
import com.socialpizza.backend.repository.*;
import com.socialpizza.backend.service.AppUserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller dedicato alle operazioni amministrative.
 * Gestisce la logica per utenti, ristoranti, categorie ed eventi.
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "${cors.allowed.origins}", allowCredentials = "true")
public class AdminController {

    @Autowired
    private AppUserService userService;

    @Autowired private AppUserRepository userRepository;
    @Autowired private RestaurantRepository restaurantRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private SocialEventRepository eventRepository;
    @Autowired private ParticipationRepository participationRepository;

    /**
     *  verificare se l'utente loggato è un ADMIN.
     */
    private boolean isAdmin(HttpSession session) {
        String role = (String) session.getAttribute("role");
        return "ADMIN".equals(role);
    }

    // --- SEZIONE GESTIONE UTENTI ---

    /**
     * Recupera la lista completa di tutti gli utenti registrati.
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(HttpSession session) {
        // Controllo di sicurezza: solo gli admin possono vedere la lista
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Accesso negato");
        return ResponseEntity.ok(userRepository.findAll());
    }

    /**
     * Crea un nuovo utente manualmente
     */
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody AppUser user, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Accesso negato");

        try {
            // Delega al service la logica di validazione e hashing della password
            AppUser created = userService.registerUser(user);
            return ResponseEntity.ok(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Banna un utente e rimuove tutti i dati associati.
     */
    @DeleteMapping("/users/{id}/ban")
    public ResponseEntity<?> banUser(@PathVariable Long id, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Accesso negato");

        // Recupera l'ID dell'admin che sta effettuando l'azione per i controlli nel service
        Long adminId = (Long) session.getAttribute("userId");
        try {
            // Il service gestisce la cancellazione a cascata (eventi, partecipazioni, ristoranti)
            userService.banUser(id, adminId);
            return ResponseEntity.ok("Utente bannato ed eliminato");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Modifica il ruolo di un utente esistente.
     */
    @PatchMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(@PathVariable Long id, @RequestParam String role, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Accesso negato");

        AppUser user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("Utente non trovato");

        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    // --- SEZIONE GESTIONE RISTORANTI ---

    /**
     * Restituisce la lista di tutti i ristoranti presenti nel sistema.
     */
    @GetMapping("/restaurants")
    public ResponseEntity<?> getAllRestaurants(HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Accesso negato");
        return ResponseEntity.ok(restaurantRepository.findAll());
    }

    /**
     * Crea un nuovo ristorante.
     */
    @PostMapping("/restaurants")
    public ResponseEntity<?> createRestaurant(@RequestBody Restaurant restaurant, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Accesso negato");
        try {
            return ResponseEntity.ok(restaurantRepository.save(restaurant));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore creazione ristorante: " + e.getMessage());
        }
    }

    /**
     * Elimina un ristorante tramite ID.
     */
    @DeleteMapping("/restaurants/{id}")
    public ResponseEntity<?> deleteRestaurant(@PathVariable Long id, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Accesso negato");
        try {
            restaurantRepository.deleteById(id);
            return ResponseEntity.ok("Ristorante eliminato");
        } catch (Exception e) {
            // Gestisce il caso in cui il ristorante non possa essere eliminato per vincoli di chiave esterna (es. eventi associati)
            return ResponseEntity.status(409).body("Impossibile eliminare: il ristorante è collegato a degli eventi.");
        }
    }

    // --- SEZIONE GESTIONE CATEGORIE ---

    /**
     * Restituisce tutte le categorie di eventi disponibili.
     */
    @GetMapping("/categories")
    public ResponseEntity<?> getAllCategories(HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Accesso negato");
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    /**
     * Aggiunge una nuova categoria al sistema.
     */
    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody Category category, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Accesso negato");
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    /**
     * Elimina una categoria esistente.
     */
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Accesso negato");
        try {
            categoryRepository.deleteById(id);
            return ResponseEntity.ok("Categoria eliminata");
        } catch (Exception e) {
            // Impedisce l'eliminazione se la categoria è già in uso in qualche evento
            return ResponseEntity.status(409).body("Impossibile eliminare: categoria in uso.");
        }
    }

    // --- SEZIONE GESTIONE EVENTI ---

    /**
     * Permette all'admin di cancellare un evento.
     */
    @DeleteMapping("/events/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).body("Accesso negato");

        try {
            // Rimuove manualmente le partecipazioni associate prima di eliminare l'evento per mantenere l'integrità
            participationRepository.deleteByEventId(id);
            eventRepository.deleteById(id);
            return ResponseEntity.ok("Evento eliminato dall'amministratore");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore cancellazione evento: " + e.getMessage());
        }
    }
}