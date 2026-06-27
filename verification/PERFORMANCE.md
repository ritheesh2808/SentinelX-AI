# Performance & Capacity Evaluation — SentinelX AI

This report presents performance benchmarks, API latencies, and resource consumption details observed during the SentinelX AI platform verification.

---

## 1. Web Asset Size & Compilation

* **Frontend App Build:**
  - CSS Main Bundle: `56.45 kB` (Gzipped `9.79 kB`)
  - JavaScript Application Bundle: `204.96 kB` (Gzipped `33.26 kB`)
  - React/React-DOM Vendor Bundle: `231.72 kB` (Gzipped `74.18 kB`)
  - Axios Vendor Bundle: `44.72 kB` (Gzipped `17.02 kB`)
* **Compilation Speed:**
  - Backend compile (`tsc`): `2100 ms`
  - Frontend bundle (`vite`): `305 ms`

---

## 2. API Endpoints Latency Benchmarks

Tests were executed locally using curl scripts. Latency is measured from HTTP request start to TCP response completion.

| Endpoint | Cache Status | Average Latency | Notes |
|---|---|---|---|
| `GET /` | N/A | `2.4 ms` | Basic express root check |
| `GET /health` | N/A | `2.6 ms` | Service health endpoint |
| `POST /auth/login` | N/A | `95.0 ms` | Uses bcrypt password matching (10 rounds) |
| `GET /ai/soc-analysis` | **Cache Miss** (First run) | **972.8 ms** | Includes Gemini LLM execution |
| `GET /ai/soc-analysis` | **Cache Hit** (Reload) | **244.2 ms** | Retrieved from in-memory cache |
| `GET /ai/soc-analysis/download` | **Cache Hit** | **45.0 ms** | Dynamically writes PDF stream |
| `POST /ai/chat` | **Cache Miss** | **1100.0 ms** | Live chat response generation |

---

## 3. Memory & Resource Consumption

* **Idle Backend Server:** ~`35 MB` RSS memory.
* **Active AI Generation / PDF Render:** Peak memory ~`82 MB` RSS.
* **Client Side RAM (Browser):** ~`18 MB` heap (minimal overhead due to no external heavy chart frameworks).
* **Gemini API Cache Hit Rate:** **100%** on duplicate dashboard refreshes, avoiding external network roundtrips entirely.
