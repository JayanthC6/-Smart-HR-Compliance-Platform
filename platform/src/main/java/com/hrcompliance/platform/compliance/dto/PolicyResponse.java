package com.hrcompliance.platform.compliance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class PolicyResponse {
    private UUID id;
    private String title;
    private String content;
    private Integer version;
    private UUID createdBy;
    private LocalDateTime createdAt;
}