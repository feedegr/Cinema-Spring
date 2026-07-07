package com.grandinetti.spring.fede_proyecto_cine.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.grandinetti.spring.fede_proyecto_cine.domain.Booking;
import com.grandinetti.spring.fede_proyecto_cine.repository.BookingRepository;
import com.grandinetti.spring.fede_proyecto_cine.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    public BookingController(BookingRepository bookingRepository, BookingService bookingService) {
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
    }

    // Sin userId: todas las reservas. Con userId: solo las de ese usuario, mas nuevas primero
    // (uso real: GET /api/bookings?userId=1 para la vista de "mis reservas" del frontend).
    @GetMapping
    public List<Booking> getAll(@RequestParam(required = false) Long userId) {
        if (userId != null) {
            return bookingRepository.findByUserIdOrderByBookedAtDesc(userId);
        }
        return bookingRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getById(@PathVariable Long id) {
        return bookingRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // Body esperado: {"showtime": {"id": X}, "user": {"id": Y}, "seats": [{"id": A}, {"id": B}]}
    @PostMapping
    public Booking create(@Valid @RequestBody Booking booking) {
        return bookingService.create(booking);
    }
}
