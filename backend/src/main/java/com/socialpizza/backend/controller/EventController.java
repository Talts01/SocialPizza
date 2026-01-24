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

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "${cors.allowed.origins}", allowCredentials = "true")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private AppUserService userService;

    // 1. CREA EVENTO
    @PostMapping("/create")
    public ResponseEntity<?> createEvent(
            @RequestBody SocialEvent event,
            @RequestParam Long restaurantId,
            HttpSession session) {

        AppUser organizer = getAuthenticatedUser(session);
        if (organizer == null) return ResponseEntity.status(401).body("Devi essere loggato");

        try {
            SocialEvent created = eventService.createEvent(event, restaurantId, organizer.getId());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. LISTA EVENTI APPROVATI
    @GetMapping("/approved")
    public List<SocialEvent> getApprovedEvents() {
        return eventService.getAllApprovedEvents();
    }

    // 2b. LISTA EVENTI PUBBLICI (APPROVED + PENDING)
    @GetMapping("/public")
    public List<SocialEvent> getApprovedOrPending() {
        return eventService.getApprovedOrPendingEvents();
    }

    // 3. LISTA EVENTI PER RISTORATORE
    @GetMapping("/restaurant/{restaurantId}")
    public List<SocialEvent> getRestaurantEvents(@PathVariable Long restaurantId) {
        return eventService.getEventsByRestaurant(restaurantId);
    }

    // 4. CAMBIA STATO
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

    // 5. PARTECIPA ALL'EVENTO
    @PostMapping("/{eventId}/join")
    public ResponseEntity<?> joinEvent(@PathVariable Long eventId, HttpSession session) {
        AppUser user = getAuthenticatedUser(session);
        if (user == null) return ResponseEntity.status(401).body("Devi essere loggato");

        try {
            Participation p = eventService.joinEvent(user.getId(), eventId);
            return ResponseEntity.ok(p);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 6. I MIEI EVENTI (A cui partecipo)
    @GetMapping("/joined")
    public ResponseEntity<?> getJoinedEvents(HttpSession session) {
        AppUser user = getAuthenticatedUser(session);
        if (user == null) return ResponseEntity.status(401).body("Devi essere loggato");

        return ResponseEntity.ok(eventService.getEventsJoinedByUser(user.getId()));
    }

    // 7. EVENTI CREATI DA ME
    @GetMapping("/created")
    public ResponseEntity<?> getCreatedEvents(HttpSession session) {
        AppUser user = getAuthenticatedUser(session);
        if (user == null) return ResponseEntity.status(401).body("Devi essere loggato");

        return ResponseEntity.ok(eventService.getEventsCreatedByUser(user.getId()));
    }

    // 8. DECISIONE DEL RISTORATORE
    @PatchMapping("/{eventId}/moderator/decision")
    public ResponseEntity<?> moderatorDecision(
            @PathVariable Long eventId,
            @RequestParam String decision,
            @RequestParam(required = false) String comment,
            HttpSession session) {

        AppUser restaurateur = getAuthenticatedUser(session);
        if (restaurateur == null) return ResponseEntity.status(401).body("Non loggato");

        try {
            if (!"RESTAURATEUR".equals(restaurateur.getRole())) {
                return ResponseEntity.status(403).body("Solo i ristoratori possono moderare");
            }
            SocialEvent updated = eventService.moderatorDecision(eventId, restaurateur.getId(), decision, comment);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 9. LISTA PENDING PER RISTORATORE
    @GetMapping("/pending/for-restaurateur")
    public ResponseEntity<?> getPendingEventsForRestaurateur(HttpSession session) {
        AppUser restaurateur = getAuthenticatedUser(session);
        if (restaurateur == null) return ResponseEntity.status(401).body("Non loggato");

        try {
            if (!"RESTAURATEUR".equals(restaurateur.getRole())) {
                return ResponseEntity.status(403).body("Accesso negato");
            }
            return ResponseEntity.ok(eventService.getPendingEventsByRestaurateurId(restaurateur.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 10. LISTA PARTECIPANTI DI UN EVENTO
    @GetMapping("/{eventId}/participants")
    public ResponseEntity<?> getEventParticipants(@PathVariable Long eventId) {
        return ResponseEntity.ok(eventService.getParticipantsByEventId(eventId));
    }

    // 11. VERIFICA SE SONO ISCRITTO
    @GetMapping("/{eventId}/is-participating")
    public ResponseEntity<?> isUserParticipating(@PathVariable Long eventId, HttpSession session) {
        AppUser user = getAuthenticatedUser(session);
        if (user == null) return ResponseEntity.ok(false);

        boolean isParticipating = eventService.isUserParticipating(user.getId(), eventId);
        return ResponseEntity.ok(isParticipating);
    }

    // 12. CANCELLA ISCRIZIONE
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

    // 13. RITIRA PROPOSTA
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

    // HELPER METHOD
    private AppUser getAuthenticatedUser(HttpSession session) {
        String email = (String) session.getAttribute("username");
        if (email == null) return null;
        return userService.findByEmail(email);
    }
}