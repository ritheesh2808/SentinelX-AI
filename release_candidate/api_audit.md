# SentinelX AI — API Audit

This report maps the endpoints of the SentinelX AI backend, detailing authorization bounds and validation schemas.

---

## 1. Authentication Endpoints

### `POST /auth/register`
* **Access:** Public
* **Payload:** `{ "fullName": "name", "email": "email", "password": "password" }`
* **Validation:** Enforces email regex and password complexity requirements.

### `POST /auth/login`
* **Access:** Public (Rate-limited: 15 attempts/15m)
* **Payload:** `{ "email": "email", "password": "password" }`

### `POST /auth/forgot-password`
* **Access:** Public
* **Payload:** `{ "email": "email" }`
* **Response:** Returns JSON with `resetToken` for recovery simulation.

### `POST /auth/reset-password`
* **Access:** Public
* **Payload:** `{ "token": "token", "newPassword": "password" }`

### `PUT /auth/change-password`
* **Access:** Authenticated (`Bearer <JWT>`)
* **Payload:** `{ "currentPassword": "password", "newPassword": "password" }`

### `PUT /auth/profile`
* **Access:** Authenticated (`Bearer <JWT>`)
* **Payload:** `{ "fullName": "name", "email": "email" }`

### `DELETE /auth/account`
* **Access:** Authenticated (`Bearer <JWT>`)
* **Operation:** Purges user account and cascade-removes assets, scans, incidents, audit logs, and notifications.

---

## 2. Resource Management & AI Endpoints

* **`GET /assets`** / **`POST /assets`**: Scoped by user authorization IDs.
* **`POST /scans/import`**: Accepts XML logs, parses nmap runs, and updates relational tables.
* **`GET /ai/soc-analysis`**: Generates correlation matrices, mitigation timelines, and incident response playbooks.
