package com.hrcompliance.platform.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

/**
 * Lightweight principal object stored in the Spring Security context.
 * Carries exactly what request-handling code needs: who the user is
 * and which tenant (company) they belong to.
 */
@Getter
@AllArgsConstructor
public class AuthenticatedUser {
    private final UUID userId;
    private final UUID companyId;
    private final String email;
    private final String role;
}