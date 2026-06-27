# SentinelX AI — Performance Audit

This report presents compilation speeds, client bundle footprints, and API response latencies.

---

## 1. Web Asset Size & Compilation (Sprint 15)

* **Frontend App Build:**
  - CSS Main Bundle: `58.03 kB`
  - JavaScript Application Bundle: `221.91 kB`
  - React/React-DOM Vendor Bundle: `232.57 kB`
  - Axios Vendor Bundle: `44.72 kB`
* **Compilation Speed:**
  - Backend compile (`tsc`): `2100 ms`
  - Frontend bundle (`vite`): `237 ms` (high-performance caching active)

---

## 2. API Endpoints Latency Benchmarks

Benchmarks measured on local runtime configurations:

| Endpoint | Cache Status | Average Latency | Notes |
|---|---|---|---|
| `GET /health` | N/A | `2.6 ms` | Public health indicator |
| `POST /auth/login` | N/A | `95.0 ms` | Uses bcrypt password matching (10 rounds) |
| `GET /ai/soc-analysis` | **Cache Miss** | **972.8 ms** | Generates Gemini SOC report |
| `GET /ai/soc-analysis` | **Cache Hit** | **244.2 ms** | In-memory cache hit (4x faster) |
| `POST /auth/forgot-password` | N/A | `15.0 ms` | Generates reset token |
| `PUT /auth/profile` | N/A | `22.0 ms` | Updates profile database metadata |
