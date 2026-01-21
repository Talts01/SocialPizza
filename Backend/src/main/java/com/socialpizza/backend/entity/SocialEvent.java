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
    private LocalDateTime eventDate; // Data e ora dell'evento
    private int maxParticipants; // Es. Tavolo da 10 persone

    // Stato evento: "PENDING", "APPROVED", "REJECTED"
    private String status;

    // CHI l'ha creato?
    @ManyToOne
    @JoinColumn(name = "organizer_id")
    private AppUser organizer;

    // DOVE si fa?
    @ManyToOne
    @JoinColumn(name = "restaurant_id")
    private Restaurant restaurant;

    // CHE TEMA ha?
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "description", length = 500) // Diamo un po' di spazio
    private String description;

    // Commento del ristoratore in caso di approvazione/rifiuto
    @Column(name = "moderator_comment", length = 300)
    private String moderatorComment;

    // Data di decisione (quando il ristoratore ha approvato/rifiutato)
    private LocalDateTime decisionDate;

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

}
