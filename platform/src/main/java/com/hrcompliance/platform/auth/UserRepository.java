package com.hrcompliance.platform.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailAndCompanyId(String email, UUID companyId);
    boolean existsByEmailAndCompanyId(String email, UUID companyId);
}