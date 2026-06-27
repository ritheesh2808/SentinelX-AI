# API REPORT — SentinelX AI RC-3 Audit

This document details all namespaced routes exposed under `/api/v1` namespace.

## API Endpoints Specification

### Authentication (`/api/v1/auth`)
- `POST /register`: Registers a new analyst operator.
- `POST /login`: Validates operator credentials and returns a JWT token.
- `POST /logout`: Invalidates the session.
- `GET /profile`: Retrieves the active analyst profile.
- `PUT /profile`: Updates profile details.
- `PUT /change-password`: Modifies account credentials.
- `DELETE /account`: Purges account data and logs.
- `POST /forgot-password`: Issues reset recovery tokens.
- `POST /reset-password`: Resets credentials using recovery token.

### Scans & Assets (`/api/v1/scans` & `/api/v1/assets`)
- `GET /assets`: Lists monitored security targets.
- `GET /scans`: Lists imported security scans.
- `POST /scans/import`: Parses and saves XML network scanner outputs.

### Threat Intelligence & AI (`/api/v1/ai`)
- `GET /ai/soc`: Generates dashboard analytics report.
- `POST /ai/chat`: Interactive incident response chat.
- `POST /ai/analyze-vulnerability`: Detailed explanation of a detected CVE.
- `GET /ai/soc-events`: SSE channel for real-time security alerts.
