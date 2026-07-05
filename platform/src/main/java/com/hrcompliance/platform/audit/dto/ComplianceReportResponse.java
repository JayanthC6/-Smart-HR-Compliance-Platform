package com.hrcompliance.platform.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ComplianceReportResponse {
    private LocalDateTime generatedAt;
    private String reportContent;
}
