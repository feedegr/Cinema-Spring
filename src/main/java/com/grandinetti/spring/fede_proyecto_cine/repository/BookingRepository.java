package com.grandinetti.spring.fede_proyecto_cine.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.grandinetti.spring.fede_proyecto_cine.domain.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // De la lista de seatIds pedida, devuelve cuales ya estan reservadas para ese showtime.
    // Lista vacia = todas las butacas pedidas estan libres.
    @Query("SELECT s.id FROM Booking b JOIN b.seats s WHERE b.showtime.id = :showtimeId AND s.id IN :seatIds")
    List<Long> findBookedSeatIds(@Param("showtimeId") Long showtimeId, @Param("seatIds") List<Long> seatIds);

    List<Booking> findByUserIdOrderByBookedAtDesc(Long userId);
}
