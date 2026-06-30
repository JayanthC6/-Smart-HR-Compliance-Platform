package com.hrcompliance.platform.compliance;

import com.hrcompliance.platform.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "consents")
@Getter
@Setter
public class Consent extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "policy_id", nullable = false)
    private UUID policyId;

    @Column(name = "accepted_at", nullable = false)
    private LocalDateTime acceptedAt;
}