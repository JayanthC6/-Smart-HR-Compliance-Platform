package com.hrcompliance.platform.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterEmployeeRequest {

    @NotBlank(message = "Invite token is required")
    private String inviteToken;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @Size(min = 8, message = "Password must be at least 8 characters")
    @NotBlank
    private String password;
}
