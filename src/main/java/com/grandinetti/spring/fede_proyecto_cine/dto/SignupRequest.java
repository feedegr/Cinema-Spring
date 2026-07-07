package com.grandinetti.spring.fede_proyecto_cine.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(
    @NotBlank String name,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 6, message = "La contraseña necesita al menos 6 caracteres") String password
) {
}
