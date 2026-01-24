package com.socialpizza.backend.repository;

import com.socialpizza.backend.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface CityRepository extends JpaRepository<City, Long> {
}
