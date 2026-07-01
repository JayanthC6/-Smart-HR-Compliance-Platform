package com.hrcompliance.platform.compliance;

import com.hrcompliance.platform.compliance.dto.ConsentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/consents")
@RequiredArgsConstructor
public class ConsentController {

    private final ConsentService consentService;

    @PostMapping("/{policyId}/accept")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<ConsentResponse> acceptPolicy(@PathVariable UUID policyId) {
        return ResponseEntity.ok(consentService.acceptPolicy(policyId));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<List<ConsentResponse>> getMyConsents() {
        return ResponseEntity.ok(consentService.getMyConsents());
    }
}