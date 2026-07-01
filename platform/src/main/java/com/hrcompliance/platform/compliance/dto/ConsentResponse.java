package com.hrcompliance.platform.compliance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class ConsentResponse {
    private UUID id;
    private UUID userId;
    private UUID policyId;
    private String policyTitle;
    private LocalDateTime acceptedAt;
}