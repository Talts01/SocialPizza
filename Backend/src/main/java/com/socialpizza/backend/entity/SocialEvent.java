package com.socialpizza.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data // Genera automaticamente Getters e Setters
@NoArgsConstructor
@AllArgsConstructor
public class SocialEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private LocalDateTime eventDate;
    private int maxParticipants;

    // Stato evento: "PENDING", "APPROVED", "REJECTED"
    private String status;

    @ManyToOne
    @JoinColumn(name = "organizer_id")
    private AppUser organizer;

    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "description", length = 500)
    private String description;

    // --- CAMPI PER LA MODERAZIONE ---

    // 1. Commento se APPROVATO (Opzionale)
    @Column(name = "moderator_comment", length = 300)
    private String moderatorComment;

    // 2. Motivazione se RIFIUTATO (Obbligatoria)
    @Column(length = 1000)
    private String rejectionReason;

    // Data di decisione
    private LocalDateTime decisionDate;
}