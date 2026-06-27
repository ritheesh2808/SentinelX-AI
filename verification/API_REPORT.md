# REST API Audit & Response Registry — SentinelX AI

This report documents the full list of API endpoints, authentication mechanisms, request validation rules, and sample JSON schemas verified during the SentinelX AI QA Audit.

---

## 1. Authentication Endpoints

### `POST /auth/register`
* **Description:** Creates a new analyst profile.
* **Authentication:** Public (No token required).
* **Payload:**
```json
{
  "fullName": "QA Analyst",
  "email": "qa_analyst@sentinelx.ai",
  "password": "SecurePassword123!"
}
```
* **Success Response:** `201 Created`
```json
{
  "message": "User registered successfully"
}
```
* **Failure Responses:**
  - `400 Bad Request`: `{"error": "Missing required fields"}`
  - `409 Conflict`: `{"error": "Email already exists"}`

### `POST /auth/login`
* **Description:** Authenticates user credentials and generates a session JWT.
* **Authentication:** Public (No token required). Enforces auth-rate limiting.
* **Payload:**
```json
{
  "email": "qa_analyst@sentinelx.ai",
  "password": "SecurePassword123!"
}
```
* **Success Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "d730dd70-9d2a-4e72-a81b-b1960241890a",
    "fullName": "QA Analyst",
    "email": "qa_analyst@sentinelx.ai"
  }
}
```
* **Failure Responses:**
  - `401 Unauthorized`: `{"error": "Invalid email or password"}`

---

## 2. Asset & Scan Management

### `GET /assets`
* **Description:** Retrieves user's registered network assets.
* **Authentication:** `Bearer <JWT_TOKEN>`
* **Success Response:** `200 OK`
```json
{
  "assets": [
    {
      "id": "6bf3a04c-95e5-44c5-ae2b-c3cfe0ad640a",
      "hostname": "prod-api-server",
      "ipAddress": "10.0.1.15",
      "operatingSystem": "Ubuntu Linux 20.04",
      "assetType": "NETWORK",
      "criticality": "CRITICAL",
      "status": "ONLINE"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

### `POST /scans/import`
* **Description:** Imports Nmap scanner XML logs.
* **Authentication:** `Bearer <JWT_TOKEN>`
* **Payload:**
```json
{
  "filename": "scan.xml",
  "xmlContent": "<nmaprun scanner=\"nmap\" ...>...</nmaprun>"
}
```
* **Success Response:** `201 Created`
```json
{
  "id": "37ca9007-5696-4e02-9dd5-90fa3165bdee",
  "filename": "scan.xml",
  "scanner": "nmap (v7.80)",
  "status": "COMPLETED"
}
```

---

## 3. Threat Intelligence & AI Correlation

### `GET /ai/soc-analysis`
* **Description:** Dynamic, Gemini-powered vulnerability correlation, risk trend mapping, and containment playbook compiler. Leverages in-memory cache.
* **Authentication:** `Bearer <JWT_TOKEN>`
* **Success Response:** `200 OK`
```json
{
  "stats": {
    "totalAssets": 1,
    "totalPorts": 2,
    "totalVulnerabilities": 1,
    "criticalVulnerabilities": 1,
    "highVulnerabilities": 0
  },
  "report": {
    "riskScore": 95,
    "criticalFindings": ["SSH RCE CVE-2026-SSH-RCE found on prod-api-server"],
    "attackSurfaceSummary": "System exposes open SSH port 22 on Ubuntu Linux.",
    "attackPathTimeline": [
      {
        "stage": "Initial Access",
        "title": "Exploit OpenSSH RCE",
        "description": "Attacker targets integer overflow on SSH daemon.",
        "nodeId": "node-1"
      }
    ],
    "mitreMapping": [
      {
        "cveId": "CVE-2026-SSH-RCE",
        "vulnerabilityTitle": "OpenSSH Remote Code Execution",
        "tactic": "Initial Access",
        "technique": "Exploit Public-Facing Application (T1190)"
      }
    ],
    "patchPrioritization": [
      {
        "cveId": "CVE-2026-SSH-RCE",
        "priorityScore": 10,
        "patchEffort": "Low",
        "why": "High CVSS critical vulnerability allowing root hijack."
      }
    ],
    "incidentPlaybook": {
      "containmentPlan": ["Disable external SSH access"],
      "eradicationPlan": ["Upgrade OpenSSH to version 9.8p1 or newer"],
      "recoveryPlan": ["Audit user SSH authorization keys"],
      "lessonsLearned": ["Implement automated patching pipelines"]
    }
  }
}
```

### `GET /ai/soc-analysis/download`
* **Description:** Downloads dynamic SOC Audit Report as a PDF binary stream.
* **Authentication:** `Bearer <JWT_TOKEN>`
* **Headers:**
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="SentinelX_AI_Board_SOC_Report.pdf"`
* **Success Response:** `200 OK` (binary PDF payload)

### `POST /ai/chat`
* **Description:** Initiates dialogue context with the SOC Analyst Chatbot.
* **Authentication:** `Bearer <JWT_TOKEN>`
* **Payload:** `{"message": "What should I patch first?"}`
* **Success Response:** `200 OK`
```json
{
  "reply": "Based on correlation analysis, the OpenSSH Remote Code Execution (RCE) on 10.0.1.15 should be patched immediately.",
  "history": [
    { "role": "user", "text": "What should I patch first?" },
    { "role": "assistant", "text": "Based on correlation analysis, the OpenSSH Remote Code Execution (RCE)..." }
  ]
}
```

### `POST /ai/scans/run`
* **Description:** Initiates an asynchronous simulated network discovery scan.
* **Authentication:** `Bearer <JWT_TOKEN>`
* **Payload:** `{"target": "10.0.1.15"}`
* **Success Response:** `202 Accepted`
```json
{
  "message": "Scan simulation initiated.",
  "target": "10.0.1.15"
}
```

---

## 4. API Security & Rate-Limiting Auditing

1. **Global Request Rate Limiter:** Restricted to maximum `150` requests per 15-minute window per IP block (configured via `express-rate-limit` middleware in `app.ts`).
2. **Auth Endpoint Rate Limiter:** Restricted to maximum `15` requests per 15-minute window per IP targeting `/auth/*` paths to prevent brute-force credential stuffing.
3. **Authentication Scope Restriction:** Non-public endpoints require standard `Authorization: Bearer <JWT>` header signatures. Passing empty or malformed tokens is intercepted by `auth.middleware.ts`, returning `401 Unauthorized`.
