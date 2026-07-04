# Smart HR Compliance System

A modern, full-stack HR Compliance and Onboarding platform built with React, Spring Boot, PostgreSQL, and AI. This platform helps companies manage employee onboarding, document verification, policy distribution, and compliance auditing in a centralized and secure way.

## Features

- **Role-Based Access Control:** Separate dashboards for Admins/HR and Employees.
- **Onboarding Workflows:** Assign tasks, track progress, and collect legally required documents (like I-9 verification).
- **Policy Management:** Create and distribute company policies (Remote Work, PTO, Anti-Harassment) with strict versioning.
- **AI Policy Assistant:** Integrated RAG (Retrieval-Augmented Generation) using Groq AI and HuggingFace embeddings. Employees can ask an AI chatbot questions about company policies and get instant, accurate answers directly sourced from official documents.
- **Immutable Audit Log:** Automatically tracks every compliance action (creating policies, completing tasks, acknowledging documents) for legal and SOC2/ISO compliance auditing.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Vanilla CSS
- **Backend:** Spring Boot (Java 17), Spring Security (JWT), Spring Data JPA, Flyway
- **Database:** PostgreSQL (Relational Data), Redis (AI Caching)
- **AI Integration:** Groq API (LLM generation), HuggingFace Inference API (Text Embeddings)
- **Deployment:** Docker & Docker Compose

## Prerequisites

- Docker and Docker Compose installed
- A [Groq API Key](https://console.groq.com/keys)
- A [HuggingFace Access Token](https://huggingface.co/settings/tokens)

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd smart-hr-compliance
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your security keys:
   ```env
   DB_USER=postgres
   DB_PASSWORD=root123
   DB_NAME=hrcompliance
   JWT_SECRET=your-super-secret-jwt-key-make-it-long
   JWT_EXPIRATION_MS=86400000
   HF_TOKEN=hf_your_huggingface_token
   GROQ_API_KEY=gsk_your_groq_api_key
   ```

3. **Run with Docker:**
   Start the entire application stack (Frontend, Backend, PostgreSQL, and Redis) with a single command:
   ```bash
   docker-compose up --build
   ```

4. **Access the Application:**
   - **Frontend UI:** `http://localhost:3000`
   - **Backend API:** `http://localhost:8081`

## Demo Walkthrough

1. Go to `http://localhost:3000` and click "Register here".
2. Create your company's Admin account.
3. On the **Policies** tab, create a new policy and click **🤖 Embed for AI** to inject it into the AI Vector database.
4. On the **Onboarding** tab, assign tasks to your employees.
5. Check the **Audit Log** to see immutable compliance records of your actions.
6. Log in as an Employee to complete tasks, upload documents, and ask the AI Policy Assistant questions!