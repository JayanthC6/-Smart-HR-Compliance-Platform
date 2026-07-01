package com.hrcompliance.platform.onboarding.dto;

import com.hrcompliance.platform.onboarding.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class TaskResponse {
    private UUID id;
    private UUID userId;
    private String title;
    private TaskStatus status;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
}