package com.grandinetti.spring.fede_proyecto_cine.domain;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @NotBlank
    @Email
    @Column(unique = true)
    private String email;

    // @JsonBackReference: al reves que en Room/Seat, aca el lado "completo" que se
    // serializa es Booking.user (para ver quien reservo), no User.bookings - por eso
    // se omite este lado para cortar el ciclo Booking -> user -> bookings -> Booking -> ...
    @JsonBackReference
    @OneToMany(mappedBy = "user")
    private List<Booking> bookings = new ArrayList<>();
}
