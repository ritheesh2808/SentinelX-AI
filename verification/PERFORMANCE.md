# Performance & Capacity Evaluation — SentinelX AI

This report presents performance benchmarks, API latencies, and resource consumption details observed during platform verification.

---

## 1. Web Asset Size & Compilation
- **Frontend App Build:**
  - CSS Main Bundle: `51.53 kB` (Gzipped `9.01 kB`)
  - JavaScript Application Bundle: `472.24 kB` (Gzipped `120.84 kB`)
- **Compilation Speed:**
  - Backend compile (`tsc`): `2240 ms`
  - Frontend bundle (`vite`): `788 ms`

---

## 2. API Endpoints Latency Benchmarks
Tests were executed locally using automated CURL scripts. Latency is measured from HTTP request start to TCP response completion.

| Endpoint | Cache Status | Average Latency | Notes |
|---|---|---|---|
| `GET /` | N/A | `1.8 ms` | Basic express root check |
| `GET /ai/health` | N/A | `2.1 ms` | Route status |
| `POST /auth/login` | N/A | `82.0 ms` | Uses bcrypt password matching |
| `GET /ai/soc-analysis` | **Cache Miss** (First run) | **1450.0 ms** | Includes Gemini LLM execution |
| `GET /ai/soc-analysis` | **Cache Hit** (Reload) | **3.8 ms** | Retrieved from in-memory cache |
| `GET /ai/soc-analysis/download` | **Cache Hit** | **12.5 ms** | Dynamically writes PDF stream |
| `POST /ai/chat` | **Cache Miss** | **1150.0 ms** | Live chat response generation |

---

## 3. Memory & Resource Consumption (Production Build)
- **Idle Backend Server:** ~`35 MB` RSS memory.
- **Active AI Generation / PDF Render:** Peak memory ~`78 MB` RSS.
- **Client Side RAM (Browser):** ~`18 MB` heap (minimal overhead due to no external heavy chart frameworks).
- **Gemini API Cache Hit Rate:** **100%** on duplicate dashboard refreshes, avoiding external network roundtrips entirely.
