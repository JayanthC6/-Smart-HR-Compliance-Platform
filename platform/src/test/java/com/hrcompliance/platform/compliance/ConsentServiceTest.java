package com.hrcompliance.platform.compliance;

import com.hrcompliance.platform.audit.AuditService;
import com.hrcompliance.platform.compliance.dto.ConsentResponse;
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
class ConsentServiceTest {

    @Mock
    private ConsentRepository consentRepository;

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private AuditService auditService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ConsentService consentService;

    private AuthenticatedUser authUser;
    private final UUID companyId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();
    private final UUID policyId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        authUser = new AuthenticatedUser(userId, companyId, "EMPLOYEE", "emp@test.com");
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
    void acceptPolicy_savesConsentAndAudits() {
        mockSecurityContext();

        Policy policy = new Policy();
        policy.setId(policyId);
        policy.setTitle("Test Policy");

        Consent savedConsent = new Consent();
        savedConsent.setId(UUID.randomUUID());
        savedConsent.setPolicyId(policyId);
        savedConsent.setUserId(userId);

        when(policyRepository.findById(policyId)).thenReturn(Optional.of(policy));
        when(consentRepository.existsByUserIdAndPolicyId(userId, policyId)).thenReturn(false);
        when(consentRepository.save(any(Consent.class))).thenReturn(savedConsent);

        ConsentResponse res = consentService.acceptPolicy(policyId);

        assertNotNull(res);
        assertEquals(policyId, res.getPolicyId());
        assertEquals("Test Policy", res.getPolicyTitle());
        verify(auditService).log(eq("POLICY_ACCEPTED"), eq("Consent"), eq(savedConsent.getId()), anyString());
    }

    @Test
    void acceptPolicy_whenAlreadyAccepted_throwsException() {
        mockSecurityContext();
        Policy policy = new Policy();
        policy.setId(policyId);

        when(policyRepository.findById(policyId)).thenReturn(Optional.of(policy));
        when(consentRepository.existsByUserIdAndPolicyId(userId, policyId)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> consentService.acceptPolicy(policyId));
        verify(consentRepository, never()).save(any());
    }

    @Test
    void acceptPolicy_whenPolicyNotFound_throwsException() {
        mockSecurityContext();
        when(policyRepository.findById(policyId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> consentService.acceptPolicy(policyId));
    }

    @Test
    void getMyConsents_returnsConsentsForCurrentUser() {
        mockSecurityContext();
        
        Consent c = new Consent();
        c.setId(UUID.randomUUID());
        c.setPolicyId(policyId);
        c.setUserId(userId);

        Policy policy = new Policy();
        policy.setTitle("Test Policy");

        when(consentRepository.findByUserId(userId)).thenReturn(List.of(c));
        when(policyRepository.findById(policyId)).thenReturn(Optional.of(policy));

        List<ConsentResponse> list = consentService.getMyConsents();
        
        assertEquals(1, list.size());
        assertEquals("Test Policy", list.get(0).getPolicyTitle());
    }
}
