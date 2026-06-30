package com.hrcompliance.platform.compliance;

import com.hrcompliance.platform.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "policy_chunks")
@Getter
@Setter
public class PolicyChunk extends BaseEntity {

    @Column(name = "policy_id", nullable = false)
    private UUID policyId;

    @Column(name = "chunk_text", nullable = false, columnDefinition = "TEXT")
    private String chunkText;

    @Column(columnDefinition = "TEXT")
    private String embedding; // JSON-encoded float array

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;
}