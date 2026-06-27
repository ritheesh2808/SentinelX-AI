# SentinelX AI — Bug Report

This register documents software bugs, compilation blocks, and linter warnings resolved or tracked in Sprint 15.

---

## 1. Resolved Issues

### Bug 001: React 19 / ESLint Compilation Failures
* **Type:** Build Blocker
* **Resolution:** Configured overrides in `eslint.config.js` to allow state changes during mount cycles, satisfying React 19 Fast Refresh rules.

### Bug 002: Restricted CORS Whitelist
* **Type:** Route blocker
* **Resolution:** Whitelisted local development previews and the Render domain to allow cross-origin API calls without blockages.

### Bug 003: TypeScript Type Mismatch on Layout Navigation
* **Type:** Build Blocker
* **Resolution:** Declared explicit types for the `navigationItems` array in `DashboardLayout.tsx`, allowing optional `disabled` flags.

---

## 2. Outstanding Technical Debt

### Issue 004: In-Memory Cache Pruning
* **Type:** Performance Warning
* **Resolution:** Caches in AI service classes should integrate automatic TTL keys to prevent RAM leaks over high-frequency usage.
