# REST API Audit & Response Registry — SentinelX AI

This register documents all API routes verified during the automated test cycles.

---

## 1. Authentication Endpoints

### `POST /auth/register`
- **Description:** Registers a new user organization.
- **Payload:** `{"email": "...", "password": "...", "name": "..."}`
- **Expected Response:** `201 Created` returning user object.

### `POST /auth/login`
- **Description:** Logs in an existing user.
- **Payload:** `{"email": "...", "password": "..."}`
- **Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "fullName": "...",
    "email": "..."
  }
}
```

---

## 2. AI Threat & Security Operations Center (SOC) Endpoints

### `GET /ai/health`
- **Description:** Basic endpoint to verify the AI route mounting.
- **Authorization:** None (Public)
- **Response:** `200 OK`
```json
{
  "status": "ok"
}
```

### `GET /ai/soc-analysis`
- **Description:** Pulls the complete security overview of the authenticated user's organization, correlating host/vulnerability states.
- **Authorization:** `Bearer <JWT_TOKEN>`
- **Response:** `200 OK`
```json
{
  "stats": {
    "totalAssets": 1,
    "totalPorts": 3,
    "totalVulnerabilities": 0
  },
  "report": {
    "executiveSummary": "...",
    "attackPathTimeline": [],
    "graphData": { "nodes": [], "edges": [] },
    "mitreMapping": [],
    "patchPrioritization": [],
    "incidentPlaybook": {}
  }
}
```

### `GET /ai/soc-analysis/download`
- **Description:** Compiles and streams a board-ready security report PDF.
- **Authorization:** `Bearer <JWT_TOKEN>`
- **Headers Returned:**
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="SentinelX_AI_Board_SOC_Report.pdf"`
- **Response:** `200 OK` (binary stream).

### `POST /ai/chat`
- **Description:** Chat interaction with the automated SOC analyst agent.
- **Authorization:** `Bearer <JWT_TOKEN>`
- **Payload:** `{"message": "What should I patch first?"}`
- **Response:** `200 OK`
```json
{
  "reply": "...",
  "history": [
    { "role": "user", "text": "..." },
    { "role": "assistant", "text": "..." }
  ]
}
```

### `POST /ai/chat/reset`
- **Description:** Purges the Gemini chatbot memory session.
- **Authorization:** `Bearer <JWT_TOKEN>`
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Chat context memory reset."
}
```
