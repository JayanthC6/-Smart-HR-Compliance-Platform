package com.hrcompliance.platform.compliance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrcompliance.platform.auth.Role;
import com.hrcompliance.platform.auth.User;
import com.hrcompliance.platform.auth.UserRepository;
import com.hrcompliance.platform.compliance.dto.ComplianceRiskResponse;
import com.hrcompliance.platform.ai.GroqService;
import com.hrcompliance.platform.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Compliance monitoring engine — REST API #17.
 *
 * GET /api/compliance/summary
 *   Returns a per-policy breakdown of which employees have and haven't accepted
 *   each policy, along with an overall company compliance score.
 *   This is the "compliance monitoring" feature described in the resume.
 *
 * GET /api/compliance/non-compliant
 *   Returns only employees who have at least one unaccepted policy — the
 *   actionable shortlist for the HR team.
 */
@RestController
@RequestMapping("/api/compliance")
@RequiredArgsConstructor
public class ComplianceController {

    private final PolicyRepository     policyRepository;
    private final ConsentRepository    consentRepository;
    private final UserRepository       userRepository;
    private final GroqService          groqService;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper         objectMapper;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> getComplianceSummary() {
        AuthenticatedUser admin = currentUser();

        // All policies for this tenant
        List<Policy> policies = policyRepository.findAll();

        // All employees in this tenant
        List<User> employees = userRepository.findAll().stream()
                .filter(u -> u.getCompanyId().equals(admin.getCompanyId())
                          && u.getRole() == Role.EMPLOYEE)
                .collect(Collectors.toList());

        // All consents for this tenant
        List<Consent> allConsents = consentRepository.findAll();

        // Build per-policy breakdown
        List<Map<String, Object>> policyBreakdowns = new ArrayList<>();
        int totalRequired  = 0;
        int totalCompleted = 0;

        for (Policy policy : policies) {
            Set<UUID> acceptedUserIds = allConsents.stream()
                    .filter(c -> c.getPolicyId().equals(policy.getId()))
                    .map(Consent::getUserId)
                    .collect(Collectors.toSet());

            List<String> accepted = employees.stream()
                    .filter(e -> acceptedUserIds.contains(e.getId()))
                    .map(User::getFullName)
                    .collect(Collectors.toList());

            List<String> pending = employees.stream()
                    .filter(e -> !acceptedUserIds.contains(e.getId()))
                    .map(User::getFullName)
                    .collect(Collectors.toList());

            int required  = employees.size();
            int completed = accepted.size();
            totalRequired  += required;
            totalCompleted += completed;

            policyBreakdowns.add(Map.of(
                    "policyId",       policy.getId(),
                    "policyTitle",    policy.getTitle(),
                    "version",        policy.getVersion(),
                    "totalEmployees", required,
                    "accepted",       completed,
                    "pending",        required - completed,
                    "compliancePct",  required > 0 ? (completed * 100 / required) : 100,
                    "acceptedBy",     accepted,
                    "pendingBy",      pending
            ));
        }

        int overallPct = totalRequired > 0
                ? (totalCompleted * 100 / totalRequired)
                : 100;

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("companyId",         admin.getCompanyId());
        summary.put("totalPolicies",      policies.size());
        summary.put("totalEmployees",     employees.size());
        summary.put("overallCompliancePct", overallPct);
        summary.put("policies",           policyBreakdowns);

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/non-compliant")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<Map<String, Object>>> getNonCompliantEmployees() {
        AuthenticatedUser admin = currentUser();

        List<Policy> policies = policyRepository.findAll();
        List<User> employees  = userRepository.findAll().stream()
                .filter(u -> u.getCompanyId().equals(admin.getCompanyId())
                          && u.getRole() == Role.EMPLOYEE)
                .collect(Collectors.toList());
        List<Consent> allConsents = consentRepository.findAll();

        List<Map<String, Object>> nonCompliant = new ArrayList<>();

        for (User employee : employees) {
            Set<UUID> acceptedPolicyIds = allConsents.stream()
                    .filter(c -> c.getUserId().equals(employee.getId()))
                    .map(Consent::getPolicyId)
                    .collect(Collectors.toSet());

            List<String> unaccepted = policies.stream()
                    .filter(p -> !acceptedPolicyIds.contains(p.getId()))
                    .map(Policy::getTitle)
                    .collect(Collectors.toList());

            if (!unaccepted.isEmpty()) {
                nonCompliant.add(Map.of(
                        "userId",            employee.getId(),
                        "fullName",          employee.getFullName(),
                        "email",             employee.getEmail(),
                        "unacceptedPolicies", unaccepted,
                        "pendingCount",       unaccepted.size()
                ));
            }
        }

        return ResponseEntity.ok(nonCompliant);
    }

    @GetMapping("/risk-score")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ComplianceRiskResponse> getComplianceRiskScore(
            @RequestParam(value = "refresh", required = false, defaultValue = "false") boolean refresh) throws Exception {
        AuthenticatedUser admin = currentUser();
        UUID companyId = admin.getCompanyId();
        String cacheKey = "risk-score:" + companyId;

        if (!refresh) {
            String cachedJson = redisTemplate.opsForValue().get(cacheKey);
            if (cachedJson != null) {
                return ResponseEntity.ok(objectMapper.readValue(cachedJson, ComplianceRiskResponse.class));
            }
        }

        List<Policy> policies = policyRepository.findAll();
        List<User> employees = userRepository.findAll().stream()
                .filter(u -> u.getCompanyId().equals(companyId) && u.getRole() == Role.EMPLOYEE)
                .collect(Collectors.toList());
        List<Consent> consents = consentRepository.findAll();

        List<ComplianceRiskResponse.PolicyBreakdown> breakdownList = new ArrayList<>();
        long totalConsents = 0;

        for (Policy policy : policies) {
            long acceptedCount = consents.stream()
                    .filter(c -> c.getPolicyId().equals(policy.getId()) 
                              && employees.stream().anyMatch(e -> e.getId().equals(c.getUserId())))
                    .count();
            totalConsents += acceptedCount;

            double rate = employees.isEmpty() ? 100.0 : ((double) acceptedCount / employees.size()) * 100.0;
            breakdownList.add(new ComplianceRiskResponse.PolicyBreakdown(
                    policy.getTitle(),
                    rate,
                    acceptedCount,
                    employees.size()
            ));
        }

        int totalEmployees = employees.size();
        long totalPossibleConsents = (long) policies.size() * totalEmployees;
        double riskScore = 0;
        if (totalPossibleConsents > 0) {
            riskScore = ((double) totalConsents / totalPossibleConsents) * 100.0;
        } else if (policies.isEmpty()) {
            riskScore = 100.0;
        }

        String riskLevel;
        if (riskScore >= 80) {
            riskLevel = "LOW";
        } else if (riskScore >= 50) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "HIGH";
        }

        StringBuilder dataBuilder = new StringBuilder();
        dataBuilder.append("Total Employees: ").append(totalEmployees).append("\n");
        dataBuilder.append("Policies Acceptance Rates:\n");
        for (ComplianceRiskResponse.PolicyBreakdown pb : breakdownList) {
            dataBuilder.append(String.format("- Policy: \"%s\", Acceptance Rate: %.1f%%, Accepted Count: %d/%d\n",
                    pb.getPolicyTitle(), pb.getAcceptanceRate(), pb.getAcceptedCount(), pb.getTotalEmployees()));
        }

        String systemPrompt = "You are a compliance risk analyst. Given the following policy acceptance " +
                "data for a company, provide: 1) An overall risk level (LOW/MEDIUM/HIGH), " +
                "2) A risk score out of 100, 3) Top 3 specific risks or gaps identified, " +
                "4) Top 3 recommendations to improve compliance. Be concise and direct.";

        String aiAnalysis = groqService.chat(systemPrompt, dataBuilder.toString());

        ComplianceRiskResponse response = new ComplianceRiskResponse(
                riskScore,
                riskLevel,
                aiAnalysis,
                breakdownList,
                LocalDateTime.now()
        );

        String json = objectMapper.writeValueAsString(response);
        redisTemplate.opsForValue().set(cacheKey, json, 30, TimeUnit.MINUTES);

        return ResponseEntity.ok(response);
    }

    private AuthenticatedUser currentUser() {
        return (AuthenticatedUser) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
    }
}
