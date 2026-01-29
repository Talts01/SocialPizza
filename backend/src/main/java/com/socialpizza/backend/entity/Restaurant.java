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

    private String name;
    private String address;
    private int maxCapacity;


    @ManyToOne
    @JoinColumn(name = "city_id")
    private City city;


    @OneToOne
    @JoinColumn(name = "owner_id")
    private AppUser owner;
}