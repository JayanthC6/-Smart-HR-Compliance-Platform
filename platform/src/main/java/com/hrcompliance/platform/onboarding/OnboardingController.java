package com.hrcompliance.platform.onboarding;

import com.hrcompliance.platform.onboarding.dto.CreateTaskRequest;
import com.hrcompliance.platform.onboarding.dto.DocumentResponse;
import com.hrcompliance.platform.onboarding.dto.TaskResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/onboarding")
@RequiredArgsConstructor
public class OnboardingController {

    private final OnboardingService onboardingService;

    @PostMapping("/tasks")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody CreateTaskRequest request) {
        return ResponseEntity.ok(onboardingService.createTask(request));
    }

    @PatchMapping("/tasks/{taskId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<TaskResponse> updateStatus(
            @PathVariable UUID taskId,
            @RequestParam TaskStatus status) {
        return ResponseEntity.ok(onboardingService.updateTaskStatus(taskId, status));
    }

    @GetMapping("/tasks/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<List<TaskResponse>> getMyTasks() {
        return ResponseEntity.ok(onboardingService.getMyTasks());
    }

    @PostMapping("/documents")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(onboardingService.uploadDocument(file));
    }

    @GetMapping("/documents/my")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<List<DocumentResponse>> getMyDocuments() {
        return ResponseEntity.ok(onboardingService.getMyDocuments());
    }
}