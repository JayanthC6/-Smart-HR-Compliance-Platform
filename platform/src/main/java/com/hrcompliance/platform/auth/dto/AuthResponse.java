package com.hrcompliance.platform.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UUID userId;
    private UUID companyId;
    private String email;
    private String fullName;
    private String role;
}