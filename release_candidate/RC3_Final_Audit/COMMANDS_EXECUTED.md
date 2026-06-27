# COMMANDS EXECUTED — SentinelX AI RC-3 Audit

This document catalogs commands run during validation and stabilization.

## Command Logs

- **Find existing source files:**
  `find src -maxdepth 3`
- **Frontend Build check:**
  `npm run build`
- **Backend Build check:**
  `npm run build`
- **Install Vitest dependency in backend:**
  `npm install -D vitest`
- **Run Backend Auth tests:**
  `npm run test`
- **Copy assets and screenshots:**
  `mkdir -p release_candidate/RC3_Final_Audit/screenshots && cp verification/screenshots/* release_candidate/RC3_Final_Audit/screenshots/`
