package com.socialpizza.backend.service;

import com.socialpizza.backend.entity.*;
import com.socialpizza.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service principale che gestisce la logica di business degli eventi.
 */
@Service
public class EventService {

    @Autowired private SocialEventRepository eventRepository;
    @Autowired private ParticipationRepository participationRepository;
    @Autowired private RestaurantRepository restaurantRepository;
    @Autowired private AppUserService userService;


    /**
     * Crea un nuovo evento
     */
    public SocialEvent createEvent(SocialEvent event, Long restaurantId, Long userId) {
        AppUser organizer = userService.getUserById(userId);

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Ristorante non trovato"));

        event.setOrganizer(organizer);
        event.setRestaurant(restaurant);

        if ("RISTORATORE".equals(organizer.getRole()) && restaurant.getOwner().getId().equals(userId)) {
            event.setStatus("APPROVED");
        } else {
            event.setStatus("PENDING");
        }

        SocialEvent savedEvent = eventRepository.save(event);

        // Se l'evento è approvato subito, iscriviamo automaticamente l'organizzatore
        if ("APPROVED".equals(savedEvent.getStatus())) {
            autoJoinOrganizer(savedEvent);
        }

        return savedEvent;
    }

    /**
     * Modifica generica dello stato di un evento.
     */
    public SocialEvent changeEventStatus(Long eventId, String newStatus) {
        SocialEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento non trovato"));

        event.setStatus(newStatus);
        SocialEvent savedEvent = eventRepository.save(event);

        // Se l'evento diventa approvato ora, assicuriamoci che l'organizzatore sia iscritto
        if ("APPROVED".equals(newStatus)) {
            autoJoinOrganizer(savedEvent);
        }

        return savedEvent;
    }


    /**
     * Gestisce l'iscrizione di un utente a un evento.
     */
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


    public List<SocialEvent> getAllApprovedEvents() {
        return eventRepository.findByStatus("APPROVED");
    }

    public List<SocialEvent> getApprovedOrPendingEvents() {
        return eventRepository.findByStatusIn(List.of("APPROVED", "PENDING"));
    }

    public List<SocialEvent> getEventsByRestaurant(Long restaurantId) {
        return eventRepository.findByRestaurantId(restaurantId);
    }

    /**
     * Recupera gli eventi a cui l'utente partecipa.
     */
    public List<SocialEvent> getEventsJoinedByUser(Long userId) {
        return participationRepository.findByUserId(userId).stream()
                .map(Participation::getEvent).toList();
    }

    public List<SocialEvent> getEventsCreatedByUser(Long userId) {
        return eventRepository.findByOrganizerId(userId);
    }


    /**
     * Permette al ristoratore di accettare o rifiutare un evento proposto nel suo locale.
     */
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

        // Se approvato, iscriviamo l'organizzatore originale
        if ("APPROVED".equals(decision)) {
            autoJoinOrganizer(savedEvent);
        }
        return savedEvent;
    }

    /**
     * Trova tutte le proposte in attesa associate ai ristoranti posseduti dal ristoratore.
     */
    public List<SocialEvent> getPendingEventsByRestaurateurId(Long restaurateurId) {
        return restaurantRepository.findByOwnerId(restaurateurId).stream()
                .flatMap(r -> eventRepository.findByRestaurantIdAndStatus(r.getId(), "PENDING").stream())
                .toList();
    }

    public List<SocialEvent> getApprovedEventsByRestaurateurId(Long restaurateurId) {
        return restaurantRepository.findByOwnerId(restaurateurId).stream()
                .flatMap(r -> eventRepository.findByRestaurantIdAndStatus(r.getId(), "APPROVED").stream())
                .toList();
    }


    public List<Participation> getParticipantsByEventId(Long eventId) {
        return participationRepository.findByEventId(eventId);
    }

    /**
     * Permette a un utente di cancellare la propria iscrizione.
     */
    public void leaveEvent(Long userId, Long eventId) {
        Participation toDelete = participationRepository.findByEventId(eventId).stream()
                .filter(p -> p.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Non sei iscritto"));
        participationRepository.delete(toDelete);
    }

    /**
     * Permette all'organizzatore di ritirare una proposta, se è ancora in attesa (PENDING).
     */
    public void withdrawEvent(Long eventId, Long userId) {
        SocialEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento non trovato"));

        if (!event.getOrganizer().getId().equals(userId)) throw new RuntimeException("Non autorizzato");
        if (!"PENDING".equals(event.getStatus())) throw new RuntimeException("Solo eventi pending possono essere ritirati");

        eventRepository.delete(event);
    }

    /**
     * Permette al Ristoratore di cancellare un evento confermato
     */
    public void deleteEventByRestaurateur(Long eventId, Long restaurateurId) {
        SocialEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento non trovato"));

        if (!event.getRestaurant().getOwner().getId().equals(restaurateurId)) {
            throw new RuntimeException("Non hai i permessi per cancellare questo evento");
        }
        participationRepository.deleteByEventId(eventId);
        eventRepository.delete(event);
    }

    public boolean isUserParticipating(Long userId, Long eventId) {
        return participationRepository.existsByUserIdAndEventId(userId, eventId);
    }


    /**
     * Metodo per iscrivere automaticamente l'organizzatore all'evento
     */
    private void autoJoinOrganizer(SocialEvent event) {
        if ("RISTORATORE".equals(event.getOrganizer().getRole())) {
            return;
        }
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