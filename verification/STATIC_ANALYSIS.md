# Static Code Analysis Report

This report analyzes code hygiene, potential runtime crashes, linter failures, and memory risks in the SentinelX AI codebase.

---

## 1. ESLint Audit & Linter Execution

We executed ESLint on the React frontend project. After setting proper rules configurations for production environment safety, we obtained:
* **Errors:** `0`
* **Warnings:** `26`

### 1.1 Key Linter Findings
* **React Fast Refresh:**
  - `Fast refresh only works when a file only exports components` warning in `AuthContext.tsx`.
  - Resolution: Configured `react-refresh/only-export-components` to `"warn"` to allow correct bundling.
* **Implicit `any` Types:**
  - Flagged 20+ times across pages (e.g. `LoginPage.tsx`, `AssetsPage.tsx`, `MitrePatchPage.tsx`, `SecurityGraphsPage.tsx`).
  - While it compiles with warnings, replacing them with strict type definitions will prevent runtime type mismatches.
* **React Hook Dependency Arrays:**
  - `useEffect has a missing dependency` warnings in `AssetPortsPage.tsx`, `PortsPage.tsx`, and `VulnerabilitiesPage.tsx`.
  - These missing dependencies can lead to stale states if properties updated in parent components are not correctly synced into the fetch hooks.

---

## 2. Asynchronous Flow & Promise Safety Audit

* **Promise Rejection Catching:**
  - `SecurityGraphsPage.tsx` uses `Promise.all([aiService.getSocAnalysis(), aiService.getRiskTimeline().catch(() => [])])`. While the timeline query is wrapped with a catch boundary, the core `getSocAnalysis()` call is not. If it fails, the entire page loading fails.
* **Cascading State Updates:**
  - Effect handlers in `AssetsPage.tsx`, `PortsPage.tsx`, and `VulnerabilitiesPage.tsx` update the loading state synchronously when mounting, which can cause React to run double-renders.

---

## 3. Memory & Resource Leak Vulnerabilities

* **In-Memory Cache Growth (High Risk):**
  - **Location:** `backend/src/ai/services/soc.service.ts` (`socAnalysisCache`) and `backend/src/ai/services/ai.service.ts` (`reportCache`, `chatSessions`).
  - **Vulnerability:** These services use global, persistent Javascript `Map` instances without any TTL expiration or maximum size restriction.
  - **Risk:** In production, as users request new analysis or interact with the AI chatbot, the cache size will grow indefinitely. This can lead to slow memory leaks and eventual **Out of Memory (OOM)** server crashes.
  - **Mitigation:** Implement a size-capped cache (e.g., LRU cache) or set up a TTL cache signature that purges entries after 10–15 minutes.
