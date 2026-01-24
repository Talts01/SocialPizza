package com.socialpizza.backend.service;

import com.socialpizza.backend.entity.*;
import com.socialpizza.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {

    @Autowired private SocialEventRepository eventRepository;
    @Autowired private ParticipationRepository participationRepository;
    @Autowired private RestaurantRepository restaurantRepository;

    // USIAMO IL SERVICE, NON IL REPOSITORY DIRETTO
    @Autowired private AppUserService userService;

    // 1. CREA EVENTO
    public SocialEvent createEvent(SocialEvent event, Long restaurantId, Long userId) {
        // Usa il Service per recuperare l'utente
        AppUser organizer = userService.getUserById(userId);

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Ristorante non trovato"));

        event.setOrganizer(organizer);
        event.setRestaurant(restaurant);

        if ("RESTAURATEUR".equals(organizer.getRole()) && restaurant.getOwner().getId().equals(userId)) {
            event.setStatus("APPROVED");
        } else {
            event.setStatus("PENDING");
        }

        SocialEvent savedEvent = eventRepository.save(event);

        if ("APPROVED".equals(savedEvent.getStatus())) {
            autoJoinOrganizer(savedEvent);
        }

        return savedEvent;
    }

    // 2. CAMBIA STATO
    public SocialEvent changeEventStatus(Long eventId, String newStatus) {
        SocialEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento non trovato"));

        event.setStatus(newStatus);
        SocialEvent savedEvent = eventRepository.save(event);

        if ("APPROVED".equals(newStatus)) {
            autoJoinOrganizer(savedEvent);
        }

        return savedEvent;
    }

    // 3. PARTECIPA (OTTIMIZZATO)
    public Participation joinEvent(Long userId, Long eventId) {
        SocialEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento non trovato"));

        AppUser user = userService.getUserById(userId);

        if (!"APPROVED".equals(event.getStatus())) {
            throw new RuntimeException("Non puoi iscriverti a un evento non ancora confermato");
        }

        if (participationRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new RuntimeException("Sei già iscritto a questo evento!");
        }

        // OTTIMIZZAZIONE: Contiamo tramite SQL invece di scaricare tutta la lista
        long currentParticipants = participationRepository.countByEventId(eventId);
        if (currentParticipants >= event.getMaxParticipants()) {
            throw new RuntimeException("Evento Sold Out! Posti esauriti.");
        }

        Participation participation = new Participation();
        participation.setEvent(event);
        participation.setUser(user);
        participation.setRegistrationDate(LocalDateTime.now());

        return participationRepository.save(participation);
    }

    // 4. LETTURE
    public List<SocialEvent> getAllApprovedEvents() {
        return eventRepository.findByStatus("APPROVED");
    }

    public List<SocialEvent> getApprovedOrPendingEvents() {
        return eventRepository.findByStatusIn(List.of("APPROVED", "PENDING"));
    }

    public List<SocialEvent> getEventsByRestaurant(Long restaurantId) {
        return eventRepository.findByRestaurantId(restaurantId);
    }

    public List<SocialEvent> getEventsJoinedByUser(Long userId) {
        return participationRepository.findByUserId(userId).stream()
                .map(Participation::getEvent).toList();
    }

    public List<SocialEvent> getEventsCreatedByUser(Long userId) {
        return eventRepository.findByOrganizerId(userId);
    }

    // 5. MODERATORE
    public SocialEvent moderatorDecision(Long eventId, Long restaurateurId, String decision, String comment) {
        SocialEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento non trovato"));

        if (!event.getRestaurant().getOwner().getId().equals(restaurateurId)) {
            throw new RuntimeException("Non sei il proprietario!");
        }

        event.setStatus(decision);
        event.setDecisionDate(LocalDateTime.now());

        if ("REJECTED".equals(decision)) {
            event.setRejectionReason(comment);
        } else {
            event.setModeratorComment(comment);
        }

        SocialEvent savedEvent = eventRepository.save(event);

        if ("APPROVED".equals(decision)) {
            autoJoinOrganizer(savedEvent);
        }
        return savedEvent;
    }

    // 6. PENDING PER RISTORATORE
    public List<SocialEvent> getPendingEventsByRestaurateurId(Long restaurateurId) {
        return restaurantRepository.findByOwnerId(restaurateurId).stream()
                .flatMap(r -> eventRepository.findByRestaurantIdAndStatus(r.getId(), "PENDING").stream())
                .toList();
    }

    // 7. PARTECIPANTI
    public List<Participation> getParticipantsByEventId(Long eventId) {
        return participationRepository.findByEventId(eventId);
    }

    // 8. CANCELLA ISCRIZIONE
    public void leaveEvent(Long userId, Long eventId) {
        Participation toDelete = participationRepository.findByEventId(eventId).stream()
                .filter(p -> p.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Non sei iscritto"));
        participationRepository.delete(toDelete);
    }

    // 9. RITIRA PROPOSTA
    public void withdrawEvent(Long eventId, Long userId) {
        SocialEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento non trovato"));

        if (!event.getOrganizer().getId().equals(userId)) throw new RuntimeException("Non autorizzato");
        if (!"PENDING".equals(event.getStatus())) throw new RuntimeException("Solo eventi pending");

        eventRepository.delete(event);
    }

    public boolean isUserParticipating(Long userId, Long eventId) {
        return participationRepository.existsByUserIdAndEventId(userId, eventId);
    }



    private void autoJoinOrganizer(SocialEvent event) {
        try {
            if (!participationRepository.existsByUserIdAndEventId(event.getOrganizer().getId(), event.getId())) {
                Participation p = new Participation();
                p.setUser(event.getOrganizer());
                p.setEvent(event);
                p.setRegistrationDate(LocalDateTime.now());
                participationRepository.save(p);
            }
        } catch (Exception e) {
            System.err.println("Errore auto-join: " + e.getMessage());
        }
    }
}