package com.hrcompliance.platform.auth.dto;

import com.hrcompliance.platform.auth.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class InviteResponse {
    private UUID id;
    private String email;
    private Role role;
    private String token;
    private LocalDateTime expiresAt;
}
