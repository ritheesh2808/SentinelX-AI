# CHANGELOG — SentinelX AI RC-1 Audit

All notable changes made during this stabilization audit are logged below.

## [RC-1] — 2026-06-27

### Added
- Created `RegisterPage.tsx` interface component supporting user registration.
- Added `/register` Route in the frontend application router.
- Installed `vitest` in the backend devDependencies.
- Created `auth.service.test.ts` containing unit verification tests.

### Fixed
- Enforced a 15-minute Time-To-Live (TTL) cache eviction on `socAnalysisCache` in the SOC service layer.
- Namespaced API routers under `/api/v1` in `app.ts` and updated the frontend axios client to match.
