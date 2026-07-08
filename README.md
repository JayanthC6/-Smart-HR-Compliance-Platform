# Smart HR Compliance System

A modern, full-stack HR Compliance and Onboarding multi-tenant SaaS platform built with React, Spring Boot, PostgreSQL, Redis, and AI. This platform helps companies manage employee onboarding, document verification, policy distribution, and compliance auditing in a centralized and secure way.

---

## Key Features

- **Multi-Tenant Architecture:** Shared database design where every tenant-scoped table is discriminated by a `company_id` column, automatically filtered via Hibernate filter annotations.
- **Invite-Based Self-Registration:** HR and Admins can generate secure invite links (48-hour TTL) allowing new employees to self-register into their company's workspace.
- **Role-Based Portal Logins:** Separate **Admin / HR** and **Employee** login flows with UI validation bounds to prevent portal cross-login mistakes.
- **Local Database Seeder:** Automatically seeds a test employee (`employee@test.com` with password `password123`) bound to the first registered company on project startup.
- **Policy Management:** Create and distribute company policies (Remote Work, PTO, Anti-Harassment) with strict versioning.
- **AI Policy Assistant (RAG Chat with Memory):** Chatbot using Groq AI and HuggingFace embeddings. Employees can query the chatbot for instant answers sourced from vector-embedded policies. Supports **Conversational Memory** to maintain thread context.
- **AI Policy Summarizer:** Instantly generate a 3-bullet, 20-word summary of complex company policies, cached in Redis for 60 minutes.
- **AI Compliance Report Generator:** Automatically summarize the company's chronological audit trail to assess compliance status and risks, cached in Redis for 30 minutes and downloadable as a `.txt` file.
- **AI Compliance Risk Score Dashboard:** Calculates policy acceptance rates across employees and queries LLaMA-based compliance risk analysts to estimate company risk levels (LOW/MEDIUM/HIGH) and yield actionable recommendations. Caches score outputs in Redis for 30 minutes and features force-refresh capabilities.
- **Immutable Audit Log:** Automatically records all compliance actions (policy creation, acceptance, document uploads) for SOC2/ISO audit trails.

---

## Tech Stack

- **Frontend:** React (Vite), TypeScript, Lucide Icons, Vanilla CSS
- **Backend:** Spring Boot 3.5, Spring Security (JWT), Spring Data JPA, Hibernate, Flyway
- **Database & Cache:** PostgreSQL (Relational Data), Redis (AI, Report, and Risk Score Caching)
- **AI Services:** Groq API (LLaMA-3.3-70b-versatile), HuggingFace Inference API (Embeddings)
- **Deployment:** Docker & Docker Compose

---

## Prerequisites

- Docker and Docker Compose installed
- A [Groq API Key](https://console.groq.com/keys)
- A [HuggingFace Access Token](https://huggingface.co/settings/tokens)

---

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd smart-hr-compliance
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=hrcompliance
   JWT_SECRET=your-super-secret-jwt-key-make-it-long
   JWT_EXPIRATION_MS=86400000
   HF_TOKEN=hf_your_huggingface_token
   GROQ_API_KEY=gsk_your_groq_api_key
   ```

3. **Build & Run with Docker:**
   ```bash
   docker-compose up --build
   ```

4. **Access Ports:**
   - **Frontend UI:** `http://localhost:3000` (or local Vite port e.g. `5173`)
   - **Backend API:** `http://localhost:8081`

---

## Demo Walkthrough

1. Navigate to the login page and register a new company Admin workspace.
2. The local database will automatically seed a test employee `employee@test.com` (password: `password123`) bound to this new company.
3. Log in as **Admin / HR**, go to **Policies**, create a policy, and click **Embed for AI** to index it.
4. Click **Summarize** on the policy card to view a 3-bullet AI summary.
5. Under the **Compliance** tab, click **Generate Risk Score** to view the company risk dashboard. Click **Refresh Analysis** to recalculate.
6. Open the **Audit Log** tab and click **Generate AI Report** to get a compliance health check. Click **Download as TXT** to export the log summary.
7. Log out, select the **Employee** login tab, and log in with `employee@test.com` / `password123`.
8. Go to the **Ask AI** page and ask follow-up questions to test the **Conversational Memory** assistant (e.g. "What is our remote work policy?" -> "Can I work 4 days from home?").
