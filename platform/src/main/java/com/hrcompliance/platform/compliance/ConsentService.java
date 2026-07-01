package com.hrcompliance.platform.compliance;

import com.hrcompliance.platform.compliance.dto.ConsentResponse;
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
public class ConsentService {

    private final ConsentRepository consentRepository;
    private final PolicyRepository policyRepository;

    @Transactional
    public ConsentResponse acceptPolicy(UUID policyId) {
        AuthenticatedUser user = getCurrentUser();

        // Check policy exists and belongs to same tenant
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new IllegalArgumentException("Policy not found"));

        // Prevent duplicate consent
        if (consentRepository.existsByUserIdAndPolicyId(user.getUserId(), policyId)) {
            throw new IllegalArgumentException("You have already accepted this policy");
        }

        Consent consent = new Consent();
        consent.setCompanyId(user.getCompanyId());
        consent.setUserId(user.getUserId());
        consent.setPolicyId(policyId);
        consent.setAcceptedAt(LocalDateTime.now());
        consent.setCreatedAt(LocalDateTime.now());
        consent = consentRepository.save(consent);

        return new ConsentResponse(
                consent.getId(),
                consent.getUserId(),
                consent.getPolicyId(),
                policy.getTitle(),
                consent.getAcceptedAt()
        );
    }

    public List<ConsentResponse> getMyConsents() {
        AuthenticatedUser user = getCurrentUser();
        return consentRepository.findByUserId(user.getUserId())
                .stream()
                .map(c -> {
                    String title = policyRepository.findById(c.getPolicyId())
                            .map(Policy::getTitle)
                            .orElse("Unknown Policy");
                    return new ConsentResponse(
                            c.getId(),
                            c.getUserId(),
                            c.getPolicyId(),
                            title,
                            c.getAcceptedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    private AuthenticatedUser getCurrentUser() {
        return (AuthenticatedUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }
}