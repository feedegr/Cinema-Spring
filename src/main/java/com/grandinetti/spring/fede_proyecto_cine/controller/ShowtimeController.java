package com.grandinetti.spring.fede_proyecto_cine.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grandinetti.spring.fede_proyecto_cine.domain.Showtime;
import com.grandinetti.spring.fede_proyecto_cine.dto.SeatAvailability;
import com.grandinetti.spring.fede_proyecto_cine.repository.ShowtimeRepository;
import com.grandinetti.spring.fede_proyecto_cine.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/showtimes")
public class ShowtimeController {

    private final ShowtimeRepository showtimeRepository;
    private final BookingService bookingService;

    public ShowtimeController(ShowtimeRepository showtimeRepository, BookingService bookingService) {
        this.showtimeRepository = showtimeRepository;
        this.bookingService = bookingService;
    }

    @GetMapping
    public List<Showtime> getAll() {
        return showtimeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Showtime> getById(@PathVariable Long id) {
        return showtimeRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Butacas de la sala de esta funcion, cada una con si esta ocupada o no
    // (calculado contra las reservas ya hechas para esta funcion puntual).
    @GetMapping("/{id}/seats")
    public List<SeatAvailability> getSeatAvailability(@PathVariable Long id) {
        return bookingService.getSeatAvailability(id);
    }

    // Body esperado: {"startTime": "...", "movie": {"id": 1}, "room": {"id": 1}}
    // No hace falta mandar el Movie/Room completo: al no tener cascade, Hibernate
    // solo usa el id para la foreign key.
    @PostMapping
    public Showtime create(@Valid @RequestBody Showtime showtime) {
        return showtimeRepository.save(showtime);
    }
}
