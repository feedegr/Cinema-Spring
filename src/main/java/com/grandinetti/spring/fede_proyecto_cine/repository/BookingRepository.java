package com.grandinetti.spring.fede_proyecto_cine.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grandinetti.spring.fede_proyecto_cine.domain.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
}
