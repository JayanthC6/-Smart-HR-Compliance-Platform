package com.hrcompliance.platform.auth;

import com.hrcompliance.platform.auth.dto.AuthResponse;
import com.hrcompliance.platform.auth.dto.LoginRequest;
import com.hrcompliance.platform.auth.dto.RegisterCompanyRequest;
import com.hrcompliance.platform.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse registerCompany(RegisterCompanyRequest request) {
        // Create the tenant (company) first
        Company company = new Company();
        company.setName(request.getCompanyName());
        company.setCreatedAt(LocalDateTime.now());
        company = companyRepository.save(company);

        // Create the first user as ADMIN for this company
        User admin = new User();
        admin.setCompanyId(company.getId());
        admin.setEmail(request.getEmail());
        admin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        admin.setFullName(request.getAdminFullName());
        admin.setRole(Role.ADMIN);
        admin.setCreatedAt(LocalDateTime.now());
        admin = userRepository.save(admin);

        String token = jwtUtil.generateToken(admin.getId(), company.getId(), admin.getRole().name(), admin.getEmail());

        return new AuthResponse(token, admin.getId(), company.getId(), admin.getEmail(), admin.getFullName(), admin.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        Company company = companyRepository.findAll().stream()
                .filter(c -> c.getName().equalsIgnoreCase(request.getCompanyName()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));

        User user = userRepository.findByEmailAndCompanyId(request.getEmail(), company.getId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId(), company.getId(), user.getRole().name(), user.getEmail());

        return new AuthResponse(token, user.getId(), company.getId(), user.getEmail(), user.getFullName(), user.getRole().name());
    }
}