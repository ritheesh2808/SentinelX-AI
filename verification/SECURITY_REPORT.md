# SentinelX AI — Security Audit & Penetest Report

This report presents a security assessment of the SentinelX AI codebase, examining authentication checks, data access scopes (IDOR), input sanitization, encryption algorithms, CORS policies, rate limiting, and HTTP response headers.

---

## 1. Authentication & Session Management

* **JWT Verification:**
  - Non-public routes are wrapped in an `authenticate` middleware (`auth.middleware.ts`) that extracts and validates the `Authorization: Bearer <token>` header.
  - JWT generation uses the HS256 algorithm with expiration signatures configured in environmental configurations (`JWT_EXPIRES_IN=1h`).
  - Missing, expired, or malformed tokens return a strict `401 Unauthorized` response with clear client-facing error structures.
* **Brute-Force & Credential Stuffing Prevention:**
  - The login router is restricted by an `authLimiter` middleware, capping credential validation attempts to a maximum of `15` requests per 15-minute window per IP block.
  - Grade: **PASS**

---

## 2. Access Controls & IDOR Auditing

* **Resource Scoping (Broken Access Control Prevention):**
  - Database queries are scoped strictly by matching resource identifiers against user contexts (`ownerId` / `importedById` extracted from JWTs).
  - Example: `prisma.asset.findFirst({ where: { id, ownerId } })` ensures that arbitrary asset requests return `404 Not Found` if they belong to another user context.
  - Scans, scan hosts, ports, and vulnerabilities are validated against the importing user identifier in all repository transactions.
  - Grade: **PASS**

---

## 3. Data Sanitization & Code Injection Mitigations

* **SQL Injection (SQLi):**
  - All database queries run through the **Prisma ORM**, which parametrizes query arguments natively. User inputs are formatted as bound parameters before database parser execution, neutralizing SQL injections.
  - Grade: **PASS**
* **Cross-Site Scripting (XSS):**
  - Client interface parses dynamically returned properties inside React JSX structures, which escapes strings by default.
  - Helmet middleware applies security headers on Express endpoints to restrict frame-jacking and script reflection.
  - Grade: **PASS**

---

## 4. Environment Variables & Secret Safety

* **Credential Hardcoding:**
  - Secrets like `DATABASE_URL`, `JWT_SECRET`, and `GEMINI_API_KEY` are not committed to code; they load dynamically from the server environment (`.env`).
* **CORS Settings:**
  - The API server maps `cors` headers to whitelist only `http://localhost:5173`, `http://localhost:3000`, `https://sentinelx-ai-8rnk.onrender.com`, and the optional environment value `FRONTEND_URL`. Requests with wildcard headers are rejected.
  - Grade: **PASS**
