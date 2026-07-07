package com.grandinetti.spring.fede_proyecto_cine.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grandinetti.spring.fede_proyecto_cine.domain.User;
import com.grandinetti.spring.fede_proyecto_cine.dto.AuthResponse;
import com.grandinetti.spring.fede_proyecto_cine.dto.LoginRequest;
import com.grandinetti.spring.fede_proyecto_cine.dto.SignupRequest;
import com.grandinetti.spring.fede_proyecto_cine.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
        return toResponse(authService.signup(request));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return toResponse(authService.login(request));
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
