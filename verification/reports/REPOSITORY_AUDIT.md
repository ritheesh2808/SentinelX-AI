# SentinelX AI — Repository Audit Report

This report presents the configuration, structural auditing, and environment analysis of the **SentinelX AI** codebase.

---

## 1. Directory Structure

```
SentinelX-AI/
├── backend/                  # Node.js + Express API server
│   ├── prisma/               # Prisma Schema & Database Migrations
│   ├── src/                  # API Source code
│   │   ├── ai/               # AI Engine (Gemini, EventBus, SSE, PDF generation)
│   │   ├── assets/           # Asset Management module
│   │   ├── auth/             # User Management & JWT auth
│   │   ├── ports/            # Port mapping & risk calculation
│   │   └── server.ts         # Main Entrypoint
│   ├── package.json
│   └── tsconfig.json
├── database/                 # Empty folder (intended for local DB scripts)
├── docs/                     # Empty folder (intended for developer guides)
├── frontend/                 # React 19 SPA + Vite + Tailwind V4 client
│   ├── src/                  # Client Source code
│   │   ├── components/       # Layout structures & Route Protectors
│   │   ├── contexts/         # Authentication Context
│   │   ├── pages/            # Application dashboards, charts, and report interfaces
│   │   ├── services/         # API HTTP Client wrappers (axios-based)
│   │   └── main.tsx          # Client Entrypoint
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
├── scripts/                  # Empty folder
└── verification/             # QA, Security, Build outputs, and Reports
```

---

## 2. Dependency Audit & Package Analysis

### 2.1 Backend Dependencies (`backend/package.json`)
* **Node Environment:** CommonJS package type (`"type": "commonjs"`).
* **Express & Middleware:**
  - `express`: `^4.18.2` (Web framework)
  - `cors`: `^2.8.5` (Cross-origin sharing)
  - `helmet`: `^7.0.0` (Security headers configuration)
  - `express-rate-limit`: `^7.5.1` (Brute-force/DOS prevention)
* **Database & ORM:**
  - `prisma` / `@prisma/client`: `^7.8.0`
  - `@prisma/adapter-pg`: `^7.8.0`
  - `pg`: `^8.22.0` (Postgres driver)
* **Auth & Cryptography:**
  - `jsonwebtoken`: `^9.0.3` (JWT token signing/decoding)
  - `bcrypt`: `^6.0.0` (Password hashing)
* **AI & Document Generation:**
  - `@google/genai`: `^2.10.0` (Official Google GenAI SDK for Gemini)
  - `pdfkit`: `^0.19.1` (PDF document generator)
  - `fast-xml-parser`: `^5.9.3` (Parser for vulnerability scan uploads, e.g. Nmap XML)

### 2.2 Frontend Dependencies (`frontend/package.json`)
* **Vite & Client Framework:**
  - `vite`: `^8.1.0` (Build tool)
  - `react` / `react-dom`: `^19.2.7` (React 19 release)
  - `react-router-dom`: `^7.18.0` (Routing)
  - `tailwindcss` / `@tailwindcss/vite`: `^4.3.1` (Tailwind CSS v4 engine integration)
  - `axios`: `^1.18.1` (HTTP request client)

---

## 3. Configuration Profiles & Build Settings

### 3.1 Build Targets
* **Backend compilation:** TypeScript target `es2023`, module mapping `Node16`, compiled target emitted to `dist/`. Build command: `prisma generate && tsc -p tsconfig.json`.
* **Frontend compilation:** Vite compilation with React 19 plugins, splitting React dependencies and Axios into manual vendor chunks to optimize loading performance. Build command: `tsc -b && vite build`.

### 3.2 Environment Profile Analysis
* **Backend Environment (`backend/.env`):**
  - Configures `PORT=5000`
  - Connects to Neon PostgreSQL server via `DATABASE_URL`
  - Embeds `GEMINI_API_KEY` for AI functions.
  - Enforces `AI_PROVIDER=gemini` and `AI_MODEL=gemini-2.5-flash`.
* **Frontend Environment (`frontend/.env`):**
  - Specifies `VITE_API_BASE_URL=http://localhost:5000` to point to the Express backend.

---

## 4. Routing, Authentication & Security Architecture

* **Authentication:** Middleware verification maps incoming `Authorization: Bearer <JWT>` tokens to validate role structures (`ADMIN`, `ANALYST`, `VIEWER`). JWTs expire in 1 hour.
* **Rate Limits:**
  - Global limiter: Max 150 requests per 15-minute window per IP.
  - Auth limiter: Max 15 requests per 15-minute window per IP targeting `/auth` endpoints.
* **AI Integration:** Uses Gemini for vulnerability triage, correlation scoring, threat playbooks, and chatbot interface.
* **PDF Compiler:** Dynamically compiles threat lists and charts into a PDF download utilizing `pdfkit`, piping the output directly as binary data to prevent disk write latencies.
* **CI/CD:** No active github actions configured at the root repository. Vercel routes are configured for the frontend via `vercel.json` with static security headers configured.
