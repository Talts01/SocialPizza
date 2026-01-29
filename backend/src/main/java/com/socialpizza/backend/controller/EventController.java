package com.socialpizza.backend.controller;

import com.socialpizza.backend.entity.AppUser;
import com.socialpizza.backend.entity.Participation;
import com.socialpizza.backend.entity.SocialEvent;
import com.socialpizza.backend.service.AppUserService;
import com.socialpizza.backend.service.EventService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller principale per la gestione degli eventi.
 */
@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "${cors.allowed.origins}", allowCredentials = "true")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private AppUserService userService;


    /**
     *  Crea un nuovo evento.
     */
    @PostMapping("/create")
    public ResponseEntity<?> createEvent(
            @RequestBody SocialEvent event,
            @RequestParam Long restaurantId,
            HttpSession session) {

        AppUser organizer = getAuthenticatedUser(session);
        if (organizer == null) return ResponseEntity.status(401).body("Devi essere loggato");

        try {
            // Delega al service la logica di stato iniziale (PENDING vs APPROVED)
            SocialEvent created = eventService.createEvent(event, restaurantId, organizer.getId());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Restituisce la lista di tutti gli eventi confermati (APPROVED).
     */
    @GetMapping("/approved")
    public List<SocialEvent> getApprovedEvents() {
        return eventService.getAllApprovedEvents();
    }

    /**
     *  Restituisce eventi sia approvati che in attesa.
     */
    @GetMapping("/public")
    public List<SocialEvent> getApprovedOrPending() {
        return eventService.getApprovedOrPendingEvents();
    }

    /**
     *  Filtra gli eventi per uno specifico ristorante.
     */
    @GetMapping("/restaurant/{restaurantId}")
    public List<SocialEvent> getRestaurantEvents(@PathVariable Long restaurantId) {
        return eventService.getEventsByRestaurant(restaurantId);
    }


    /**
     *  Modifica generica dello stato di un evento .
     */
    @PatchMapping("/{eventId}/status")
    public ResponseEntity<?> changeStatus(
            @PathVariable Long eventId,
            @RequestParam String status) {
        try {
            return ResponseEntity.ok(eventService.changeEventStatus(eventId, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Permette a un utente loggato di iscriversi a un evento.
     */
    @PostMapping("/{eventId}/join")
    public ResponseEntity<?> joinEvent(@PathVariable Long eventId, HttpSession session) {
        AppUser user = getAuthenticatedUser(session);
        if (user == null) return ResponseEntity.status(401).body("Devi essere loggato");

        try {
            Participation p = eventService.joinEvent(user.getId(), eventId);
            return ResponseEntity.ok(p);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage()); // Es. "Sold Out" o "Già iscritto"
        }
    }


    /**
     * Restituisce gli eventi a cui l'utente loggato si è iscritto.
     */
    @GetMapping("/joined")
    public ResponseEntity<?> getJoinedEvents(HttpSession session) {
        AppUser user = getAuthenticatedUser(session);
        if (user == null) return ResponseEntity.status(401).body("Devi essere loggato");

        return ResponseEntity.ok(eventService.getEventsJoinedByUser(user.getId()));
    }

    /**
     * Restituisce gli eventi creati (organizzati) dall'utente loggato.
     */
    @GetMapping("/created")
    public ResponseEntity<?> getCreatedEvents(HttpSession session) {
        AppUser user = getAuthenticatedUser(session);
        if (user == null) return ResponseEntity.status(401).body("Devi essere loggato");

        return ResponseEntity.ok(eventService.getEventsCreatedByUser(user.getId()));
    }

    /**
     * Il Ristoratore accetta o rifiuta una proposta di evento nel suo locale.
     */
    @PatchMapping("/{eventId}/moderator/decision")
    public ResponseEntity<?> moderatorDecision(
            @PathVariable Long eventId,
            @RequestParam String decision, // "APPROVED" o "REJECTED"
            @RequestParam(required = false) String comment,
            HttpSession session) {

        AppUser restaurateur = getAuthenticatedUser(session);
        if (restaurateur == null) return ResponseEntity.status(401).body("Non loggato");

        try {
            if (!"RISTORATORE".equals(restaurateur.getRole())) {
                return ResponseEntity.status(403).body("Solo i ristoratori possono moderare");
            }
            // verificherà che il ristoratore sia davvero il proprietario del locale in questione
            SocialEvent updated = eventService.moderatorDecision(eventId, restaurateur.getId(), decision, comment);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Restituisce al ristoratore la lista delle proposte in attesa di decisione.
     */
    @GetMapping("/pending/for-restaurateur")
    public ResponseEntity<?> getPendingEventsForRestaurateur(HttpSession session) {
        AppUser restaurateur = getAuthenticatedUser(session);
        if (restaurateur == null) return ResponseEntity.status(401).body("Non loggato");

        try {
            if (!"RISTORATORE".equals(restaurateur.getRole())) {
                return ResponseEntity.status(403).body("Accesso negato");
            }
            return ResponseEntity.ok(eventService.getPendingEventsByRestaurateurId(restaurateur.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    /**
     * Lista degli utenti partecipanti a un evento specifico.
     */
    @GetMapping("/{eventId}/participants")
    public ResponseEntity<?> getEventParticipants(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.getParticipantsByEventId(eventId));
    }

    /**
     * booleano per verificare  se l'utente corrente è già iscritto.
     */
    @GetMapping("/{eventId}/is-participating")
    public ResponseEntity<?> isUserParticipating(@PathVariable Long eventId, HttpSession session) {
        AppUser user = getAuthenticatedUser(session);
        if (user == null) return ResponseEntity.ok(false);

        boolean isParticipating = eventService.isUserParticipating(user.getId(), eventId);
        return ResponseEntity.ok(isParticipating);
    }

    /**
     *Permette all'utente di cancellare la propria iscrizione.
     */
    @DeleteMapping("/{eventId}/leave")
    public ResponseEntity<?> leaveEvent(@PathVariable Long eventId, HttpSession session) {
        AppUser user = getAuthenticatedUser(session);
        if (user == null) return ResponseEntity.status(401).body("Devi essere loggato");

        try {
            eventService.leaveEvent(user.getId(), eventId);
            return ResponseEntity.ok("Iscrizione cancellata");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * L'organizzatore ritira una proposta prima che venga approvata.
     */
    @DeleteMapping("/{eventId}/withdraw")
    public ResponseEntity<?> withdrawEvent(@PathVariable Long eventId, HttpSession session) {
        AppUser user = getAuthenticatedUser(session);
        if (user == null) return ResponseEntity.status(401).body("Devi essere loggato");

        try {
            eventService.withdrawEvent(eventId, user.getId());
            return ResponseEntity.ok("Proposta ritirata");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Restituisce al ristoratore la lista dei suoi eventi già confermati.
     */
    @GetMapping("/approved/for-restaurateur")
    public ResponseEntity<?> getApprovedEventsForRestaurateur(HttpSession session) {
        AppUser restaurateur = getAuthenticatedUser(session);
        if (restaurateur == null) return ResponseEntity.status(401).body("Non loggato");

        if (!"RISTORATORE".equals(restaurateur.getRole())) {
            return ResponseEntity.status(403).body("Accesso negato");
        }
        return ResponseEntity.ok(eventService.getApprovedEventsByRestaurateurId(restaurateur.getId()));
    }

    /**
     *  Permette al Ristoratore di cancellare un evento confermato nel suo locale.
     */
    @DeleteMapping("/{eventId}/restaurateur/cancel")
    public ResponseEntity<?> cancelEventByRestaurateur(@PathVariable Long eventId, HttpSession session) {
        AppUser restaurateur = getAuthenticatedUser(session);
        if (restaurateur == null) return ResponseEntity.status(401).body("Non loggato");

        try {
            if (!"RISTORATORE".equals(restaurateur.getRole())) {
                return ResponseEntity.status(403).body("Solo i ristoratori possono cancellare eventi");
            }
            eventService.deleteEventByRestaurateur(eventId, restaurateur.getId());
            return ResponseEntity.ok("Evento cancellato con successo");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ottenere l'utente corrente dalla sessione.
     */
    private AppUser getAuthenticatedUser(HttpSession session) {
        String email = (String) session.getAttribute("username");
        if (email == null) return null;
        return userService.findByEmail(email);
    }
}