package com.grandinetti.spring.fede_proyecto_cine.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grandinetti.spring.fede_proyecto_cine.domain.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
