package com.hrcompliance.platform.compliance;

import com.hrcompliance.platform.auth.Role;
import com.hrcompliance.platform.auth.User;
import com.hrcompliance.platform.auth.UserRepository;
import com.hrcompliance.platform.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
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

    private AuthenticatedUser currentUser() {
        return (AuthenticatedUser) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
    }
}
