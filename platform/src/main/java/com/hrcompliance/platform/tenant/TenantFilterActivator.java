package com.hrcompliance.platform.tenant;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class TenantFilterActivator {

    @PersistenceContext
    private EntityManager entityManager;

    public void activateTenantFilter(UUID companyId) {
        Session session = entityManager.unwrap(Session.class);
        session.enableFilter("tenantFilter")
               .setParameter("companyId", companyId);
    }
}