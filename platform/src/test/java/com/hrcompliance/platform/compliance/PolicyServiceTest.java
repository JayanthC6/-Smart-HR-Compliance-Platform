package com.hrcompliance.platform.compliance;

import com.hrcompliance.platform.audit.AuditService;
import com.hrcompliance.platform.compliance.dto.CreatePolicyRequest;
import com.hrcompliance.platform.compliance.dto.PolicyResponse;
import com.hrcompliance.platform.security.AuthenticatedUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PolicyServiceTest {

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private AuditService auditService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private PolicyService policyService;

    private AuthenticatedUser authUser;
    private final UUID companyId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        authUser = new AuthenticatedUser(userId, companyId, "ADMIN", "admin@test.com");
        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void mockSecurityContext() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(authUser);
    }

    @Test
    void createPolicy_savesAndReturnsResponseAndAudits() {
        mockSecurityContext();

        CreatePolicyRequest req = new CreatePolicyRequest();
        req.setTitle("Remote Work");
        req.setContent("Content here");

        Policy savedPolicy = new Policy();
        savedPolicy.setId(UUID.randomUUID());
        savedPolicy.setCompanyId(companyId);
        savedPolicy.setTitle("Remote Work");
        savedPolicy.setContent("Content here");
        savedPolicy.setVersion(1);

        when(policyRepository.save(any(Policy.class))).thenReturn(savedPolicy);

        PolicyResponse res = policyService.createPolicy(req);

        assertNotNull(res);
        assertEquals("Remote Work", res.getTitle());
        verify(auditService).log(eq("POLICY_CREATED"), eq("Policy"), eq(savedPolicy.getId()), anyString());
    }

    @Test
    void getAllPolicies_returnsAllPolicies() {
        Policy p1 = new Policy(); p1.setId(UUID.randomUUID());
        Policy p2 = new Policy(); p2.setId(UUID.randomUUID());

        when(policyRepository.findAll()).thenReturn(List.of(p1, p2));

        List<PolicyResponse> list = policyService.getAllPolicies();
        assertEquals(2, list.size());
    }

    @Test
    void getPolicyById_whenFound_returnsResponse() {
        UUID policyId = UUID.randomUUID();
        Policy p = new Policy();
        p.setId(policyId);
        p.setTitle("Test Policy");

        when(policyRepository.findById(policyId)).thenReturn(Optional.of(p));

        PolicyResponse res = policyService.getPolicyById(policyId);
        assertEquals("Test Policy", res.getTitle());
    }

    @Test
    void getPolicyById_whenNotFound_throwsException() {
        UUID policyId = UUID.randomUUID();
        when(policyRepository.findById(policyId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> policyService.getPolicyById(policyId));
    }
}
