package com.grandinetti.spring.fede_proyecto_cine.dto;

// No es una entidad JPA: "occupied" es un dato calculado (depende del showtime consultado,
// no es un atributo propio de Seat), asi que no tiene sentido que viva en el dominio.
public record SeatAvailability(Long id, String seatRow, Integer number, boolean occupied) {
}
