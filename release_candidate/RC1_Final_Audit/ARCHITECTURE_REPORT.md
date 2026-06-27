# ARCHITECTURE REPORT — SentinelX AI RC-1 Audit

This document describes the design patterns and architectural layers of SentinelX AI.

## Architectural Layers

```
[ Frontend Client ] --> [ API Route Namespace /api/v1 ]
                             |
                    [ Controller Layer ]
                             |
                     [ Service Layer ] <--> [ Gemini / LLM Provider ]
                             |
                    [ Repository Layer ]
                             |
                   [ Prisma ORM Client ]
                             |
                 [ PostgreSQL Database ]
```

- **Separation of Concerns:** Controllers manage payload parsing and HTTP statuses, services implement business rules, and repositories isolate query constructs.
- **Dependency Inversion:** Interfaces decouple AI orchestration from specific model providers (e.g. Gemini Provider).
- **Backwards Compatibility:** Namespaced API routes ensure updates can occur without disrupting clients.
