package com.socialpizza.backend.repository;

import com.socialpizza.backend.entity.Participation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, Long> {

    List<Participation> findByEventId(Long eventId);
    List<Participation> findByUserId(Long userId);

    boolean existsByUserIdAndEventId(Long userId, Long eventId);

    // OTTIMIZZAZIONE: Conta i partecipanti direttamente nel DB
    long countByEventId(Long eventId);

    @Transactional
    @Modifying
    void deleteByEventId(Long eventId);

    @Transactional
    @Modifying
    void deleteByUserId(Long userId);
}