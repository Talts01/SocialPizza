package com.socialpizza.backend.controller;

import com.socialpizza.backend.entity.*;
import com.socialpizza.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    @Autowired private CityRepository cityRepo;
    @Autowired private CategoryRepository categoryRepo;
    @Autowired private RestaurantRepository restaurantRepo;

    // --- CITTÀ ---
    @PostMapping("/cities")
    public City createCity(@RequestBody City city) {
        return cityRepo.save(city);
    }
    @GetMapping("/cities")
    public List<City> getAllCities() {
        return cityRepo.findAll();
    }

    // --- CATEGORIE ---
    @PostMapping("/categories")
    public Category createCategory(@RequestBody Category category) {
        return categoryRepo.save(category);
    }
    @GetMapping("/categories")
    public List<Category> getAllCategories() {
        return categoryRepo.findAll();
    }

    // --- RISTORANTI ---
    @PostMapping("/restaurants")
    public Restaurant createRestaurant(@RequestBody Restaurant restaurant) {
        // Qui dovremmo collegare la cityId, per semplicità passiamo l'oggetto City intero nel JSON
        return restaurantRepo.save(restaurant);
    }

    // Serve per il filtro nel frontend: Dammi i ristoranti di Milano
    @GetMapping("/restaurants")
    public List<Restaurant> getRestaurantsByCity(@RequestParam(required = false) Long cityId) {
        if (cityId != null) {
            return restaurantRepo.findByCityId(cityId);
        }
        return restaurantRepo.findAll();
    }
}

//. ResourceController.java (Il Magazziniere)
//Prima di organizzare una festa, devi avere le sedie, i tavoli e i locali. Questo controller serve a riempire il database con i dati "statici" o di base. Senza di questo, non potresti creare eventi perché non esisterebbero città o ristoranti a cui collegarli.
//
//Le Funzioni:
//
//Gestione Città (createCity, getAllCities):
//
//Permette di salvare "Milano", "Roma" e di rileggere la lista. Servirà per il menu a tendina "Scegli la tua città".
//
//Gestione Categorie (createCategory, getAllCategories):
//
//Permette di creare i temi ("Anime", "Calcio", "Cinema"). Servirà per il menu a tendina "Scegli il tema".
//
//Gestione Ristoranti (createRestaurant):
//
//Salva una nuova pizzeria nel database.
//
//getRestaurantsByCity (GET /api/resources/restaurants?cityId=5):
//
//Questa è speciale. Se la chiami senza parametri, ti dà tutti i ristoranti. Se le passi l'ID di una città (es. Milano), chiede al Repository di filtrarli.
//
//A cosa serve: Quando sul sito selezioni "Milano", questa funzione farà apparire solo le pizzerie di Milano.
