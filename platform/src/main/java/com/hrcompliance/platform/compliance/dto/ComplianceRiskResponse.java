package com.hrcompliance.platform.compliance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceRiskResponse {
    private double riskScore;
    private String riskLevel;
    private String aiAnalysis;
    private List<PolicyBreakdown> policyBreakdown;
    private LocalDateTime generatedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PolicyBreakdown {
        private String policyTitle;
        private double acceptanceRate;
        private long acceptedCount;
        private int totalEmployees;
    }
}
