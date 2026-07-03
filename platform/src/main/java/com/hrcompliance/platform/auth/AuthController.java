package com.hrcompliance.platform.auth;

import com.hrcompliance.platform.auth.dto.AuthResponse;
import com.hrcompliance.platform.auth.dto.LoginRequest;
import com.hrcompliance.platform.auth.dto.RegisterCompanyRequest;
import com.hrcompliance.platform.security.JwtUtil;
import com.hrcompliance.platform.security.TokenBlacklistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterCompanyRequest request) {
        return ResponseEntity.ok(authService.registerCompany(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            long expiryMs = jwtUtil.extractClaims(token)
                    .getExpiration().getTime() - System.currentTimeMillis();
            if (expiryMs > 0) {
                tokenBlacklistService.blacklist(token, expiryMs);
            }
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}