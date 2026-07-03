package com.hrcompliance.platform.audit;

import com.hrcompliance.platform.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Writes immutable audit trail entries for every significant action in the platform.
 * Called from ConsentService, PolicyService, and OnboardingService after successful
 * mutations — satisfying the "audit logging" claim in the compliance engine.
 *
 * Writes are @Async so they never slow down the main request thread.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Log an action, automatically resolving the current tenant from the
     * security context. Safe to call from any authenticated request.
     */
    @Async
    public void log(String action, String entityType, UUID entityId, String details) {
        try {
            AuthenticatedUser user = getCurrentUser();

            AuditLog entry = new AuditLog();
            entry.setCompanyId(user.getCompanyId());
            entry.setUserId(user.getUserId());
            entry.setAction(action);
            entry.setEntityType(entityType);
            entry.setEntityId(entityId);
            entry.setDetails(details);
            entry.setCreatedAt(LocalDateTime.now());

            auditLogRepository.save(entry);
        } catch (Exception e) {
            // Audit failure must NEVER break the main business flow
            log.warn("Audit log write failed for action={} entity={}: {}", action, entityType, e.getMessage());
        }
    }

    private AuthenticatedUser getCurrentUser() {
        return (AuthenticatedUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }
}
