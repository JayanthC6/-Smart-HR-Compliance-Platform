package com.hrcompliance.platform.onboarding.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class CreateTaskRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotBlank(message = "Title is required")
    private String title;

    private LocalDate dueDate;
}