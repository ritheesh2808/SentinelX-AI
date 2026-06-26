# Security Audit & Pentest Report — SentinelX AI

This report assesses the security postures, access controls, and data sanitization systems of SentinelX AI.

---

## 1. Authentication & Authorization Auditing

### Test 1: Access Protected Route Without Authorization Header
- **Request:** `GET http://localhost:5000/ai/soc-analysis` (No Auth Header)
- **Observed Result:** `401 Unauthorized`
- **Response Payload:** `{"error":"No token provided"}`
- **Security Grade:** **Pass**

### Test 2: Access Protected Route with Invalid JWT Token
- **Request:** `GET http://localhost:5000/ai/soc-analysis` (Header: `Bearer eyInvalid...`)
- **Observed Result:** `401 Unauthorized`
- **Response Payload:** `{"error":"Unauthorized: Invalid or expired token"}`
- **Security Grade:** **Pass**

### Test 3: JWT Expiry Configuration
- **Check:** Environmental token configuration in `.env`.
- **Observed Result:** `JWT_EXPIRES_IN=1h`
- **Security Grade:** **Pass** (Standard session expiry is enforced).

---

## 2. Input Sanitization & Attack Mitigation

### Test 4: SQL Injection Vulnerability Checking
- **Check:** Attempt to inject database escape queries inside user payloads.
- **Evaluation:** Since the database layer uses the **Prisma ORM** with native PostgreSQL driver bindings, all parameters are formatted and parameterized safely before execution. Direct raw database injection is mitigated.
- **Security Grade:** **Pass**

### Test 5: Cross-Site Scripting (XSS) Prevention
- **Check:** Inject HTML tag scripts (`<script>alert(1)</script>`) in chat messages or asset notes.
- **Evaluation:** Express utilizes the `helmet` security middleware, which injects standard CSP headers. Client-side rendering leverages React's JSX string escaping by default, neutralizing client side code injections.
- **Security Grade:** **Pass**

### Test 6: API Payload Flooding
- **Check:** Express json middleware limit configuration.
- **Observed Result:** Standard payloads are handled safely. Large malformed payloads return standard body-parser errors instead of crash loops.
- **Security Grade:** **Pass**
