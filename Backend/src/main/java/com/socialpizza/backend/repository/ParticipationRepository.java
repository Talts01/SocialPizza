package com.socialpizza.backend.repository;

import com.socialpizza.backend.entity.Participation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, Long> {

    // Trova tutte le partecipazioni di un certo evento (usato per fare .size() e contare)
    List<Participation> findByEventId(Long eventId);

    // Trova le partecipazioni di un utente (per la pagina "I miei eventi")
    List<Participation> findByUserId(Long userId);

    // Verifica se esiste già una partecipazione per questa coppia Utente+Evento
    // Restituisce true se l'utente è già iscritto
    boolean existsByUserIdAndEventId(Long userId, Long eventId);

    // Elimina tutte le partecipazioni per un evento (usato quando si elimina un evento)
    @Transactional
    @Modifying
    void deleteByEventId(Long eventId);
}
