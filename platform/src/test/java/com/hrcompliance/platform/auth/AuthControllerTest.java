package com.hrcompliance.platform.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrcompliance.platform.auth.dto.AuthResponse;
import com.hrcompliance.platform.auth.dto.LoginRequest;
import com.hrcompliance.platform.auth.dto.RegisterCompanyRequest;
import com.hrcompliance.platform.security.JwtAuthFilter;
import com.hrcompliance.platform.security.JwtUtil;
import com.hrcompliance.platform.security.TokenBlacklistService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for pure controller testing
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter; // required because it's a component scanned by WebMvcTest

    @Test
    void register_withValidBody_returns200() throws Exception {
        RegisterCompanyRequest req = new RegisterCompanyRequest();
        req.setCompanyName("Acme Corp");
        req.setAdminFullName("Admin User");
        req.setEmail("admin@acme.com");
        req.setPassword("password123");

        AuthResponse res = new AuthResponse("mock.jwt.token", UUID.randomUUID(), UUID.randomUUID(), "admin@acme.com", "Admin User", "ADMIN");

        when(authService.registerCompany(any(RegisterCompanyRequest.class))).thenReturn(res);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void register_withMissingFields_returns400() throws Exception {
        RegisterCompanyRequest req = new RegisterCompanyRequest();
        // missing required fields

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_withValidBody_returns200() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setCompanyName("Acme Corp");
        req.setEmail("admin@acme.com");
        req.setPassword("password123");

        AuthResponse res = new AuthResponse("mock.jwt.token", UUID.randomUUID(), UUID.randomUUID(), "admin@acme.com", "Admin User", "ADMIN");

        when(authService.login(any(LoginRequest.class))).thenReturn(res);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock.jwt.token"));
    }
}
