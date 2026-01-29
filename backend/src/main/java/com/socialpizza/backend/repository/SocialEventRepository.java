package com.socialpizza.backend.repository;

import com.socialpizza.backend.entity.SocialEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SocialEventRepository extends JpaRepository<SocialEvent, Long> {

    List<SocialEvent> findByStatus(String status);
    List<SocialEvent> findByStatusIn(List<String> statuses);
    List<SocialEvent> findByRestaurantId(Long restaurantId);
    boolean existsByRestaurantId(Long restaurantId);
    List<SocialEvent> findByRestaurantIdAndStatus(Long restaurantId, String status);
    List<SocialEvent> findByOrganizerId(Long organizerId);
    boolean existsByCategoryId(Long categoryId);
    List<SocialEvent> findAllByOrganizerId(Long organizerId);
}