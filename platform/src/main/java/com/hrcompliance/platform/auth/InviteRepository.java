package com.hrcompliance.platform.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InviteRepository extends JpaRepository<CompanyInvite, UUID> {
    Optional<CompanyInvite> findByToken(String token);
    Optional<CompanyInvite> findByTokenAndUsedFalse(String token);
}
