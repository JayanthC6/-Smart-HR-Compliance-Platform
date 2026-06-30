package com.hrcompliance.platform.onboarding;

import com.hrcompliance.platform.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "onboarding_tasks")
@Getter
@Setter
public class OnboardingTask extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.PENDING;

    @Column(name = "due_date")
    private LocalDate dueDate;
}