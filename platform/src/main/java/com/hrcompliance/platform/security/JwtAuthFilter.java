package com.hrcompliance.platform.security;

import com.hrcompliance.platform.tenant.TenantContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (jwtUtil.isTokenValid(token)) {
            UUID userId    = jwtUtil.extractUserId(token);
            UUID companyId = jwtUtil.extractCompanyId(token);
            String role    = jwtUtil.extractRole(token);
            String email   = jwtUtil.extractClaims(token).get("email", String.class);

            // Set tenant context for this request thread
            TenantContext.setCurrentTenant(companyId);

            AuthenticatedUser principal = new AuthenticatedUser(userId, companyId, email, role);
            var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
            var authToken   = new UsernamePasswordAuthenticationToken(principal, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // Always clear tenant context after request completes
            // to prevent thread-local leaking into the next request
            TenantContext.clear();
        }
    }
}