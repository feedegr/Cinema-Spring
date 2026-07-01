package com.grandinetti.spring.fede_proyecto_cine.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grandinetti.spring.fede_proyecto_cine.domain.Seat;

public interface SeatRepository extends JpaRepository<Seat, Long> {
}
