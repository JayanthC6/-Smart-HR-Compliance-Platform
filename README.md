# Smart HR Compliance Platform

A multi-tenant SaaS platform for HR compliance management, built to demonstrate
production-grade backend architecture: real tenant isolation, JWT-based RBAC,
and an AI-powered policy assistant using Retrieval-Augmented Generation (RAG).

## What this project is

Companies often struggle to track whether employees have actually read and
accepted HR policies, and to onboard new hires consistently. This platform
gives each company (tenant) its own isolated workspace to manage:

- **Policy documents** - create, version, and publish HR policies
- **Consent tracking** - record and prove which employee accepted which policy, and when (audit-ready)
- **Onboarding checklists** - task-based onboarding flow for new hires, with document uploads
- **AI policy assistant** - employees can ask natural-language questions about company policy and get answers grounded in the actual policy documents (RAG), instead of digging through PDFs
- **Audit trail** - every significant action is logged for compliance reporting

## Why multi-tenant

This is a single shared-database, shared-schema multi-tenant system — every
table that belongs to a tenant carries a `company_id` column. Rather than
manually appending `WHERE company_id = ?` to every query (easy to forget,
easy to get wrong), tenant isolation is enforced once and automatically via
Hibernate filters tied to the authenticated user's JWT — the architecturally
interesting part of this project, and the part most worth discussing in an
interview, since it directly addresses the most common real-world bug class
in multi-tenant systems: cross-tenant data leakage.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.5, Spring Security, Spring Data JPA (Hibernate) |
| Database | PostgreSQL 18, Flyway (versioned migrations) |
| Auth | JWT (jjwt), BCrypt password hashing |
| Caching | Redis (planned — JWT blacklist, response caching) |
| AI / RAG | Groq (LLM inference) + HuggingFace Inference API (embeddings), cosine similarity search |
| API docs | springdoc-openapi / Swagger UI |
| Frontend | React + TypeScript (not yet started) |
| Containerization | Docker Compose (planned, deferred until core app is feature-complete) |

## Architecture decisions worth highlighting

- **UUID primary keys**, not auto-increment integers — prevents sequential ID
  enumeration across tenants, a real concern in multi-tenant systems where a
  predictable ID scheme can let one company guess at another's record IDs.
- **Flyway over `ddl-auto: update`** - schema is version-controlled via
  explicit migration files (`V1`, `V2`, `V3`...), and Hibernate is set to
  `validate` only, so the database schema can never silently drift from what
  the entity classes expect.
- **Provider-agnostic embedding layer** - the RAG pipeline calls embeddings
  through a clean `EmbeddingService` interface, so the underlying provider
  (currently HuggingFace's free Inference API) can be swapped for a local
  model later without touching calling code.
- **Cosine similarity computed in application code**, not via a vector
  database extension like pgvector — a deliberate scope decision to avoid a
  native Postgres extension install blocking progress, with room to upgrade
  later once the core pipeline works end-to-end.

## Current status (as of this commit)

**Working:**
- Project scaffolded (Spring Boot 3.5, Java 17, Maven, feature-package structure)
- PostgreSQL database created and connected
- Full schema in place via Flyway migrations (`V1`–`V3`): companies, users,
  policies, policy_chunks, consents, onboarding_tasks, documents, audit_logs
- All JPA entities mapped and validated against the live schema (Hibernate
  `ddl-auto: validate` passes cleanly)
- JWT infrastructure built: token generation/validation, auth filter, security
  config, BCrypt password encoding
- `/api/auth/register` and `/api/auth/login` endpoints implemented
- Application boots successfully and connects to Postgres (port 8081)

**In progress:**
- Debugging a `403 Forbidden` on `POST /api/auth/register` — endpoint is
  correctly marked `permitAll()` in `SecurityConfig`, but something in the
  Spring Security filter chain is still rejecting the request before it
  reaches the controller. Root cause not yet confirmed.

**Not started yet:**
- Hibernate tenant filter (the core multi-tenancy enforcement mechanism)
- Compliance module business logic (policy CRUD, consent recording)
- Onboarding module business logic
- RAG/AI module (embedding pipeline, Groq integration, similarity search)
- Redis caching layer
- React + TypeScript frontend
- Unit/integration tests
- Docker Compose setup

## Local setup

Requires Java 17, Maven, and PostgreSQL running locally.

```bash
# create the database
psql -U postgres -c "CREATE DATABASE hr_compliance;"

# set required environment variables
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="<your_postgres_password>"
$env:JWT_SECRET="<a_random_string_at_least_32_characters_long>"
$env:JWT_EXPIRATION_MS="86400000"

# run
.\mvnw.cmd spring-boot:run
```

The app starts on `http://localhost:8081`. Swagger UI is available at
`/swagger-ui.html` once the app is running.

## Roadmap

1. Fix the 403 on auth endpoints
2. Implement Hibernate tenant filter for automatic `company_id` scoping
3. Build out Compliance and Onboarding module business logic
4. Build the RAG pipeline (embedding service + Groq-backed Q&A endpoint)
5. Add Redis caching
6. Build the React frontend
7. Add test coverage (JUnit 5 + Mockito)
8. Dockerize the full stack