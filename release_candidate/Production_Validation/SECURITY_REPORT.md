# Security Audit & OWASP Top 10 Review — SentinelX AI

This report presents a security audit of the SentinelX AI live deployment against the OWASP Top 10 web application security risks.

---

## 1. OWASP Top 10 Assessment Matrix

| OWASP Risk Category | Vulnerability Rating | Live Site Mitigation & Findings |
|---|---|---|
| **A01:2021-Broken Access Control** | **Low Risk** | Protected routes redirect to `/login`. Local storage clear and direct URL blocks verified in Phase 10. |
| **A02:2021-Cryptographic Failures** | **Low Risk** | Data in transit uses HTTPS (TLS 1.3, managed via Cloudflare/Render). Bcrypt hashes password fields. |
| **A03:2021-Injection** | **Low Risk** | Prisma ORM parameterizes all PostgreSQL queries, blocking SQL Injection. Inputs are fuzzed and verified. |
| **A04:2021-Insecure Design** | **Low Risk** | Clean model structures; state variables are controlled; SSE token checks verify connections. |
| **A05:2021-Security Misconfiguration** | **Low Risk** | Express Helmet is configured, setting strict headers. CORS lists explicit domains and blocks wildcards. |
| **A06:2021-Vulnerable and Outdated Components** | **Moderate Risk**| Dependabot alert exists on default branch for 1 outdated dependency. Remediation recommended. |
| **A07:2021-Identification and Authentication Failures** | **Low Risk** | Strong password length validation implemented. Auth rate limit (100 req/15min) prevents brute-forcing. |
| **A08:2021-Software and Data Integrity Failures** | **Low Risk** | Build files are statically packed and cached. Environment variables keep keys out of the code repository. |
| **A09:2021-Security Logging and Monitoring Failures** | **Moderate Risk**| Backend prints logs to standard out (stdout/stderr) but lacks centralized log rotation or aggregation tools. |
| **A10:2021-Server-Side Request Forgery (SSRF)** | **Low Risk** | Scanner simulations do not fetch unverified user-supplied URLs. |

---

## 2. Key Security Enhancements Audited

### SQL Injection Protection
- **Check:** We injected `' OR '1'='1` in the login input fields to verify if the server would bypass login.
- **Outcome:** The database successfully treated the payload as literal search strings, rejected the login request, and redirected back to `/login` with 401.

### Cross-Site Scripting (XSS) Protection
- **Check:** We injected `<script>alert("xss")</script>@gmail.com` in input fields.
- **Outcome:** React client sanitizes outputs before rendering to DOM. The request was securely processed as raw string content.

### CORS Configuration
- **Check:** Reviewed `app.ts` origins.
- **Outcome:** CORS configuration only whitelists:
  - `http://localhost:5173`
  - `http://localhost:3000`
  - `https://sentinelx-ai-8rnk.onrender.com`
  - The dynamic environment variable `FRONTEND_URL`.
  Cross-origin requests from foreign domains are blocked.

### JWT Security Scoping
- **Check:** Checked localStorage wipe during logout and direct URL blocks.
- **Outcome:** LocalStorage tokens are extracted via headers:
  - Header Name: `Authorization: Bearer <token>`
  - Verification middleware parses the signature on every protected API call.
  - Wiping local storage immediately blocks subroute access.
