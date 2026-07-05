package com.hrcompliance.platform.auth;

import com.hrcompliance.platform.auth.dto.AuthResponse;
import com.hrcompliance.platform.auth.dto.InviteRequest;
import com.hrcompliance.platform.auth.dto.InviteResponse;
import com.hrcompliance.platform.auth.dto.RegisterEmployeeRequest;
import com.hrcompliance.platform.security.AuthenticatedUser;
import com.hrcompliance.platform.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InviteService {

    private final InviteRepository inviteRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public InviteResponse createInvite(InviteRequest request) {
        AuthenticatedUser currentUser = (AuthenticatedUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        String token = UUID.randomUUID().toString().replace("-", "");
        
        CompanyInvite invite = new CompanyInvite();
        invite.setCompanyId(currentUser.getCompanyId());
        invite.setEmail(request.getEmail());
        invite.setToken(token);
        invite.setRole(request.getRole());
        invite.setExpiresAt(LocalDateTime.now().plusHours(48));
        invite.setUsed(false);
        invite.setCreatedAt(LocalDateTime.now());

        invite = inviteRepository.save(invite);

        return new InviteResponse(
                invite.getId(),
                invite.getEmail(),
                invite.getRole(),
                invite.getToken(),
                invite.getExpiresAt()
        );
    }

    @Transactional
    public AuthResponse registerEmployee(RegisterEmployeeRequest request) {
        CompanyInvite invite = inviteRepository.findByTokenAndUsedFalse(request.getInviteToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or already used invite token"));

        if (invite.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Invite token has expired");
        }

        if (userRepository.existsByEmailAndCompanyId(invite.getEmail(), invite.getCompanyId())) {
            throw new IllegalArgumentException("User with this email already exists in the company");
        }

        User employee = new User();
        employee.setCompanyId(invite.getCompanyId());
        employee.setEmail(invite.getEmail());
        employee.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        employee.setFullName(request.getFullName());
        employee.setRole(invite.getRole());
        employee.setCreatedAt(LocalDateTime.now());

        employee = userRepository.save(employee);

        invite.setUsed(true);
        inviteRepository.save(invite);

        String jwt = jwtUtil.generateToken(
                employee.getId(),
                invite.getCompanyId(),
                employee.getRole().name(),
                employee.getEmail()
        );

        return new AuthResponse(
                jwt,
                employee.getId(),
                invite.getCompanyId(),
                employee.getEmail(),
                employee.getFullName(),
                employee.getRole().name()
        );
    }
}
