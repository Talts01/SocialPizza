package com.socialpizza.backend.service;

import com.socialpizza.backend.entity.*;
import com.socialpizza.backend.repository.*;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.DependsOn; // DependsOn cosi da farlo partire dopo AppUserService, in modo da collegare le informazioni all'utente creato prima
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {

    @Autowired private SocialEventRepository eventRepository;
    @Autowired private ParticipationRepository participationRepository;
    @Autowired private AppUserRepository userRepository;
    @Autowired private RestaurantRepository restaurantRepository;

    //servono per popolare la DB
    @Autowired private CityRepository cityRepository;
    @Autowired private CategoryRepository categoryRepository;

    @PostConstruct // Questo metodo parte in automatico all'avvio
    public void init() {
        // 1. Creiamo la Città (se non esiste)
        if (cityRepository.findAll().isEmpty()) {
            City milano = new City(null, "Milano", "20100");
            cityRepository.save(milano);
            System.out.println("Città Milano creata.");

            Category anime = categoryRepository.save(new Category(null, "Anime & Manga", "Serate Nerd"));
            Category sport =categoryRepository.save(new Category(null, "Sport & Calcio", "Tifiamo insieme"));
            Category film =categoryRepository.save(new Category(null, "Cinema d'Autore", "Discussioni post-film"));
            Category giochiT =categoryRepository.save(new Category(null, "Giochi da Tavolo", "Dungeons & Dragons e altro"));
            Category musica =categoryRepository.save(new Category(null, "Musica Live", "Parliamo di musica"));
            System.out.println("Categoria Anime creata.");

            // 3. Creiamo il Ristorante (Collegato a Milano e a Luigi)
            // Recuperiamo Luigi (siamo sicuri che esiste grazie a @DependsOn)
            AppUser luigi = userRepository.findByEmail("luigi@pizzeria.it").orElse(null);

            if (luigi != null) {
                Restaurant pizzeria = new Restaurant(null, "Pizzeria Da Luigi", "Via Dante 1", 50, milano, luigi);
                restaurantRepository.save(pizzeria);
                System.out.println("Pizzeria Da Luigi creata.");

                // (Opzionale) Creiamo anche un Evento di prova già pronto
                SocialEvent evento = new SocialEvent();
                evento.setTitle("Serata Naruto");
                evento.setEventDate(LocalDateTime.now().plusDays(5));
                evento.setMaxParticipants(10);
                evento.setStatus("APPROVED");
                evento.setOrganizer(luigi);
                evento.setRestaurant(pizzeria);
                evento.setCategory(anime);
                evento.setDescription("serata dedicata agli appasionati di Naruto");
                eventRepository.save(evento);
                System.out.println("Evento 'Serata Naruto' creato.");
            }
        }
    }
    // 1. CREA UNA NUOVA PROPOSTA DI EVENTO
    public SocialEvent createEvent(SocialEvent event, Long restaurantId, Long userId) {
        // Recupero l'utente e il ristorante dal DB
        AppUser organizer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Ristorante non trovato"));

        // Imposto i dati base
        event.setOrganizer(organizer);
        event.setRestaurant(restaurant);

        // LOGICA INTELLIGENTE: Chi sta creando l'evento?
        if ("RESTAURATEUR".equals(organizer.getRole())) {
            // Se è il capo, è subito approvato!
            event.setStatus("APPROVED");
        } else {
            // Se è un cliente, deve aspettare conferma
            event.setStatus("PENDING");
        }

        // Salviamo l'evento nel DB
        SocialEvent savedEvent = eventRepository.save(event);

        // AUTO-ISCRIZIONE: Se l'evento nasce già approvato (quindi creato dal Ristoratore),
        // iscriviamo subito l'organizzatore, proprio come succede quando si accetta una richiesta.
        if ("APPROVED".equals(savedEvent.getStatus())) {
            try {
                // Creiamo manualmente la partecipazione per evitare controlli superflui del metodo joinEvent
                Participation p = new Participation();
                p.setUser(organizer);
                p.setEvent(savedEvent);
                p.setRegistrationDate(LocalDateTime.now());
                participationRepository.save(p);
                System.out.println("Ristoratore auto-iscritto all'evento creato.");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return savedEvent;
    }


    // 2. APPROVA O RIFIUTA EVENTO (Aggiornato con Auto-Join)
    public SocialEvent changeEventStatus(Long eventId, String newStatus) {
        SocialEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento non trovato"));

        // Aggiorniamo lo stato
        event.setStatus(newStatus);
        SocialEvent savedEvent = eventRepository.save(event); // Salviamo "APPROVED" nel DB

        // LOGICA NUOVA: Se è stato approvato, iscrivi automaticamente l'organizzatore
        if ("APPROVED".equals(newStatus)) {
            try {
                // L'organizzatore partecipa di diritto (e gratis!)
                // Nota: joinEvent controlla se c'è posto, ma essendo il primo, c'è sicuro.
                joinEvent(event.getOrganizer().getId(), eventId);
                // Usiamo getName() oppure getEmail(), che esistono sicuramente nel tuo AppUser
                System.out.println("Organizzatore iscritto automaticamente: " + event.getOrganizer().getEmail());
            } catch (Exception e) {
                // Se era già iscritto (strano ma possibile), ignoriamo l'errore
                System.out.println("Impossibile auto-iscrivere organizzatore: " + e.getMessage());
            }
        }

        return savedEvent;
    }

    // 3. PARTECIPA A UN EVENTO
    public Participation joinEvent(Long userId, Long eventId) {
        // Recupero evento e utente
        SocialEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento non trovato"));
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utente non trovato"));

        // CONTROLLO 1: L'evento è approvato?
        if (!"APPROVED".equals(event.getStatus())) {
            throw new RuntimeException("Non puoi iscriverti a un evento non ancora confermato");
        }

        // CONTROLLO 2: L'utente è già iscritto?
        if (participationRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new RuntimeException("Sei già iscritto a questo evento!");
        }

        // CONTROLLO 3: C'è ancora posto?
        List<Participation> currentParticipants = participationRepository.findByEventId(eventId);
        if (currentParticipants.size() >= event.getMaxParticipants()) {
            throw new RuntimeException("Evento Sold Out! Posti esauriti.");
        }

        // Se tutto ok, creo la partecipazione
        Participation participation = new Participation();
        participation.setEvent(event);
        participation.setUser(user);
        participation.setRegistrationDate(LocalDateTime.now());

        return participationRepository.save(participation);
    }

    // 4. METODI DI LETTURA (Per le schermate)
    public List<SocialEvent> getAllApprovedEvents() {
        return eventRepository.findByStatus("APPROVED");
    }

    // Restituisce eventi pubblici: APPROVED e PENDING (i pending non sono partecipabili)
    public List<SocialEvent> getApprovedOrPendingEvents() {
        return eventRepository.findByStatusIn(List.of("APPROVED", "PENDING"));
    }

    public List<SocialEvent> getEventsByRestaurant(Long restaurantId) {
        return eventRepository.findByRestaurantId(restaurantId);
    }

    public List<SocialEvent> getEventsJoinedByUser(Long userId) {
        // 1. Trova tutte le righe nella tabella 'Participation' per questo utente
        List<Participation> participations = participationRepository.findByUserId(userId);

        // 2. Trasforma la lista di Partecipazioni in una lista di Eventi
        // (Per ogni partecipazione -> prendi l'evento collegato)
        return participations.stream()
                .map(Participation::getEvent)
                .toList();
    }
    public List<SocialEvent> getEventsCreatedByUser(Long userId) {
        return eventRepository.findByOrganizerId(userId);
    }

    // 5. MODERATORE DECISION: Approva/Rifiuta con commento
    public SocialEvent moderatorDecision(Long eventId, Long restaurateurId, String decision, String comment) {
        SocialEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento non trovato"));

        // Verifica che il ristoratore sia il proprietario del locale dove si farà l'evento
        if (!event.getRestaurant().getOwner().getId().equals(restaurateurId)) {
            throw new RuntimeException("Non sei il proprietario di questo ristorante!");
        }

        // Verifica che l'evento sia ancora in sospeso
        if (!"PENDING".equals(event.getStatus())) {
            throw new RuntimeException("Questo evento non è in stato PENDING");
        }

        // Valida la decision
        if (!("APPROVED".equals(decision) || "REJECTED".equals(decision))) {
            throw new RuntimeException("Decision deve essere APPROVED o REJECTED");
        }

        // Aggiorna l'evento
        event.setStatus(decision);
        event.setDecisionDate(LocalDateTime.now());
        event.setModeratorComment(comment);

        SocialEvent savedEvent = eventRepository.save(event);

        // Se approvato, auto-iscrivere l'organizzatore
        if ("APPROVED".equals(decision)) {
            try {
                Participation p = new Participation();
                p.setUser(event.getOrganizer());
                p.setEvent(savedEvent);
                p.setRegistrationDate(LocalDateTime.now());
                p.setStatus("REGISTERED");
                participationRepository.save(p);
                System.out.println("Organizzatore auto-iscritto dopo approvazione");
            } catch (Exception e) {
                System.out.println("Organizzatore già iscritto o errore: " + e.getMessage());
            }
        }

        return savedEvent;
    }

    // 6. OTTIENI EVENTI PENDING PER RISTORATORE
    public List<SocialEvent> getPendingEventsByRestaurateurId(Long restaurateurId) {
        // Trova tutti i ristoranti del ristoratore
        List<Restaurant> restaurants = restaurantRepository.findByOwnerId(restaurateurId);

        // Per ogni ristorante, trova gli eventi PENDING
        return restaurants.stream()
                .flatMap(restaurant -> eventRepository.findByRestaurantIdAndStatus(restaurant.getId(), "PENDING").stream())
                .toList();
    }

    // 7. OTTIENI PARTECIPANTI DI UN EVENTO
    public List<Participation> getParticipantsByEventId(Long eventId) {
        return participationRepository.findByEventId(eventId);
    }

    // 8. CANCELLA ISCRIZIONE
    public void leaveEvent(Long userId, Long eventId) {
        // Verifica che l'utente sia iscritto
        if (!participationRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new RuntimeException("Non sei iscritto a questo evento");
        }

        // Trova la partecipazione e cancellala
        List<Participation> participations = participationRepository.findByEventId(eventId);
        Participation toDelete = participations.stream()
                .filter(p -> p.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Partecipazione non trovata"));

        participationRepository.delete(toDelete);
    }

    // 9. RITIRA PROPOSTA (solo se PENDING e sei l'organizzatore)
    public void withdrawEvent(Long eventId, Long userId) {
        SocialEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento non trovato"));

        // Verifica che sia l'organizzatore
        if (!event.getOrganizer().getId().equals(userId)) {
            throw new RuntimeException("Solo l'organizzatore può ritirare la proposta");
        }

        // Verifica che sia PENDING
        if (!"PENDING".equals(event.getStatus())) {
            throw new RuntimeException("Puoi ritirare solo eventi in stato PENDING");
        }

        // Cancella l'evento
        eventRepository.delete(event);
    }

    // Verifica se un utente è iscritto a un evento
    public boolean isUserParticipating(Long userId, Long eventId) {
        return participationRepository.existsByUserIdAndEventId(userId, eventId);
    }

    // Elimina evento (solo per admin)
    @org.springframework.transaction.annotation.Transactional
    public void deleteEvent(Long eventId) {
        SocialEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento non trovato"));
        
        // Elimina prima tutte le partecipazioni associate
        System.out.println("[DELETE] Rimozione partecipazioni per evento ID=" + eventId);
        participationRepository.deleteByEventId(eventId);
        
        // Poi elimina l'evento
        System.out.println("[DELETE] Rimozione evento ID=" + eventId);
        eventRepository.delete(event);
        System.out.println("[DELETE] Verifica esistenza post-delete: " + eventRepository.existsById(eventId));
    }
}