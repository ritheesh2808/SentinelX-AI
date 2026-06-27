# Architecture & Technical Audit Summary — SentinelX AI

This document provides a comprehensive structural audit of the SentinelX AI platform. It highlights design patterns, data flow, component layout, and structural grade ratings.

---

## 1. Directory Structure

```
SentinelX-AI/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma           # Prisma DB schema definitions
│   └── src/
│       ├── app.ts                  # Express App configuration
│       ├── server.ts               # Listen port execution wrapper
│       ├── auth/                   # Authentication controller, route, and middleware
│       ├── assets/                 # Asset models, repositories, and routes
│       ├── scans/                  # XML parser and Scan registries
│       ├── ports/                  # Opened Port and risk definitions
│       ├── vulnerabilities/        # Vulnerability registers
│       └── ai/                     # AI Engine & Real-Time Event System
│           ├── controllers/        # AI endpoint handlers
│           ├── repositories/       # Context aggregation repositories
│           ├── routes/             # Path routing declarations
│           └── services/           # Gemini client, SSE channels, IncidentEngine, and PDF builders
└── frontend/
    └── src/
        ├── layouts/
        │   └── DashboardLayout.tsx # Sidebar layout configuration & SSE subscription
        ├── services/
        │   ├── api.ts              # Global Axios base setup
        │   └── aiService.ts        # AI API binding methods
        ├── types/
        │   └── ai.ts               # Core model interfaces
        └── pages/
            ├── auth/               # Access authentication UI
            ├── dashboard/          # Assets, Scans, and Port management UI
            └── ai/                 # Cyber SOC interfaces
                ├── ExecutiveReportPage.tsx
                ├── SecurityGraphsPage.tsx
                ├── MitrePatchPage.tsx
                ├── IncidentResponsePage.tsx
                └── ChatPage.tsx
```

---

## 2. Technical System Architecture

SentinelX AI incorporates a modern layered architecture structured with clear separation of concerns:

1. **Frontend Presentation:** React SPA using Tailwind CSS v4. Page routing maps path contexts into view dashboards. Layouts manage real-time feeds using standard HTML5 `EventSource` listening.
2. **REST API Interface:** Express router intercepts HTTP endpoints, validates JWT authorization tokens, and redirects targets to the controller layer.
3. **Controller Layer:** Express controllers read query parameters, pass IDs to underlying services, and format JSON/PDF binary responses.
4. **Service Layer:** Service classes isolate business workflows. E.g., `SocService` handles attack-surface profiling, `ScanSimulationService` drives mock scan state loops, and `IncidentEngineService` evaluates vulnerabilities for automated critical incident escalations.
5. **Repository Layer:** Abstract database query operations from business logic. Direct database queries leverage the Prisma ORM.

---

## 3. Core Architectural Patterns

* **Repository Pattern:** Separates database interactions from business services. `ai.repository.ts` consolidates user context statistics across hosts, ports, vulnerabilities, and scans safely.
* **Controller-Service Separation:** Business rules, prompt templates, and PDF compilation are cleanly isolated in Service modules rather than being mixed inside router paths or controllers.
* **Real-Time Event Architecture (EventBus & SSE):**
  - **`event-bus.service.ts`:** An in-memory observer pattern EventBus allowing services to publish system events (e.g. `scan:progress`, `vulnerability:discovered`, `incident:created`).
  - **SSE Controller Route (`/ai/soc-events`):** Subscribes HTTP socket lines to the EventBus, piping structured text event streams directly to the frontend client to update state graphs and display toasted notifications without polling.
* **In-Memory Caching:** Due to rate limiting on the Gemini API, `SocService` incorporates stats-based signature caching. If assets/vulnerability states do not change, consecutive requests retrieve responses in milliseconds without querying Gemini.
* **Custom SVG Visualizer:** Bypasses third-party charting conflicts in React 19 by dynamically rendering network graphs, attack paths, and trend indicators as native SVG paths.
