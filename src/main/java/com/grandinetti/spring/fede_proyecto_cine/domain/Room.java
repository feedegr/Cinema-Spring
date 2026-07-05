package com.grandinetti.spring.fede_proyecto_cine.domain;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Unique constraint compuesta (cinema_id + name) en vez de "name" global: dos cines
// distintos pueden tener cada uno su propia "Sala 1" sin chocar entre si.
@Entity
@Table(name = "rooms", uniqueConstraints = @UniqueConstraint(columnNames = { "cinema_id", "name" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    private Integer capacity;

    @ManyToOne
    @JoinColumn(name = "cinema_id")
    private Cinema cinema;

    // @JsonManagedReference: este lado SI se serializa (el "padre" de la relacion).
    // Sin esto, Room -> seats -> Seat -> room -> seats -> ... genera un loop infinito al convertir a JSON.
    @JsonManagedReference
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
    private List<Seat> seats = new ArrayList<>();
}
