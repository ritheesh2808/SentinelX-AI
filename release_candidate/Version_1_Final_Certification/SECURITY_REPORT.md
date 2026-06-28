# SentinelX AI — Security Report

**Audit Date:** June 28, 2026  
**Target:** `https://sentinelx-ai-mymf.onrender.com` (Backend API) and `https://sentinelx-ai-8rnk.onrender.com` (Frontend)

---

## 1. Security Architecture

SentinelX AI uses a layered security model:

| Layer | Implementation |
|---|---|
| **Transport** | TLS 1.3 (enforced by Render) |
| **Authentication** | JWT (HS256, 1-hour expiry) |
| **Authorization** | Server-side middleware (`authenticateToken`) |
| **Rate Limiting** | `express-rate-limit` (150 req / 15 min per IP) |
| **Input Validation** | Zod/custom validators on all auth endpoints |
| **Password Security** | bcrypt hashing; min 8 chars, uppercase + special char required |
| **Database Security** | Prisma ORM parameterized queries; Neon SSL-enforced connection |
| **HTTP Headers** | Helmet.js (all standard headers enabled) |
| **CORS** | Whitelist: `https://sentinelx-ai-8rnk.onrender.com` only |

---

## 2. HTTP Security Headers — Backend API

Live verified via `GET https://sentinelx-ai-mymf.onrender.com/health`:

| Header | Value | Coverage |
|---|---|---|
| `Strict-Transport-Security` | `max-age=15552000; includeSubDomains` | ✅ Forces HTTPS for 180 days |
| `X-Frame-Options` | `SAMEORIGIN` | ✅ Blocks iframe embedding |
| `X-Content-Type-Options` | `nosniff` | ✅ Prevents MIME sniffing |
| `Referrer-Policy` | `no-referrer` | ✅ No referrer data leaked |
| `X-XSS-Protection` | `0` | ✅ Modern browser standard |
| `Cross-Origin-Opener-Policy` | `same-origin` | ✅ Isolates browsing context |
| `Cross-Origin-Resource-Policy` | `same-origin` | ✅ Blocks cross-origin resource load |

---

## 3. HTTP Security Headers — Frontend Static Host

Live verified via `GET https://sentinelx-ai-8rnk.onrender.com` (Render static site):

| Header | Status | Notes |
|---|---|---|
| `Content-Security-Policy` | ⚠️ MISSING | **ZAP Medium Finding** — Render static host doesn't set CSP |
| `X-Frame-Options` | ⚠️ MISSING | **ZAP Medium Finding** — not forwarded from Render CDN |
| `Strict-Transport-Security` | ⚠️ MISSING | ZAP Low Finding — HTTPS enforced by Render but header absent |
| `Cross-Origin-Embedder-Policy` | ⚠️ MISSING | ZAP Low Finding |
| `Cross-Origin-Opener-Policy` | ⚠️ MISSING | ZAP Low Finding |
| `Permissions-Policy` | ⚠️ MISSING | ZAP Low Finding |

> [!IMPORTANT]
> These are **platform-level configuration gaps** on the Render static hosting CDN, not application code defects. They can be resolved by adding custom response headers in the Render dashboard or via `_headers` file without any code changes.

---

## 4. Authentication & Authorization

### JWT Audit
- **Algorithm:** HS256
- **Expiry:** 1 hour (confirmed by decoding live token: `exp - iat = 3600`)
- **Claims:** `{ id, iat, exp }` — minimal footprint, no sensitive data embedded
- **Storage:** `Authorization: Bearer` header — not stored in cookies

### Boundary Testing (Live)

| Scenario | Expected | Actual |
|---|---|---|
| Request with no JWT to `/api/v1/assets` | 401 | ✅ 401 |
| Request with malformed JWT | 401 | ✅ 401 |
| Request with valid JWT | 200 | ✅ 200 |

---

## 5. Injection Attack Resistance

### SQL Injection
- **Method:** Playwright E2E submitted `' OR '1'='1` as email in login form
- **Result:** Login failed, user remained on `/login` — no authorization bypass
- **Mechanism:** Prisma ORM translates all inputs to parameterized SQL `WHERE email = $1` bindings
- **Evidence:** `screenshots/security_sqli_protection.png`

### Cross-Site Scripting (XSS)
- **Method:** Playwright E2E submitted `<script>alert("xss")</script>@gmail.com` as email
- **Result:** Login failed, no script executed, user remained on `/login`
- **Mechanism:** React's Virtual DOM escapes all user-controlled strings before rendering
- **Evidence:** `screenshots/security_xss_protection.png`

---

## 6. CORS Policy

| Origin | Allowed |
|---|---|
| `https://sentinelx-ai-8rnk.onrender.com` | ✅ Yes — `Access-Control-Allow-Origin` returned, `credentials: true` |
| `https://malicious-attacker.com` | ❌ No — header not returned, requests blocked |
| Any other origin | ❌ No |

---

## 7. Rate Limiting

- **Limit:** 150 requests per 15-minute window per IP
- **Headers returned:** `ratelimit-limit`, `ratelimit-remaining`, `ratelimit-reset`
- **On breach:** `429 Too Many Requests`
- **Scope:** Applied globally to all API routes

---

## 8. Password Security Policy

Enforced at the API layer (not just frontend):

| Rule | Minimum |
|---|---|
| Length | 8 characters |
| Uppercase | At least 1 required |
| Special character | At least 1 required |
| Hash algorithm | bcrypt |

Weak passwords are rejected with `400 Bad Request` before any database operation.

---

## 9. Sensitive Data Exposure

| Check | Result |
|---|---|
| Stack traces in API error responses | ✅ NONE — generic `{ "error": "..." }` format |
| Database errors leaked to client | ✅ NONE |
| JWT secret exposed | ✅ NONE — injected via Render environment variable |
| Internal IP in responses | ⚠️ ZAP Low Finding — one internal IP found in a response body (non-sensitive, non-exploitable context) |
| `.env` in git history | ✅ NONE confirmed |

---

## 10. Security Findings Summary

| Severity | Count | Blocking Release? |
|---|---|---|
| Critical | 0 | N/A |
| High | 0 | N/A |
| Medium | 2 | **No** — accepted, tracked in v1.1.0 backlog |
| Low | 7 | No |
| Informational | 5 | No |
