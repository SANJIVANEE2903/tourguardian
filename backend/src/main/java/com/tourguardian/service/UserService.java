package com.tourguardian.service;

import com.tourguardian.dto.UserDto;
import com.tourguardian.entity.User;
import com.tourguardian.exception.ResourceNotFoundException;
import com.tourguardian.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDto(user);
    }

    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToDto(user);
    }

    public UserDto updateUser(Long id, UserDto dto) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getPhoneNumber() != null) user.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getCountry() != null) user.setCountry(dto.getCountry());
        if (dto.getPreferredLanguage() != null) user.setPreferredLanguage(dto.getPreferredLanguage());
        if (dto.getBloodGroup() != null) user.setBloodGroup(dto.getBloodGroup());
        if (dto.getMedicalNotes() != null) user.setMedicalNotes(dto.getMedicalNotes());

        user = userRepository.save(user);
        return mapToDto(user);
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .phoneNumber(user.getPhoneNumber())
            .profilePhoto(user.getProfilePhoto())
            .country(user.getCountry())
            .preferredLanguage(user.getPreferredLanguage())
            .bloodGroup(user.getBloodGroup())
            .medicalNotes(user.getMedicalNotes())
            .role(user.getRole().toString())
            .emailVerified(user.getEmailVerified())
            .lastLogin(user.getLastLogin())
            .build();
    }
}
