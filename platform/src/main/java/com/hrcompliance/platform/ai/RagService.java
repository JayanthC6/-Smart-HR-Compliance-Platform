package com.hrcompliance.platform.ai;

import com.hrcompliance.platform.compliance.Policy;
import com.hrcompliance.platform.compliance.PolicyChunk;
import com.hrcompliance.platform.compliance.PolicyChunkRepository;
import com.hrcompliance.platform.compliance.PolicyRepository;
import com.hrcompliance.platform.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RagService {

    private final PolicyRepository policyRepository;
    private final PolicyChunkRepository chunkRepository;
    private final EmbeddingService embeddingService;
    private final GroqService groqService;
    private final RedisTemplate<String, String> redisTemplate;

    private static final int CHUNK_SIZE = 500;
    private static final int TOP_K = 3;
    private static final String RAG_CACHE_PREFIX = "rag:";
    private static final long RAG_CACHE_TTL_MINUTES = 15;

    @Transactional
    public void embedPolicy(UUID policyId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new IllegalArgumentException("Policy not found"));

        chunkRepository.deleteByPolicyId(policyId);

        List<String> chunks = splitIntoChunks(policy.getContent(), CHUNK_SIZE);

        AuthenticatedUser user = getCurrentUser();

        for (int i = 0; i < chunks.size(); i++) {
            String chunkText = chunks.get(i);
            List<Double> embedding = embeddingService.embed(chunkText);

            PolicyChunk chunk = new PolicyChunk();
            chunk.setCompanyId(user.getCompanyId());
            chunk.setPolicyId(policyId);
            chunk.setChunkText(chunkText);
            chunk.setEmbedding(embeddingService.toJson(embedding));
            chunk.setChunkIndex(i);
            chunk.setCreatedAt(LocalDateTime.now());
            chunkRepository.save(chunk);
        }
    }

    public String askQuestion(String question) {
        return askQuestion(question, null);
    }

    public String askQuestion(String question, List<Map<String, String>> history) {
        AuthenticatedUser user = getCurrentUser();

        // Embed the question
        List<Double> questionEmbedding = embeddingService.embed(question);

        // Get all chunks for this tenant
        List<PolicyChunk> allChunks = chunkRepository.findAll();

        if (allChunks.isEmpty()) {
            return "No policy documents have been indexed yet. Please ask your HR team to embed the policies first.";
        }

        // Score each chunk by cosine similarity
        List<ScoredChunk> scored = allChunks.stream()
                .filter(c -> c.getEmbedding() != null)
                .map(c -> {
                    List<Double> chunkEmbedding = embeddingService.fromJson(c.getEmbedding());
                    double score = cosineSimilarity(questionEmbedding, chunkEmbedding);
                    return new ScoredChunk(c, score);
                })
                .sorted(Comparator.comparingDouble(ScoredChunk::score).reversed())
                .limit(TOP_K)
                .toList();

        // Build context from top-K chunks
        StringBuilder context = new StringBuilder();
        for (ScoredChunk sc : scored) {
            context.append(sc.chunk().getChunkText()).append("\n\n");
        }

        String systemPrompt = """
                You are an HR policy assistant. Answer the employee's question
                based ONLY on the policy context provided below. If the answer
                is not in the context, say "I couldn't find this in our current
                policies. Please contact HR directly."

                POLICY CONTEXT:
                """ + context;

        // Skip Redis caching if history is present
        if (history != null && !history.isEmpty()) {
            List<Map<String, String>> fullMessages = new ArrayList<>(history);
            fullMessages.add(Map.of("role", "user", "content", question));
            return groqService.chatWithHistory(systemPrompt, fullMessages);
        }

        // Check Redis cache first — same question from same company returns instantly
        String cacheKey = RAG_CACHE_PREFIX + user.getCompanyId() + ":" + question.toLowerCase().trim();
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return cached;
        }

        String answer = groqService.chat(systemPrompt, question);

        // Cache the answer with 15-minute TTL
        redisTemplate.opsForValue().set(
                cacheKey, answer,
                Duration.ofMinutes(RAG_CACHE_TTL_MINUTES)
        );

        return answer;
    }

    private List<String> splitIntoChunks(String text, int chunkSize) {
        List<String> chunks = new ArrayList<>();
        for (int i = 0; i < text.length(); i += chunkSize) {
            chunks.add(text.substring(i, Math.min(i + chunkSize, text.length())));
        }
        return chunks;
    }

    private double cosineSimilarity(List<Double> a, List<Double> b) {
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.size(); i++) {
            dot += a.get(i) * b.get(i);
            normA += a.get(i) * a.get(i);
            normB += b.get(i) * b.get(i);
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private AuthenticatedUser getCurrentUser() {
        return (AuthenticatedUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }

    private record ScoredChunk(PolicyChunk chunk, double score) {}
}