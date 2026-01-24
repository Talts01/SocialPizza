package com.socialpizza.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // Es. "Pizzeria da Luigi"
    private String address;
    private int maxCapacity; // Capienza generale del locale

    // RELAZIONE: Molti ristoranti possono stare in una Città (ManyToOne)
    @ManyToOne
    @JoinColumn(name = "city_id") // Crea la colonna 'city_id' nel DB
    private City city;

    // RELAZIONE: Un ristorante appartiene a un Ristoratore (Utente)
    @OneToOne // Un ristorante ha un solo proprietario (semplifichiamo così)
    @JoinColumn(name = "owner_id")
    private AppUser owner;
}