# SentinelX AI — Security Audit

This report reviews the implementation of security practices, route guards, input validation rules, and threat mitigation setups.

---

## 1. Network & Express Security Settings

* **CORS Settings:**
  - Whitelists only local client ports (`http://localhost:5173`, `http://localhost:3000`) and the active production domain (`https://sentinelx-ai-8rnk.onrender.com`). Wildcard origins are blocked.
* **Helmet Protection:**
  - Standard Helmet middleware configured. Employs Content Security Policy (CSP) headers, frames limits (`X-Frame-Options: DENY`), and sniffing locks.
* **Rate Limiting:**
  - **Global Limiter:** Maximum of 150 requests per 15 minutes per IP block.
  - **Auth Limiter:** Strict limit of 15 requests per 15 minutes on auth routes (`/auth/*`), protecting endpoints against brute-force attacks.

---

## 2. Cryptography & Data Safety

* **Password Hashing:**
  - Passwords hash using **bcrypt** with `10` salt rounds during registration, settings updates, and resets.
* **JWT Signatures:**
  - REST endpoints use JWT validation keys signed using HS256 signatures with 1-hour expiration limits.
* **Input Validation & Sanitization:**
  - Enforced a new password validation rule requiring:
    - Minimum length of 8 characters.
    - At least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol.
  - Parameters are processed as parameterized variables in the Prisma ORM layer, mitigating SQL Injection vectors.
