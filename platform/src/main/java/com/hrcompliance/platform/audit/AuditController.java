package com.hrcompliance.platform.audit;

import com.hrcompliance.platform.audit.dto.ComplianceReportResponse;
import com.hrcompliance.platform.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST API #16 — GET /api/audit/logs
 * Returns the full, chronological audit trail for the current company (tenant).
 * Restricted to ADMIN and HR roles only.
 */
@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditLogRepository auditLogRepository;
    private final AuditService auditService;

    @GetMapping("/logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<List<Map<String, Object>>> getAuditLogs() {
        AuthenticatedUser user = (AuthenticatedUser) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();

        List<Map<String, Object>> logs = auditLogRepository
                .findByCompanyIdOrderByCreatedAtDesc(user.getCompanyId())
                .stream()
                .map(log -> Map.<String, Object>of(
                        "id",         log.getId(),
                        "userId",     log.getUserId() != null ? log.getUserId() : "system",
                        "action",     log.getAction(),
                        "entityType", log.getEntityType(),
                        "entityId",   log.getEntityId() != null ? log.getEntityId() : "",
                        "details",    log.getDetails() != null ? log.getDetails() : "",
                        "timestamp",  log.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(logs);
    }

    @PostMapping("/report")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<ComplianceReportResponse> generateReport() {
        return ResponseEntity.ok(auditService.generateReport());
    }
}

