package com.socialpizza.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SocialEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private LocalDateTime eventDate;
    private int maxParticipants;


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

    // Commento se accettato o rifiutato

    @Column(name = "moderator_comment", length = 300)
    private String moderatorComment;

    @Column(length = 1000)
    private String rejectionReason;


    private LocalDateTime decisionDate;
}