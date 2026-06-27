# SentinelX AI — Dependency Report

This report catalogs all dependencies and package engines used in the SentinelX AI platform.

---

## 1. Backend Server Dependencies (`backend/package.json`)

* **Google Gemini AI Client:** `@google/genai (^2.10.0)` — wraps generative model templates.
* **Prisma Database Client:** `@prisma/client (^7.8.0)`, `@prisma/adapter-pg (^7.8.0)` — ORM and adapter bindings.
* **Security Headers & CORS:** `helmet (^7.0.0)`, `cors (^2.8.5)` — secures HTTP communication.
* **brute-force rate limiting:** `express-rate-limit (^7.5.1)` — prevents credential stuffing.
* **Password Hashing:** `bcrypt (^6.0.0)` — securely salts passwords (10 rounds).
* **Token Handlers:** `jsonwebtoken (^9.0.3)` — generates authentication tokens.
* **XML Parser:** `fast-xml-parser (^5.9.3)` — parses uploaded scanner reports.

---

## 2. Frontend Client Dependencies (`frontend/package.json`)

* **React Core:** `react (^19.0.0)`, `react-dom (^19.0.0)` — core application library.
* **Routing:** `react-router-dom (^7.1.3)` — manages SPA route mappings.
* **HTTP Client:** `axios (^1.7.9)` — handles REST API communication.
* **Styling Framework:** `tailwindcss (^4.0.0)` — utility-first styling system.
* **Icons Package:** `lucide-react (^0.473.0)` — cyber-theme interface icons.
