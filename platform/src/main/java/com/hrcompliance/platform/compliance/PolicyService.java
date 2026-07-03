package com.hrcompliance.platform.compliance;

import com.hrcompliance.platform.audit.AuditService;
import com.hrcompliance.platform.compliance.dto.CreatePolicyRequest;
import com.hrcompliance.platform.compliance.dto.PolicyResponse;
import com.hrcompliance.platform.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final AuditService auditService;

    @Transactional
    public PolicyResponse createPolicy(CreatePolicyRequest request) {
        AuthenticatedUser user = getCurrentUser();

        Policy policy = new Policy();
        policy.setCompanyId(user.getCompanyId());
        policy.setTitle(request.getTitle());
        policy.setContent(request.getContent());
        policy.setVersion(1);
        policy.setCreatedBy(user.getUserId());
        policy.setCreatedAt(LocalDateTime.now());

        policy = policyRepository.save(policy);
        auditService.log("POLICY_CREATED", "Policy", policy.getId(),
                "Created policy: " + policy.getTitle() + " (v" + policy.getVersion() + ")");
        return toResponse(policy);
    }

    public List<PolicyResponse> getAllPolicies() {
        return policyRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PolicyResponse getPolicyById(UUID id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Policy not found"));
        return toResponse(policy);
    }

    private PolicyResponse toResponse(Policy policy) {
        return new PolicyResponse(
                policy.getId(),
                policy.getTitle(),
                policy.getContent(),
                policy.getVersion(),
                policy.getCreatedBy(),
                policy.getCreatedAt()
        );
    }

    private AuthenticatedUser getCurrentUser() {
        return (AuthenticatedUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }
}