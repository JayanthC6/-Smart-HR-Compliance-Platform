package com.hrcompliance.platform.common;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@MappedSuperclass
@Getter
@Setter
public abstract class BaseEntity {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "company_id", nullable = false, updatable = false)
    private UUID companyId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}