package com.grandinetti.spring.fede_proyecto_cine.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.grandinetti.spring.fede_proyecto_cine.domain.User;

public interface UserRepository extends JpaRepository<User, Long> {
}
