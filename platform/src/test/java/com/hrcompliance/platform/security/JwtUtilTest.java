package com.hrcompliance.platform.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    private static final String SECRET = "mySuperSecretKeyThatIsAtLeast32BytesLongForHS256Algorithm123!";
    private static final long EXPIRATION_MS = 3600000; // 1 hour

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET, EXPIRATION_MS);
    }

    @Test
    void generateToken_returnsValidJwt() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        String role = "ADMIN";
        String email = "test@example.com";

        String token = jwtUtil.generateToken(userId, companyId, role, email);

        assertNotNull(token);
        assertFalse(token.isEmpty());
        
        Claims claims = jwtUtil.extractClaims(token);
        assertEquals(userId.toString(), claims.getSubject());
        assertEquals(companyId.toString(), claims.get("companyId", String.class));
        assertEquals(role, claims.get("role", String.class));
        assertEquals(email, claims.get("email", String.class));
    }

    @Test
    void extractUserId_returnsCorrectId() {
        UUID userId = UUID.randomUUID();
        String token = jwtUtil.generateToken(userId, UUID.randomUUID(), "HR", "test@test.com");

        UUID extracted = jwtUtil.extractUserId(token);
        assertEquals(userId, extracted);
    }

    @Test
    void extractCompanyId_returnsCorrectId() {
        UUID companyId = UUID.randomUUID();
        String token = jwtUtil.generateToken(UUID.randomUUID(), companyId, "EMPLOYEE", "test@test.com");

        UUID extracted = jwtUtil.extractCompanyId(token);
        assertEquals(companyId, extracted);
    }

    @Test
    void extractRole_returnsCorrectRole() {
        String token = jwtUtil.generateToken(UUID.randomUUID(), UUID.randomUUID(), "ADMIN", "test@test.com");

        String role = jwtUtil.extractRole(token);
        assertEquals("ADMIN", role);
    }

    @Test
    void isTokenValid_returnsTrueForFreshToken() {
        String token = jwtUtil.generateToken(UUID.randomUUID(), UUID.randomUUID(), "HR", "test@test.com");
        assertTrue(jwtUtil.isTokenValid(token));
    }

    @Test
    void isTokenValid_returnsFalseForTamperedToken() {
        String token = jwtUtil.generateToken(UUID.randomUUID(), UUID.randomUUID(), "HR", "test@test.com");
        String tampered = token + "xyz";
        
        assertFalse(jwtUtil.isTokenValid(tampered));
    }
}
