package com.hrcompliance.platform.auth;

import com.hrcompliance.platform.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<Map<String, Object>>> getUsersByCompany() {
        AuthenticatedUser admin = (AuthenticatedUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .filter(u -> u.getCompanyId().equals(admin.getCompanyId()))
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "email", u.getEmail(),
                        "fullName", u.getFullName(),
                        "role", u.getRole().name()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }
}
