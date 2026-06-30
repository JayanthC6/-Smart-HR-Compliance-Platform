package com.hrcompliance.platform.compliance;

import com.hrcompliance.platform.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "policies")
@Getter
@Setter
public class Policy extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Integer version = 1;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;
}