package com.hrcompliance.platform.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class GroqService {

    private final WebClient webClient;

    public GroqService(@Value("${app.groq.api-key}") String groqKey) {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .defaultHeader("Authorization", "Bearer " + groqKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public String chat(String systemPrompt, String userMessage) {
        Map<String, Object> body = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)
                ),
                "max_tokens", 1024
        );

        Map response = webClient.post()
                .uri("/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        List choices = (List) response.get("choices");
        Map firstChoice = (Map) choices.get(0);
        Map message = (Map) firstChoice.get("message");
        return (String) message.get("content");
    }

    public String chatWithHistory(String systemPrompt, List<Map<String, String>> messages) {
        List<Map<String, Object>> bodyMessages = new ArrayList<>();
        bodyMessages.add(Map.of("role", "system", "content", systemPrompt));
        if (messages != null) {
            for (Map<String, String> m : messages) {
                bodyMessages.add(Map.of("role", m.get("role"), "content", m.get("content")));
            }
        }

        Map<String, Object> body = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", bodyMessages,
                "max_tokens", 1024
        );

        Map response = webClient.post()
                .uri("/chat/completions")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        List choices = (List) response.get("choices");
        Map firstChoice = (Map) choices.get(0);
        Map message = (Map) firstChoice.get("message");
        return (String) message.get("content");
    }
}