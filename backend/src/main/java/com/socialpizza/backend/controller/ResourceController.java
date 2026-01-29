package com.socialpizza.backend.controller;

import com.socialpizza.backend.entity.Category;
import com.socialpizza.backend.entity.City;
import com.socialpizza.backend.entity.Restaurant;
import com.socialpizza.backend.repository.CategoryRepository;
import com.socialpizza.backend.repository.CityRepository;
import com.socialpizza.backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller per le risorse necessari per popolare form, menu a tendina e filtri nel frontend.
 */
@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "${cors.allowed.origins}", allowCredentials = "true")
public class ResourceController {

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;


    @GetMapping("/cities")
    public List<City> getAllCities() {
        return cityRepository.findAll();
    }

    @GetMapping("/categories")
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/restaurants")
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }
}