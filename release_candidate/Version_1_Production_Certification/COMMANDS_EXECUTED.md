# COMMANDS EXECUTED — SentinelX AI Version 1.0.0 Stable Certification

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
  `mkdir -p release_candidate/Version_1_Production_Certification/screenshots && cp verification/screenshots/* release_candidate/Version_1_Production_Certification/screenshots/`
