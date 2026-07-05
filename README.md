# Smart HR Compliance System

A modern, full-stack HR Compliance and Onboarding multi-tenant SaaS platform built with React, Spring Boot, PostgreSQL, Redis, and AI. This platform helps companies manage employee onboarding, document verification, policy distribution, and compliance auditing in a centralized and secure way.

---

## Key Features

- **Multi-Tenant Architecture:** Shared database design where every tenant-scoped table is discriminated by a `company_id` column, automatically filtered via Hibernate filter annotations.
- **Invite-Based Self-Registration:** HR and Admins can generate secure invite links (48-hour TTL) allowing new employees to self-register into their company's workspace.
- **Policy Management:** Create and distribute company policies (Remote Work, PTO, Anti-Harassment) with strict versioning.
- **AI Policy Assistant (RAG Chat):** Integrated chatbot using Groq AI and HuggingFace embeddings. Employees can query the chatbot for instant answers sourced from vector-embedded policies.
- **AI Policy Summarizer:** Instantly generate a 3-bullet, 20-word summary of complex company policies, cached in Redis for 60 minutes.
- **AI Compliance Report Generator:** Automatically summarize the company's chronological audit trail to assess compliance status and risks, cached in Redis for 30 minutes and downloadable as a `.txt` file.
- **Immutable Audit Log:** Automatically records all compliance actions (policy creation, acceptance, document uploads) for SOC2/ISO audit trails.

---

## Tech Stack

- **Frontend:** React (Vite), TypeScript, Lucide Icons, Vanilla CSS
- **Backend:** Spring Boot 3.5, Spring Security (JWT), Spring Data JPA, Hibernate, Flyway
- **Database & Cache:** PostgreSQL (Relational Data), Redis (AI and Report Caching)
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
   DB_PASSWORD=root123
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
   - **Frontend UI:** `http://localhost:3000`
   - **Backend API:** `http://localhost:8081`

---

## Demo Walkthrough

1. Navigate to `http://localhost:3000` and register a new company workspace.
2. Under the **Onboarding** tab, enter an employee's email to generate a secure invite link, then copy it.
3. Open the invite link in an incognito window to complete self-registration.
4. Log back in as Admin, create a policy in the **Policies** tab, and click **Embed for AI** to register it for the chatbot.
5. Try clicking **Summarize** on any policy to view a 3-bullet summary instantly.
6. Open the **Audit Log** tab and click **Generate AI Report** to get a compliance health check. Click **Download as TXT** to export the results.