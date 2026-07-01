package com.hrcompliance.platform.compliance;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PolicyRepository extends JpaRepository<Policy, UUID> {
}