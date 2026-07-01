package com.hrcompliance.platform.onboarding;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface OnboardingTaskRepository extends JpaRepository<OnboardingTask, UUID> {
    List<OnboardingTask> findByUserId(UUID userId);
}