package com.hrcompliance.platform.compliance;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ConsentRepository extends JpaRepository<Consent, UUID> {
    List<Consent> findByUserId(UUID userId);
    boolean existsByUserIdAndPolicyId(UUID userId, UUID policyId);
}