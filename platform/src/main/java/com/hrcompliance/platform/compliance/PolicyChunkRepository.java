package com.hrcompliance.platform.compliance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

public interface PolicyChunkRepository extends JpaRepository<PolicyChunk, UUID> {

    @Modifying
    @Transactional
    @Query("DELETE FROM PolicyChunk c WHERE c.policyId = :policyId")
    void deleteByPolicyId(UUID policyId);
}