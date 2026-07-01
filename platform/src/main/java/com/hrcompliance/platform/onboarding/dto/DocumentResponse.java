package com.hrcompliance.platform.onboarding.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class DocumentResponse {
    private UUID id;
    private UUID userId;
    private String fileName;
    private LocalDateTime uploadedAt;
}