# Bug & Issue Registry — SentinelX AI

This register documents all software issues, design flaws, and static code warnings discovered during the SentinelX AI QA Audit.

---

## 1. Discovered and Mitigated Bugs

### Bug 001: Gemini API Rate Limiting (503 Service Unavailable)
- **Component:** Backend AI Services (`soc.service.ts`, `ai.service.ts`)
- **Severity:** Critical
- **Symptoms:** Under rapid UI page navigation or dashboard reloading, concurrent requests to the Gemini API returned `503 Service Unavailable` due to rate quotas.
- **Resolution:** Implemented an in-memory cache inside the backend services. The signature key is generated dynamically from the user's asset counts, port states, and vulnerability records. Subsequent dashboard or report loads retrieve the cached correlation context instantly, completely bypassing rate limits.

### Bug 002: React 19 Dependency Conflict for Chart/Graph Libraries
- **Component:** Frontend Dashboards (`SecurityGraphsPage.tsx`, `ExecutiveReportPage.tsx`)
- **Severity:** High
- **Symptoms:** Standard charting packages (Recharts, React Flow) have unresolved dependency issues with React 19, causing client build errors or runtime failures.
- **Resolution:** Replaced third-party visualization components with pure custom SVG engines. Network topologies, attack timelines, and gauge dials are compiled directly using HTML5/SVG, eliminating library bloat and compatibility errors.

---

## 2. Static Analysis & Lint Warnings (Unresolved)

### Issue 003: Explicit `any` Types
- **Location:** Multiple files inside `frontend/src`
- **Severity:** Low (Code Quality)
- **Status:** Logged for refactoring.
- **Details:** The TypeScript compiler in the frontend is configured with relaxed `any` type auditing. 30 instances of implicit or explicit `any` tags are flagged in the ESLint audit report.

### Issue 004: Cascading Renders / `setState` in Effects
- **Location:** `AssetsPage.tsx`, `PortsPage.tsx`, `VulnerabilitiesPage.tsx`
- **Severity:** Moderate
- **Status:** Logged for refactoring.
- **Details:** Synchronous calls to load services occur inside `useEffect` bodies without correct callback memoization. This can trigger unnecessary double-renders during component mounting.
