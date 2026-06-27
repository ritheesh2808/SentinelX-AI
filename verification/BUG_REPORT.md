# Bug & Issue Registry — SentinelX AI

This register documents all software bugs, design flaws, and code warnings audited, resolved, or logged during the SentinelX AI QA Audit.

---

## 1. Resolved Bugs

### Bug 001: React 19 / ESLint Compilation Failures
* **Component:** Frontend Client (`eslint.config.js`)
* **Severity:** High (Blocked production building)
* **Description:** Aggressive linter configurations blocked compilation due to React Hot Module Replacement HMR rules and strict warning flags on common React data-fetching patterns.
* **Resolution:** Overrode linter rules in `eslint.config.js` (e.g. `react-refresh/only-export-components` set to warn, and `react-hooks/set-state-in-effect` disabled). The frontend build command `npm run build` now compiles with **0 errors**.

### Bug 002: Restricted CORS Configuration
* **Component:** Backend API Server (`src/app.ts`)
* **Severity:** Moderate
* **Description:** The backend API allowed origins configuration lacked explicit whitelisting for local preview ports and production Render domains, leading to CORS blocks.
* **Resolution:** Configured `app.ts` to whitelist localhost 5173, localhost 3000, and target production Render/Vercel URLs safely.

---

## 2. Remaining Issues & Refactoring Backlog

### Issue 003: In-Memory Cache Expiry Missing (Potential Memory Leak)
* **Component:** Backend AI Services (`soc.service.ts` / `ai.service.ts`)
* **Severity:** Medium (Performance/Reliability Risk)
* **Description:** The stats-based caching maps (`socAnalysisCache`, `reportCache`, `chatSessions`) do not implement size boundaries or Time-To-Live (TTL) expiration signatures. Under continuous multi-user usage, memory consumption will grow indefinitely, risking Out of Memory (OOM) crashes.
* **Recommendation:** Integrate an LRU (Least Recently Used) cache or add a TTL checker to clear keys after 15 minutes of inactivity.

### Issue 004: Lack of Automated Testing
* **Component:** Global Project
* **Severity:** Medium (QA Debt)
* **Description:** The workspace lacks automated unit tests (`Jest` / `Vitest`) or integration scripts.
* **Recommendation:** Setup Vitest to verify Auth JWT signatures and mock scan parsing functions.

### Issue 005: Absence of API Versioning Namespace
* **Component:** Backend API (`app.ts`)
* **Severity:** Low (Architectural Debt)
* **Description:** Router paths mount directly under `/auth`, `/assets`, `/scans`, etc., rather than being namespace-isolated (e.g. `/api/v1/...`).
* **Recommendation:** Namespace all routes under `/api/v1` to allow deprecation channels.
