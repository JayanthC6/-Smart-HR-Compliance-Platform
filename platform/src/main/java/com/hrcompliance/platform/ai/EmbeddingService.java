package com.hrcompliance.platform.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Service
public class EmbeddingService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public EmbeddingService(
            @Value("${app.huggingface.token}") String hfToken,
            ObjectMapper objectMapper) {
        this.webClient = WebClient.builder()
                .baseUrl("https://api-inference.huggingface.co")
                .defaultHeader("Authorization", "Bearer " + hfToken)
                .build();
        this.objectMapper = objectMapper;
    }

    public List<Double> embed(String text) {
        try {
            Object response = webClient.post()
                    .uri("/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2")
                    .bodyValue(Map.of("inputs", text))
                    .retrieve()
                    .bodyToMono(Object.class)
                    .block();

            // HuggingFace returns [[...vector...]] for single input
            if (response instanceof List<?> outer && !((List<?>) outer).isEmpty()) {
                Object first = ((List<?>) outer).get(0);
                if (first instanceof List<?> inner) {
                    return inner.stream()
                            .map(v -> ((Number) v).doubleValue())
                            .toList();
                }
            }
            throw new RuntimeException("Unexpected embedding response format");
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate embedding: " + e.getMessage(), e);
        }
    }

    public String toJson(List<Double> embedding) {
        try {
            return objectMapper.writeValueAsString(embedding);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize embedding", e);
        }
    }

    public List<Double> fromJson(String json) {
        try {
            return objectMapper.readValue(json,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, Double.class));
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize embedding", e);
        }
    }
}