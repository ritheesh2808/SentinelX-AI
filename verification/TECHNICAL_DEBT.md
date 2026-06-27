# SentinelX AI — Technical Debt Backlog

This report lists the technical debt, dependency alerts, architectural shortcomings, and test gaps identified in the SentinelX AI codebase.

---

## 1. Test Coverage Gaps (Critical Debt)

* **No Automated Test Suites:**
  - The project does not contain any unit tests (`Jest`/`Vitest`), integration tests, or end-to-end browser tests (`Playwright`/`Cypress`).
  - All QA and validation operations currently rely on manual browser checks and curl requests.
  - Refactoring or introducing new features runs a high risk of regression.

---

## 2. Architectural & API Design Debt

* **API Versioning Absence:**
  - Route handlers are mounted directly under `/auth`, `/assets`, `/scans`, etc., rather than being versioned under `/api/v1/...`.
  - Upgrading API endpoints or introducing breaking changes in the future will require modifications in both client and server layouts without deprecation pathways.
* **Lack of Request Validators:**
  - Incoming payloads are cast directly using DTO types without runtime assertion schemas (like `Zod` or `Joi`). Invalid JSON keys or payloads must be caught by service database integrity exceptions rather than being intercepted at the router entrance.
* **Ephemeral Cache Storage:**
  - Session maps and dashboard reports cache directly in Node.js server RAM. Restarting or scale-scaling backend server instances deletes all cache records, triggering a surge of Gemini API calls.

---

## 3. Repository and File Hygiene

* **Empty Folders:**
  - Empty directories `docs/`, `database/`, and `scripts/` are checked into the repository.
* **Outdated/Vulnerable Dependencies:**
  - Run auditing flags minor vulnerabilities inside deep-level dependencies.
