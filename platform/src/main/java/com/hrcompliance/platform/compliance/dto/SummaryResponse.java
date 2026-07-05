package com.hrcompliance.platform.compliance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class SummaryResponse {
    private UUID policyId;
    private String title;
    private String summary;
}
