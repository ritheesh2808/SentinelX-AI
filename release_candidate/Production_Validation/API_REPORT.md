# API Verification & Endpoint Report — SentinelX AI

This report verifies all public and authenticated endpoints used by the SentinelX AI frontend.

---

## 1. API Route Registry & Live Verifications

### 1.1 Authentication & Profile Group (`/api/v1/auth/*`)
All routes in this group are rate-limited via `authLimiter` to a maximum of **100 requests per 15 minutes** per IP (increased from 15).

- **`POST /api/v1/auth/register`**
  - *Payload:* `{ fullName, email, password }`
  - *Status Codes:* `201 Created` (Success), `400 Bad Request` (Validation errors), `409 Conflict` (Duplicate email)
  - *Verification:* Verified via tests that short password returns `400`/client error, and duplicate email registration attempts trigger `409` correctly.

- **`POST /api/v1/auth/login`**
  - *Payload:* `{ email, password }`
  - *Status Codes:* `200 OK` (Returns `{ token, user }`), `401 Unauthorized` (Incorrect credentials), `400 Bad Request` (Validation errors)
  - *Verification:* Verified successfully on live deployment. SQLi fuzzer payloads `' OR '1'='1` were rejected with `401`.

- **`GET /api/v1/auth/profile`**
  - *Headers:* `Authorization: Bearer <JWT>`
  - *Status Codes:* `200 OK` (Returns user details), `401 Unauthorized` (Missing/invalid token)
  - *Verification:* Verified page-refresh session persistence using this endpoint.

- **`DELETE /api/v1/auth/account`**
  - *Headers:* `Authorization: Bearer <JWT>`
  - *Status Codes:* `200 OK` (Account deleted), `401 Unauthorized` (Auth failure)
  - *Verification:* Verified database cleanup step. Successfully purges the generated operator profile and all associated data.

---

### 1.2 Asset Inventory Group (`/api/v1/assets/*`)
- **`GET /api/v1/assets`**
  - *Headers:* `Authorization: Bearer <JWT>`
  - *Status Codes:* `200 OK` (Returns array of assets)
  - *Verification:* Verified loading page renders the asset list.

- **`POST /api/v1/assets`**
  - *Headers:* `Authorization: Bearer <JWT>`
  - *Payload:* `{ hostname, ipAddress, os, environment }`
  - *Status Codes:* `201 Created` (Success), `409 Conflict` (Duplicate asset info)
  - *Verification:* Verified creating a unique asset (e.g. `pat-host-*`) returns `201` and updates the UI grid.

---

### 1.3 System Scans Group (`/api/v1/scans/*`)
- **`GET /api/v1/scans`**
  - *Headers:* `Authorization: Bearer <JWT>`
  - *Status Codes:* `200 OK` (Returns list of scans)

- **`POST /api/v1/scans/run`**
  - *Headers:* `Authorization: Bearer <JWT>`
  - *Payload:* `{ targetIp }`
  - *Status Codes:* `202 Accepted` (Initiates scanner simulation)
  - *Verification:* Simulation begins async scanner event workers. Real-time updates push via SSE.

---

### 1.4 AI Analyst Group (`/api/v1/ai/*`)
- **`GET /api/v1/ai/soc-events`**
  - *Query Params:* `token` (JWT passed via query param for EventSource compatibility)
  - *Headers:* SSE `text/event-stream`
  - *Status Codes:* `200 OK`
  - *Verification:* Playwright successfully hooks onto the stream, verifying real-time scan progress updates.

- **`POST /api/v1/ai/chat`**
  - *Headers:* `Authorization: Bearer <JWT>`
  - *Payload:* `{ message, history }`
  - *Status Codes:* `200 OK` (Returns Gemini response stream)
  - *Verification:* Verified chat queries stream threat analysis correctly.

---

## 2. JWT Handling & Auth Security
1. **Signature Security:** JWT tokens use HS256 algorithm and are signed by the server's private `JWT_SECRET`.
2. **Access Control Verification:** 
   - Attempting to query `/api/v1/assets` or `/api/v1/scans` without the `Authorization` header returned a `401 Unauthorized` status code.
   - Cleared token simulation correctly redirects the client to `/login`.
