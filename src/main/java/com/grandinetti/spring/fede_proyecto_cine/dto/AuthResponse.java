package com.grandinetti.spring.fede_proyecto_cine.dto;

import com.grandinetti.spring.fede_proyecto_cine.domain.Role;

// Lo que se devuelve tras login/signup - nunca el password, ni siquiera el hash.
public record AuthResponse(Long id, String name, String email, Role role) {
}
