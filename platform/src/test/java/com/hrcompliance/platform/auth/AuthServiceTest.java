package com.hrcompliance.platform.auth;

import com.hrcompliance.platform.auth.dto.AuthResponse;
import com.hrcompliance.platform.auth.dto.LoginRequest;
import com.hrcompliance.platform.auth.dto.RegisterCompanyRequest;
import com.hrcompliance.platform.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private RegisterCompanyRequest registerReq;
    private LoginRequest loginReq;

    @BeforeEach
    void setUp() {
        registerReq = new RegisterCompanyRequest();
        registerReq.setCompanyName("Acme Corp");
        registerReq.setAdminFullName("Admin User");
        registerReq.setEmail("admin@acme.com");
        registerReq.setPassword("password123");

        loginReq = new LoginRequest();
        loginReq.setCompanyName("Acme Corp");
        loginReq.setEmail("admin@acme.com");
        loginReq.setPassword("password123");
    }

    @Test
    void registerCompany_createsCompanyAndAdminUser() {
        Company mockCompany = new Company();
        mockCompany.setId(UUID.randomUUID());
        mockCompany.setName("Acme Corp");

        User mockUser = new User();
        mockUser.setId(UUID.randomUUID());
        mockUser.setCompanyId(mockCompany.getId());
        mockUser.setEmail("admin@acme.com");
        mockUser.setRole(Role.ADMIN);

        when(companyRepository.save(any(Company.class))).thenReturn(mockCompany);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(jwtUtil.generateToken(eq(mockUser.getId()), eq(mockCompany.getId()), eq("ADMIN"), eq("admin@acme.com")))
                .thenReturn("mocked.jwt.token");

        AuthResponse res = authService.registerCompany(registerReq);

        assertNotNull(res);
        assertEquals("mocked.jwt.token", res.getToken());
        assertEquals(Role.ADMIN.name(), res.getRole());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals("encodedPassword", userCaptor.getValue().getPasswordHash());
    }

    @Test
    void login_withValidCredentials_returnsToken() {
        Company mockCompany = new Company();
        mockCompany.setId(UUID.randomUUID());
        mockCompany.setName("Acme Corp");

        User mockUser = new User();
        mockUser.setId(UUID.randomUUID());
        mockUser.setCompanyId(mockCompany.getId());
        mockUser.setEmail("admin@acme.com");
        mockUser.setPasswordHash("hashedPassword");
        mockUser.setRole(Role.ADMIN);

        when(companyRepository.findAll()).thenReturn(List.of(mockCompany));
        when(userRepository.findByEmailAndCompanyId("admin@acme.com", mockCompany.getId()))
                .thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(any(), any(), any(), any())).thenReturn("mocked.jwt.token");

        AuthResponse res = authService.login(loginReq);

        assertNotNull(res);
        assertEquals("mocked.jwt.token", res.getToken());
    }

    @Test
    void login_withWrongPassword_throwsException() {
        Company mockCompany = new Company();
        mockCompany.setId(UUID.randomUUID());
        mockCompany.setName("Acme Corp");

        User mockUser = new User();
        mockUser.setId(UUID.randomUUID());
        mockUser.setPasswordHash("hashedPassword");

        when(companyRepository.findAll()).thenReturn(List.of(mockCompany));
        when(userRepository.findByEmailAndCompanyId("admin@acme.com", mockCompany.getId()))
                .thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("password123", "hashedPassword")).thenReturn(false);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> authService.login(loginReq));
        assertEquals("Invalid email or password", exception.getMessage());
    }

    @Test
    void login_withUnknownCompany_throwsException() {
        when(companyRepository.findAll()).thenReturn(List.of());

        Exception exception = assertThrows(IllegalArgumentException.class, () -> authService.login(loginReq));
        assertEquals("Company not found", exception.getMessage());
    }
}
