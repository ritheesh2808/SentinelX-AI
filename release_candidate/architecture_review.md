# SentinelX AI — Architecture Review

This report audits the system design, communication layers, and data-flow patterns of SentinelX AI.

---

## 1. System Topology

SentinelX AI consists of a React SPA frontend and a Node.js/Express backend, with PostgreSQL (Prisma ORM) serving as the database layer.

```
+-------------------------------------------------+
|               React SPA Frontend                |
+-------------------------------------------------+
                         |  (HTTPS REST & SSE)
                         v
+-------------------------------------------------+
|             Express.js API Backend              |
+-------------------------------------------------+
     |                     |               |
     v (Prisma)            v (Gemini)      v (Memory)
+------------+       +------------+   +------------+
| PostgreSQL |       | Gemini API |   | EventBus   |
+------------+       +------------+   +------------+
```

---

## 2. Design Pattern Audits

1. **Repository Pattern:**
   - Isolated database interactions inside designated repository files (e.g. `user.repository.ts`, `asset.repository.ts`, `scan.repository.ts`). Services request database queries strictly through these interfaces.
2. **Controller-Service Layering:**
   - Routes bind directly to controller methods. Controllers parse request body DTOs and handle HTTP responses. Business logic, input validation, password strength checks, and correlation rules are contained inside service files.
3. **Event-Driven Real-time Updates (Observer Pattern):**
   - Implemented an in-memory `EventBus` that handles pub/sub events. When a simulated scan progresses or vulnerabilities are discovered, events are piped directly through Server-Sent Events (SSE) connections to the client.

---

## 3. Architecture Gaps & Enhancements (Sprint 15)

* **Addressed:**
  - Integrated explicit TypeScript typings for new authentication paths and configuration settings.
  - Enabled profile settings layout page linking in the global `DashboardLayout.tsx` navigation tree.
* **Recommendations:**
  - Adopt a Redis cache cluster when running multiple node instances in production to replace in-memory cache limits.
  - Prefix API routes under a version namespace (`/api/v1/`).
