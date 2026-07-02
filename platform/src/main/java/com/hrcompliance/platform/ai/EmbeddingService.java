package com.hrcompliance.platform.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EmbeddingService {

    private final ObjectMapper objectMapper;

    public EmbeddingService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<Double> embed(String text) {
        int dimensions = 384;
        double[] vector = new double[dimensions];
        String normalized = text.toLowerCase().replaceAll("[^a-z0-9\\s]", "");
        String[] words = normalized.split("\\s+");

        for (String word : words) {
            if (word.isEmpty()) continue;
            int hash = Math.abs(word.hashCode());
            int primaryDim = hash % dimensions;
            vector[primaryDim] += 1.0;

            for (int i = 1; i <= 3 && i < word.length(); i++) {
                String ngram = word.substring(0, i);
                int ngramHash = Math.abs(ngram.hashCode());
                vector[ngramHash % dimensions] += 0.5 / i;
            }
        }

        double norm = 0;
        for (double v : vector) norm += v * v;
        norm = Math.sqrt(norm);
        if (norm == 0) norm = 1;

        List<Double> result = new ArrayList<>();
        for (double v : vector) result.add(v / norm);
        return result;
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
                    objectMapper.getTypeFactory()
                            .constructCollectionType(List.class, Double.class));
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize embedding", e);
        }
    }
}