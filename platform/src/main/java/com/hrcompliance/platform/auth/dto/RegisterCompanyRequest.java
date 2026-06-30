package com.hrcompliance.platform.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterCompanyRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Admin full name is required")
    private String adminFullName;

    @Email(message = "A valid email is required")
    @NotBlank
    private String email;

    @Size(min = 8, message = "Password must be at least 8 characters")
    @NotBlank
    private String password;
}