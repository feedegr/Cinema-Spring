package com.grandinetti.spring.fede_proyecto_cine.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "seats", uniqueConstraints = @UniqueConstraint(columnNames = { "room_id", "seat_row", "number" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // "row" es palabra reservada en SQL, se evita usarla como nombre de columna
    private String seatRow;

    private Integer number;

    // @JsonBackReference: este lado NO se serializa, para cortar el ciclo con Room.seats (ver Room.java)
    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "room_id")
    private Room room;
}
