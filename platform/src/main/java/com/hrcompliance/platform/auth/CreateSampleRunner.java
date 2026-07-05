package com.hrcompliance.platform.auth;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CreateSampleRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Ensure DemoCorp company exists
        Company demoCompany = companyRepository.findAll().stream()
                .filter(c -> c.getName().equalsIgnoreCase("DemoCorp"))
                .findFirst()
                .orElseGet(() -> {
                    Company c = new Company();
                    c.setName("DemoCorp");
                    c.setCreatedAt(LocalDateTime.now());
                    return companyRepository.save(c);
                });

        // 2. Ensure admin@democorp.com exists
        boolean adminExists = userRepository.findAll().stream()
                .anyMatch(u -> u.getEmail().equalsIgnoreCase("admin@democorp.com"));
        if (!adminExists) {
            User admin = new User();
            admin.setCompanyId(demoCompany.getId());
            admin.setEmail("admin@democorp.com");
            admin.setPasswordHash(passwordEncoder.encode("password123"));
            admin.setFullName("Demo Admin");
            admin.setRole(Role.ADMIN);
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
        }

        // 3. Ensure employee@democorp.com exists
        boolean employeeExists = userRepository.findAll().stream()
                .anyMatch(u -> u.getEmail().equalsIgnoreCase("employee@democorp.com"));
        if (!employeeExists) {
            User employee = new User();
            employee.setCompanyId(demoCompany.getId());
            employee.setEmail("employee@democorp.com");
            employee.setPasswordHash(passwordEncoder.encode("password123"));
            employee.setFullName("Demo Employee");
            employee.setRole(Role.EMPLOYEE);
            employee.setCreatedAt(LocalDateTime.now());
            userRepository.save(employee);

            System.out.println("=================================================");
            System.out.println(">>>>>> SEEDED DEMOCORP & DEMO ACCOUNTS <<<<<<");
            System.out.println("Company Name: DemoCorp");
            System.out.println("Admin Email:  admin@democorp.com");
            System.out.println("Emp Email:    employee@democorp.com");
            System.out.println("Password:     password123");
            System.out.println("=================================================");
        }
    }
}
