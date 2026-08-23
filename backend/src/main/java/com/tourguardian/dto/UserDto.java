package com.tourguardian.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String profilePhoto;
    private String country;
    private String preferredLanguage;
    private String bloodGroup;
    private String medicalNotes;
    private String role;
    private Boolean emailVerified;
    private LocalDateTime lastLogin;
}
