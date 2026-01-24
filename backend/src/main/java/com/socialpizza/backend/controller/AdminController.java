package com.socialpizza.backend.controller;

import com.socialpizza.backend.entity.AppUser;
import com.socialpizza.backend.entity.Category;
import com.socialpizza.backend.entity.City;
import com.socialpizza.backend.entity.Restaurant;
import com.socialpizza.backend.repository.AppUserRepository;
import com.socialpizza.backend.repository.CategoryRepository;
import com.socialpizza.backend.repository.CityRepository;
import com.socialpizza.backend.repository.RestaurantRepository;
import com.socialpizza.backend.repository.SocialEventRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "${cors.allowed.origins}", allowCredentials = "true")
public class AdminController {

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private SocialEventRepository socialEventRepository;

    // --- USERS ---
    @GetMapping("/users")
    public List<AdminUserDTO> listUsers(HttpSession session) {
        requireAdmin(session);
        return userRepository.findAll()
                .stream()
                .map(AdminUserDTO::from)
                .collect(Collectors.toList());
    }

    @PostMapping("/users")
    public AdminUserDTO createUser(@RequestBody CreateUserRequest request, HttpSession session) {
        requireAdmin(session);
        if (request.email() == null || request.password() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email e password sono obbligatorie");
        }

        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email già registrata");
        }

        AppUser user = new AppUser();
        user.setName(request.name());
        user.setSurname(request.surname());
        user.setEmail(request.email());
        user.setPassword(request.password());
        user.setRole(request.role() != null ? request.role() : "USER");
        user.setIsVerified(Boolean.TRUE.equals(request.isVerified()));
        user.setBio(request.bio());

        AppUser saved = userRepository.save(user);
        return AdminUserDTO.from(saved);
    }

    @PatchMapping("/users/{id}/role")
    public AdminUserDTO updateRole(@PathVariable Long id, @RequestParam String role, HttpSession session) {
        requireAdmin(session);
        AppUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utente non trovato"));
        user.setRole(role);
        AppUser saved = userRepository.save(user);
        return AdminUserDTO.from(saved);
    }

    // --- RESTAURANTS ---
    @GetMapping("/restaurants")
    public List<RestaurantAdminDTO> listRestaurants(HttpSession session) {
        requireAdmin(session);
        return restaurantRepository.findAll()
                .stream()
                .map(RestaurantAdminDTO::from)
                .collect(Collectors.toList());
    }

    @PostMapping("/restaurants")
    public RestaurantAdminDTO createRestaurant(@RequestBody CreateRestaurantRequest request, HttpSession session) {
        requireAdmin(session);
        if (request.name() == null || request.cityId() == null || request.ownerId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "name, cityId e ownerId sono obbligatori");
        }

        City city = cityRepository.findById(request.cityId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Città non trovata"));
        AppUser owner = userRepository.findById(request.ownerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ristoratore non trovato"));

        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.name());
        restaurant.setAddress(request.address());
        restaurant.setMaxCapacity(request.maxCapacity() != null ? request.maxCapacity() : 0);
        restaurant.setCity(city);
        restaurant.setOwner(owner);

        Restaurant saved = restaurantRepository.save(restaurant);
        return RestaurantAdminDTO.from(saved);
    }

    @DeleteMapping("/restaurants/{id}")
    public void deleteRestaurant(@PathVariable Long id, HttpSession session) {
        requireAdmin(session);
        if (socialEventRepository.existsByRestaurantId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ristorante associato a eventi: non eliminabile");
        }
        restaurantRepository.deleteById(id);
    }

    // --- CATEGORIES ---
    @GetMapping("/categories")
    public List<Category> listCategories(HttpSession session) {
        requireAdmin(session);
        return categoryRepository.findAll();
    }

    @PostMapping("/categories")
    public Category createCategory(@RequestBody Category category, HttpSession session) {
        requireAdmin(session);
        if (category.getName() == null || category.getName().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Il nome è obbligatorio");
        }
        return categoryRepository.save(category);
    }

    @DeleteMapping("/categories/{id}")
    public void deleteCategory(@PathVariable Long id, HttpSession session) {
        requireAdmin(session);
        if (socialEventRepository.existsByCategoryId(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Categoria utilizzata da eventi: non eliminabile");
        }
        categoryRepository.deleteById(id);
    }

    private void requireAdmin(HttpSession session) {
        String email = (String) session.getAttribute("username");
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non autenticato");
        }

        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessione non valida"));

        if (!"ADMIN".equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo l'admin può accedere");
        }
    }

    // --- DTOs ---
    public record AdminUserDTO(Long id, String name, String surname, String email, String role, Boolean isVerified) {
        public static AdminUserDTO from(AppUser user) {
            return new AdminUserDTO(user.getId(), user.getName(), user.getSurname(), user.getEmail(), user.getRole(), user.getIsVerified());
        }
    }

    public record CreateUserRequest(String name, String surname, String email, String password, String role, Boolean isVerified, String bio) { }

    public record RestaurantAdminDTO(Long id, String name, String address, Integer maxCapacity, Long cityId, Long ownerId) {
        public static RestaurantAdminDTO from(Restaurant restaurant) {
            Long cityId = restaurant.getCity() != null ? restaurant.getCity().getId() : null;
            Long ownerId = restaurant.getOwner() != null ? restaurant.getOwner().getId() : null;
            return new RestaurantAdminDTO(restaurant.getId(), restaurant.getName(), restaurant.getAddress(), restaurant.getMaxCapacity(), cityId, ownerId);
        }
    }

    public record CreateRestaurantRequest(String name, String address, Integer maxCapacity, Long cityId, Long ownerId) { }
}
