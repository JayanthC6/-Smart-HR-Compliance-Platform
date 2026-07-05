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
        List<Company> companies = companyRepository.findAll();
        if (companies.isEmpty()) {
            log.info("No companies found in database to bind a sample employee.");
            return;
        }

        Company company = companies.get(0);
        String email = "employee@test.com";

        // Check if sample employee already exists
        boolean exists = userRepository.findAll().stream()
                .anyMatch(u -> u.getEmail().equalsIgnoreCase(email));

        if (!exists) {
            User emp = new User();
            emp.setCompanyId(company.getId());
            emp.setEmail(email);
            emp.setPasswordHash(passwordEncoder.encode("password123"));
            emp.setFullName("John Doe (Employee)");
            emp.setRole(Role.EMPLOYEE);
            emp.setCreatedAt(LocalDateTime.now());
            userRepository.save(emp);
            
            System.out.println("=================================================");
            System.out.println(">>>>>> CREATED SAMPLE EMPLOYEE FOR TESTING <<<<<<");
            System.out.println("Company Name: " + company.getName());
            System.out.println("Email:        " + email);
            System.out.println("Password:     password123");
            System.out.println("=================================================");
        }
    }
}
