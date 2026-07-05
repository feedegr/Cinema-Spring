package com.grandinetti.spring.fede_proyecto_cine.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grandinetti.spring.fede_proyecto_cine.domain.Cinema;
import com.grandinetti.spring.fede_proyecto_cine.repository.CinemaRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cinemas")
public class CinemaController {

    private final CinemaRepository cinemaRepository;

    public CinemaController(CinemaRepository cinemaRepository) {
        this.cinemaRepository = cinemaRepository;
    }

    @GetMapping
    public List<Cinema> getAll() {
        return cinemaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cinema> getById(@PathVariable Long id) {
        return cinemaRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Cinema create(@Valid @RequestBody Cinema cinema) {
        return cinemaRepository.save(cinema);
    }
}
