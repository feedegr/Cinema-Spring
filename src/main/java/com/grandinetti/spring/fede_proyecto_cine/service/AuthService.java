package com.grandinetti.spring.fede_proyecto_cine.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.grandinetti.spring.fede_proyecto_cine.domain.Role;
import com.grandinetti.spring.fede_proyecto_cine.domain.User;
import com.grandinetti.spring.fede_proyecto_cine.dto.LoginRequest;
import com.grandinetti.spring.fede_proyecto_cine.dto.SignupRequest;
import com.grandinetti.spring.fede_proyecto_cine.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User signup(SignupRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese email");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);

        return userRepository.save(user);
    }

    public User login(LoginRequest request) {
        // Mismo mensaje de error para "email no existe" y "contraseña incorrecta" -
        // distinguirlos le regala a un atacante cuales emails estan registrados.
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email o contraseña incorrectos");
        }

        return user;
    }
}
