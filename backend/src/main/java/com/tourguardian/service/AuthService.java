package com.tourguardian.service;

import com.tourguardian.dto.AuthRequestDto;
import com.tourguardian.dto.AuthResponseDto;
import com.tourguardian.dto.UserRegistrationDto;
import com.tourguardian.entity.User;
import com.tourguardian.exception.BadRequestException;
import com.tourguardian.exception.ResourceNotFoundException;
import com.tourguardian.repository.UserRepository;
import com.tourguardian.security.JwtProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                      AuthenticationManager authenticationManager, JwtProvider jwtProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtProvider = jwtProvider;
    }

    public AuthResponseDto register(UserRegistrationDto dto) {
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = User.builder()
            .email(dto.getEmail())
            .password(passwordEncoder.encode(dto.getPassword()))
            .firstName(dto.getFirstName())
            .lastName(dto.getLastName())
            .phoneNumber(dto.getPhoneNumber())
            .country(dto.getCountry())
            .preferredLanguage(dto.getPreferredLanguage() != null ? dto.getPreferredLanguage() : "en")
            .role(User.UserRole.TRAVELER)
            .emailVerified(false)
            .active(true)
            .build();

        user = userRepository.save(user);
        log.info("User registered: {}", user.getEmail());

        return AuthResponseDto.builder()
            .userId(user.getId())
            .email(user.getEmail())
            .role(user.getRole().toString())
            .build();
    }

    public AuthResponseDto login(AuthRequestDto dto) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
            );

            User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            String token = jwtProvider.generateToken(() -> {
                return dto.getEmail();
            });

            return AuthResponseDto.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().toString())
                .build();
        } catch (Exception ex) {
            throw new BadRequestException("Invalid email or password");
        }
    }
}
