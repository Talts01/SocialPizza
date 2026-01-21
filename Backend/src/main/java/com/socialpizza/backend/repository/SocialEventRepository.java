package com.socialpizza.backend.repository;

import com.socialpizza.backend.entity.SocialEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SocialEventRepository extends JpaRepository<SocialEvent, Long> {

    // Trova tutti gli eventi approvati (per la home page)
    List<SocialEvent> findByStatus(String status);

    // Trova eventi filtrando su una lista di stati (es. APPROVED o PENDING)
    List<SocialEvent> findByStatusIn(List<String> statuses);

    // Trova tutti gli eventi di un certo ristorante (per la dashboard del ristoratore)
    List<SocialEvent> findByRestaurantId(Long restaurantId);

    // Trova eventi di un ristorante con uno stato specifico
    List<SocialEvent> findByRestaurantIdAndStatus(Long restaurantId, String status);

    // Trova eventi creati da un certo utente (per "i miei eventi")
    List<SocialEvent> findByOrganizerId(Long organizerId);
}