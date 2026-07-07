package com.grandinetti.spring.fede_proyecto_cine.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

// Solo el encoder de contraseñas (spring-security-crypto) - no hay SecurityFilterChain
// todavia, asi que ningun endpoint esta protegido de verdad todavia. Login "basico":
// TODO migrar a spring-boot-starter-security + JWT cuando haga falta proteger endpoints.
@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
