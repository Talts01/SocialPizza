package com.socialpizza.backend.repository;

import com.socialpizza.backend.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    // Trova i ristoranti di un proprietario specifico (per la dashboard del Ristoratore)
    List<Restaurant> findByOwnerId(Long ownerId);
}