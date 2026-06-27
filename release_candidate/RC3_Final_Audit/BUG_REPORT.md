# BUG REPORT — SentinelX AI RC-3 Audit

This document lists resolved issues and bugs uncovered during the QA audit.

## Resolved Bugs

### Bug 001: Missing Operator Registration View
- **Component:** Frontend client
- **Severity:** High
- **Description:** No interface was present for new analysts to create an account, preventing the register API endpoint from being utilized.
- **Fix:** Implemented `RegisterPage.tsx` with validation checks.

### Bug 002: In-Memory SOC Cache Expiry Leak
- **Component:** Backend AI Service (`soc.service.ts`)
- **Severity:** High (Resource exhaustion)
- **Description:** Caches mapped data to `ownerId` keys indefinitely. Under high user count or repeated requests, memory footprint expanded unboundedly.
- **Fix:** Implemented Timed Cache Expiration (15 minutes TTL).

### Bug 003: Absence of API Versioning Namespace
- **Component:** Backend routing
- **Severity:** Moderate
- **Description:** Endpoints mapped directly under `/auth`, `/scans`, etc., complicating future schema upgrades.
- **Fix:** Namespaced all routes under `/api/v1/...`.

### Bug 004: SSE Connection End-point Mismatch
- **Component:** Frontend layout (`DashboardLayout.tsx`)
- **Severity:** High
- **Description:** SSE URL called `/ai/soc-events` instead of `/api/v1/ai/soc-events`, causing SSE connection failures after route namespacing.
- **Fix:** Corrected the path to `/api/v1/ai/soc-events`.
