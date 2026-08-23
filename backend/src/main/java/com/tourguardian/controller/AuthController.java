package com.tourguardian.controller;

import com.tourguardian.dto.AuthRequestDto;
import com.tourguardian.dto.AuthResponseDto;
import com.tourguardian.dto.UserRegistrationDto;
import com.tourguardian.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication APIs")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register new user")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody UserRegistrationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(dto));
    }

    @PostMapping("/login")
    @Operation(summary = "Login user")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody AuthRequestDto dto) {
        return ResponseEntity.ok(authService.login(dto));
    }
}
