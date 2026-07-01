package com.hrcompliance.platform.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final RagService ragService;

    @PostMapping("/embed/{policyId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<Map<String, String>> embedPolicy(@PathVariable UUID policyId) {
        ragService.embedPolicy(policyId);
        return ResponseEntity.ok(Map.of("message", "Policy embedded successfully"));
    }

    @PostMapping("/ask")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<Map<String, String>> ask(@RequestBody Map<String, String> body) {
        String question = body.get("question");
        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Question is required"));
        }
        String answer = ragService.askQuestion(question);
        return ResponseEntity.ok(Map.of("answer", answer));
    }
}