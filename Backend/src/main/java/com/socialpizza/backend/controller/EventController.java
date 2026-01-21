package com.socialpizza.backend.controller;

import com.socialpizza.backend.entity.Participation;
import com.socialpizza.backend.entity.SocialEvent;
// 👇 ECCO L'IMPORT CHE MANCAVA
import com.socialpizza.backend.entity.AppUser;
import com.socialpizza.backend.service.EventService;
import com.socialpizza.backend.repository.AppUserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class EventController {

    @Autowired
    private EventService eventService;
    @Autowired
    private AppUserRepository userRepo;

    @PostMapping("/create")
    public ResponseEntity<?> createEvent(
            @RequestBody SocialEvent event,
            @RequestParam Long restaurantId,
            HttpSession session) {

        String email = (String) session.getAttribute("username");
        if (email == null) {
            return ResponseEntity.status(401).body("Utente non loggato");
        }

        AppUser organizer = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato nel DB"));

        try {
            // Ora che AppUser è importato, getId() funzionerà (grazie a Lombok @Data)
            SocialEvent created = eventService.createEvent(event, restaurantId, organizer.getId());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. LISTA EVENTI APPROVATI (Per la Home)
    @GetMapping("/approved")
    public List<SocialEvent> getApprovedEvents() {
        return eventService.getAllApprovedEvents();
    }

    // 2b. LISTA EVENTI PUBBLICI (APPROVED + PENDING) - i pending non sono ancora partecipabili
    @GetMapping("/public")
    public List<SocialEvent> getApprovedOrPending() {
        return eventService.getApprovedOrPendingEvents();
    }

    // 3. LISTA EVENTI PER RISTORATORE (Dashboard)
    @GetMapping("/restaurant/{restaurantId}")
    public List<SocialEvent> getRestaurantEvents(@PathVariable Long restaurantId) {
        return eventService.getEventsByRestaurant(restaurantId);
    }

    // 4. CAMBIA STATO (Approva/Rifiuta)
    // Esempio: PATCH /api/events/5/status?status=APPROVED
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
    // Esempio: POST /api/events/5/join?userId=1
    @PostMapping("/{eventId}/join")
    public ResponseEntity<?> joinEvent(
            @PathVariable Long eventId,
            HttpSession session) { // <--- Usiamo la Sessione, non il @RequestParam

        // 1. Chi è l'utente? Lo leggiamo dal cookie di sessione
        String email = (String) session.getAttribute("username");
        if (email == null) {
            return ResponseEntity.status(401).body("Devi essere loggato per partecipare!");
        }

        // 2. Recuperiamo l'utente dal DB per avere il suo ID
        AppUser user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        try {
            // 3. Chiamiamo il service usando l'ID dell'utente loggato
            // (Nota: il metodo del service joinEvent rimane uguale, cambia solo chi lo chiama)
            Participation p = eventService.joinEvent(user.getId(), eventId);
            return ResponseEntity.ok(p);
        } catch (Exception e) {
            // Questo restituisce il messaggio "Sei già iscritto" o "Evento pieno"
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/joined")
    public ResponseEntity<?> getJoinedEvents(HttpSession session) {
        // 1. Chi sta chiedendo i dati? (Controllo Sessione)
        String email = (String) session.getAttribute("username");
        if (email == null) {
            return ResponseEntity.status(401).body("Utente non loggato");
        }

        // 2. Recuperiamo l'utente completo (ci serve il suo ID)
        AppUser user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        try {
            // 3. Chiamiamo il service
            List<SocialEvent> myEvents = eventService.getEventsJoinedByUser(user.getId());
            return ResponseEntity.ok(myEvents);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/created")
    public ResponseEntity<?> getCreatedEvents(HttpSession session) {
        String email = (String) session.getAttribute("username");
        if (email == null) return ResponseEntity.status(401).build();

        AppUser user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        return ResponseEntity.ok(eventService.getEventsCreatedByUser(user.getId()));
    }

    // 6. ENDPOINT RISTORATORE: Approva/Rifiuta con commento
    @PatchMapping("/{eventId}/moderator/decision")
    public ResponseEntity<?> moderatorDecision(
            @PathVariable Long eventId,
            @RequestParam String decision, // "APPROVED" o "REJECTED"
            @RequestParam(required = false) String comment,
            HttpSession session) {

        // 1. Chi è il ristoratore che sta approvando?
        String email = (String) session.getAttribute("username");
        if (email == null) {
            return ResponseEntity.status(401).body("Ristoratore non loggato");
        }

        AppUser restaurateur = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        try {
            // 2. Verifica che sia un ristoratore
            if (!"RESTAURATEUR".equals(restaurateur.getRole())) {
                return ResponseEntity.status(403).body("Solo i ristoratori possono moderare");
            }

            // 3. Chiama il service per approvare/rifiutare
            SocialEvent updated = eventService.moderatorDecision(
                    eventId,
                    restaurateur.getId(),
                    decision,
                    comment
            );
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 7. ENDPOINT RISTORATORE: Visualizza eventi in sospeso
    @GetMapping("/pending/for-restaurateur")
    public ResponseEntity<?> getPendingEventsForRestaurateur(HttpSession session) {
        String email = (String) session.getAttribute("username");
        if (email == null) return ResponseEntity.status(401).build();

        AppUser restaurateur = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        try {
            if (!"RESTAURATEUR".equals(restaurateur.getRole())) {
                return ResponseEntity.status(403).body("Solo ristoratori");
            }
            // Restituisce solo eventi PENDING nei ristoranti di cui è proprietario
            List<SocialEvent> pending = eventService.getPendingEventsByRestaurateurId(restaurateur.getId());
            return ResponseEntity.ok(pending);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 8. DETTAGLIO EVENTO: Visualizza partecipanti
    @GetMapping("/{eventId}/participants")
    public ResponseEntity<?> getEventParticipants(@PathVariable Long eventId) {
        try {
            List<Participation> participants = eventService.getParticipantsByEventId(eventId);
            return ResponseEntity.ok(participants);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 8b. VERIFICA ISCRIZIONE: Controlla se l'utente è iscritto a un evento
    @GetMapping("/{eventId}/is-participating")
    public ResponseEntity<?> isUserParticipating(@PathVariable Long eventId, HttpSession session) {
        String email = (String) session.getAttribute("username");
        if (email == null) {
            return ResponseEntity.ok(false); // Non loggato = non iscritto
        }

        try {
            AppUser user = userRepo.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utente non trovato"));
            
            boolean isParticipating = eventService.isUserParticipating(user.getId(), eventId);
            return ResponseEntity.ok(isParticipating);
        } catch (Exception e) {
            return ResponseEntity.ok(false);
        }
    }

    // 9. CANCELLA ISCRIZIONE
    @DeleteMapping("/{eventId}/leave")
    public ResponseEntity<?> leaveEvent(@PathVariable Long eventId, HttpSession session) {
        String email = (String) session.getAttribute("username");
        if (email == null) {
            return ResponseEntity.status(401).body("Utente non loggato");
        }

        AppUser user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        try {
            eventService.leaveEvent(user.getId(), eventId);
            return ResponseEntity.ok("Iscrizione cancellata con successo");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 10. RITIRA PROPOSTA (solo per organizzatore se PENDING)
    @DeleteMapping("/{eventId}/withdraw")
    public ResponseEntity<?> withdrawEvent(@PathVariable Long eventId, HttpSession session) {
        String email = (String) session.getAttribute("username");
        if (email == null) {
            return ResponseEntity.status(401).body("Utente non loggato");
        }

        AppUser user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        try {
            eventService.withdrawEvent(eventId, user.getId());
            return ResponseEntity.ok("Proposta ritirata con successo");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 11. ELIMINA EVENTO (Solo ADMIN)
    @DeleteMapping("/{eventId}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long eventId, HttpSession session) {
        String email = (String) session.getAttribute("username");
        if (email == null) {
            return ResponseEntity.status(401).body("Utente non loggato");
        }

        AppUser user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        // Verifica che sia un ADMIN
        if (!"ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).body("Solo gli amministratori possono eliminare eventi");
        }

        try {
            eventService.deleteEvent(eventId);
            return ResponseEntity.ok("Evento eliminato con successo");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

//Qui avviene la magia di SocialPizza. Questo controller gestisce le azioni principali degli utenti.
//
//Le Funzioni:
//
//createEvent (POST /api/events/create):
//
//Input: Riceve i dettagli dell'evento (Titolo, Data), ma anche userId (chi organizza) e restaurantId (dove si fa).
//
//Cosa fa: Mette insieme i pezzi. Chiama il Service dicendo: "L'utente X vuole fare l'evento Y nel posto Z".
//
//Risultato: Salva l'evento con stato "PENDING" (In attesa).
//
//getApprovedEvents (GET /api/events/approved):
//
//Filtro: Mostra solo gli eventi che il ristoratore ha già accettato.
//
//Perché: I clienti normali non devono vedere le proposte in attesa o rifiutate, ma solo quelle a cui possono partecipare.
//
//getRestaurantEvents (GET .../restaurant/{id}):
//
//Dashboard Ristoratore: Questa serve al proprietario della pizzeria per vedere le richieste in arrivo (sia Pending che Approved) solo per il suo locale.
//
//changeStatus (PATCH .../status):
//
//Azione: È il bottone "Accetta" o "Rifiuta" del ristoratore.
//
//Tecnica: Usa PATCH invece di POST perché stiamo modificando solo un piccolo pezzo (lo stato) di un dato che esiste già.
//
//joinEvent (POST .../join):
//
//Azione: È il bottone "Partecipa" del cliente.
//
//Logica: Il controller riceve la richiesta e la passa al Service, che controllerà se ci sono ancora posti liberi prima di dire "OK".
