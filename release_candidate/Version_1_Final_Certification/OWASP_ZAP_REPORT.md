# SentinelX AI — OWASP ZAP Security Scan Report

**Scan Date:** June 28, 2026  
**Tool:** OWASP ZAP Baseline Scan (Stable) via `ghcr.io/zaproxy/zaproxy:stable`  
**Target:** `https://sentinelx-ai-8rnk.onrender.com`  
**Exit Code:** 2 (alerts found — expected behaviour for findings below High threshold)  
**Report File:** `zap_report.html` (73 KB, saved in this directory)

---

## Alert Summary (From `zap_report.html` — Real ZAP Output)

| Risk Level | Count |
|---|---|
| **High** | **0** |
| **Medium** | **2** |
| **Low** | **6** |
| **Informational** | **5** |
| **False Positives** | 0 |

> [!NOTE]
> ZAP exit code 2 means "WARN-NEW alerts found below the threshold". No High or Critical alerts were present. This is expected behaviour for a baseline scan that finds only Low/Medium issues.

---

## Medium Severity Alerts

### 1. Content Security Policy (CSP) Header Not Set
- **Risk:** Medium
- **CWE:** 693 | **WASC:** 15 | **Plugin:** 10038
- **URL:** `https://sentinelx-ai-8rnk.onrender.com`
- **Method:** GET
- **Description:** The frontend does not declare a `Content-Security-Policy` HTTP header. Without CSP, browsers cannot restrict which resources (scripts, styles, frames) may be loaded, increasing the risk of XSS-based content injection.
- **Evidence:** Header absent from response — confirmed by ZAP passive scanner.
- **Remediation:** Add `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;` (or stricter) to the Render frontend service headers configuration.
- **Status:** ⚠️ OPEN — Planned for v1.1.0 remediation sprint.

### 2. Missing Anti-Clickjacking Header
- **Risk:** Medium
- **CWE:** 1021 | **WASC:** 15
- **URL:** `https://sentinelx-ai-8rnk.onrender.com`
- **Method:** GET
- **Description:** The frontend response does not include either `Content-Security-Policy: frame-ancestors` or `X-Frame-Options`. While the backend API (served through Express + Helmet) correctly returns `X-Frame-Options: SAMEORIGIN`, the Render-hosted static frontend does not forward this header.
- **Evidence:** ZAP passive scan — `X-Frame-Options` absent from frontend HTML response headers.
- **Remediation:** Configure Render platform-level response headers to include `X-Frame-Options: DENY` and add `frame-ancestors 'none'` to CSP when implemented.
- **Status:** ⚠️ OPEN — Planned for v1.1.0 remediation sprint.

---

## Low Severity Alerts (6)

| # | Alert | Affected URL | Notes |
|---|---|---|---|
| 1 | Cross-Origin-Embedder-Policy Header Missing or Invalid | Frontend | Static hosting doesn't add COEP by default. |
| 2 | Cross-Origin-Opener-Policy Header Missing or Invalid | Frontend | Present on backend; missing on static frontend. |
| 3 | Cross-Origin-Resource-Policy Header Missing or Invalid | Frontend | Present on backend; missing on static frontend. |
| 4 | Permissions-Policy Header Not Set | Frontend (5 instances) | No Feature-Policy/Permissions-Policy declared. |
| 5 | Private IP Disclosure | API response | An internal IP address was found in a response body (non-sensitive context). |
| 6 | Strict-Transport-Security Header Not Set | Frontend | HSTS missing on static frontend host; backend has `max-age=15552000; includeSubDomains`. |

---

## Informational Alerts (5)

| # | Alert | Notes |
|---|---|---|
| 1 | Information Disclosure — Suspicious Comments | HTML comments present in source; no sensitive data exposed. |
| 2 | Modern Web Application | ZAP detected this as a modern SPA — informational only. |
| 3 | Re-examine Cache-control Directives | Cache-control headers are present but ZAP recommends review. |
| 4 | Retrieved from Cache | ZAP received a cached response — normal CDN/cache behaviour. |
| 5 | Storable and Cacheable Content | Static assets are cacheable — intended behaviour. |

---

## Backend API Security Headers (Verified Separately)

The backend API at `https://sentinelx-ai-mymf.onrender.com` is protected by Express Helmet and returns the correct headers on **all API responses**:

| Header | Value | Status |
|---|---|---|
| `Strict-Transport-Security` | `max-age=15552000; includeSubDomains` | ✅ PASS |
| `X-Frame-Options` | `SAMEORIGIN` | ✅ PASS |
| `X-Content-Type-Options` | `nosniff` | ✅ PASS |
| `Referrer-Policy` | `no-referrer` | ✅ PASS |
| `Cross-Origin-Opener-Policy` | `same-origin` | ✅ PASS |
| `Cross-Origin-Resource-Policy` | `same-origin` | ✅ PASS |

---

## OWASP Top 10 Assessment

| OWASP Category | Status | Evidence |
|---|---|---|
| A01 Broken Access Control | ✅ PASS | JWT required on all API routes; missing/malformed token → 401. |
| A02 Cryptographic Failures | ✅ PASS | HTTPS enforced; HSTS active on backend; bcrypt password hashing. |
| A03 Injection (SQLi/XSS) | ✅ PASS | Prisma ORM parameterized queries; React DOM escaping. |
| A04 Insecure Design | ✅ PASS | Password strength rules enforced at API layer. |
| A05 Security Misconfiguration | ⚠️ PARTIAL | CSP and HSTS missing on static frontend host. |
| A06 Vulnerable Components | ✅ PASS | `npm audit` shows 0 high-severity vulnerabilities. |
| A07 Identification & Auth Failures | ✅ PASS | Duplicate registration blocked (409); rate limiting active. |
| A08 Software & Data Integrity Failures | ✅ PASS | No deserialization or integrity failures detected. |
| A09 Security Logging & Monitoring | ✅ PASS | Backend logs requests; health endpoint exposes uptime. |
| A10 Server-Side Request Forgery | ✅ PASS | No SSRF vectors found in scan. |

---

## Conclusion

**No Critical or High severity vulnerabilities** were found by OWASP ZAP or the supplementary programmatic scan. The 2 Medium findings relate to missing security headers on the **static frontend hosting** layer (Render CDN), not the application code. These are configuration-level issues that can be resolved without code changes by adding Render platform response headers.
