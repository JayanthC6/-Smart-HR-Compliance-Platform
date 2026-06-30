-- V1__init_schema.sql
-- Core schema for Smart HR Compliance Platform
-- Multi-tenancy strategy: shared tables, discriminated by company_id (tenant_id)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- COMPANIES (the tenant itself)
-- ============================================================
CREATE TABLE companies (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL CHECK (role IN ('ADMIN', 'HR', 'EMPLOYEE')),
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_users_company_email UNIQUE (company_id, email)
);

CREATE INDEX idx_users_company_id ON users(company_id);

-- ============================================================
-- POLICIES
-- ============================================================
CREATE TABLE policies (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    content     TEXT NOT NULL,
    version     INT NOT NULL DEFAULT 1,
    created_by  UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_policies_company_id ON policies(company_id);

-- ============================================================
-- POLICY_CHUNKS (for RAG search)
-- ============================================================
CREATE TABLE policy_chunks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    policy_id   UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    chunk_text  TEXT NOT NULL,
    embedding   TEXT,
    chunk_index INT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_policy_chunks_company_id ON policy_chunks(company_id);
CREATE INDEX idx_policy_chunks_policy_id ON policy_chunks(policy_id);

-- ============================================================
-- CONSENTS
-- ============================================================
CREATE TABLE consents (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    policy_id    UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    accepted_at  TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_consents_user_policy UNIQUE (user_id, policy_id)
);

CREATE INDEX idx_consents_company_id ON consents(company_id);

-- ============================================================
-- ONBOARDING_TASKS
-- ============================================================
CREATE TABLE onboarding_tasks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
    due_date    DATE,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_onboarding_tasks_company_id ON onboarding_tasks(company_id);

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE TABLE documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name   VARCHAR(255) NOT NULL,
    file_path   VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_company_id ON documents(company_id);

-- ============================================================
-- AUDIT_LOGS
-- ============================================================
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id),
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id   UUID,
    details     TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_company_id ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);