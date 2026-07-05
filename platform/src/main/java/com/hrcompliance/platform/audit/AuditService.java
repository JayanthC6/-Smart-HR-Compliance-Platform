package com.hrcompliance.platform.audit;

import com.hrcompliance.platform.audit.dto.ComplianceReportResponse;
import com.hrcompliance.platform.ai.GroqService;
import com.hrcompliance.platform.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

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
    private final GroqService groqService;
    private final RedisTemplate<String, String> redisTemplate;

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

    public ComplianceReportResponse generateReport() {
        AuthenticatedUser user = getCurrentUser();
        UUID companyId = user.getCompanyId();
        String cacheKey = "report:" + companyId;

        String cachedReport = redisTemplate.opsForValue().get(cacheKey);
        if (cachedReport != null) {
            return new ComplianceReportResponse(LocalDateTime.now(), cachedReport);
        }

        List<AuditLog> logs = auditLogRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);

        String reportContent;
        if (logs.isEmpty()) {
            reportContent = "No compliance activities recorded yet";
        } else {
            String userMessage = logs.stream()
                    .map(log -> String.format("- Action: %s, Entity Type: %s, Created At: %s",
                            log.getAction(), log.getEntityType(), log.getCreatedAt()))
                    .collect(Collectors.joining("\n"));

            String systemPrompt = "You are a compliance report writer. Given the following audit log entries " +
                    "from an HR compliance system, write a professional compliance report summary. " +
                    "Include: overall compliance status, key actions taken, any risks or gaps noticed. " +
                    "Format with clear sections. Be concise but professional.";

            reportContent = groqService.chat(systemPrompt, userMessage);
        }

        redisTemplate.opsForValue().set(cacheKey, reportContent, 30, TimeUnit.MINUTES);

        return new ComplianceReportResponse(LocalDateTime.now(), reportContent);
    }

    private AuthenticatedUser getCurrentUser() {
        return (AuthenticatedUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }
}

