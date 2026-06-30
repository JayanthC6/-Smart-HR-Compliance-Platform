package com.hrcompliance.platform.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {
}