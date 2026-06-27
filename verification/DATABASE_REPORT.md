# SentinelX AI — Database Audit Report

This report presents a review of the SentinelX AI schema design, relational model structures, index coverage, transaction safety, migrations logs, and connection pooling settings.

---

## 1. Relational Entity Schema

SentinelX AI uses a structured PostgreSQL layout mapped by the **Prisma ORM** containing 11 models:

* **`User` (`users`):** Enforces email uniqueness. Linked to assets, incidents, logs, scans, and notifications.
* **`Asset` (`assets`):** Maps IP, hostname, criticality, environment, and status. Enforces a compound unique constraint `@@unique([hostname, ipAddress])`.
* **`Scan` (`scans`):** Maps imported scan filenames, scanner engines, args, and execution times.
* **`ScanHost` (`scan_hosts`):** Hosts discovered in a scan. Cascade-deletes when the parent scan record is deleted.
* **`Host` (`hosts`):** Asset correlation junction. Uniqueness constraint: `@@unique([scanId, ipAddress])`.
* **`Service` (`services`):** Port and protocol mappings. Uniqueness constraint: `@@unique([hostId, port, protocol])`.
* **`Vulnerability` (`vulnerabilities`):** Detailed CVE descriptions, scores, and remediations. Cascade-deletes when service is removed.
* **`Incident` (`incidents`):** Logs critical alerts and containment playbooks. SetNull behavior on linked assets or vulnerabilities keeps incidents records intact even if details are pruned.
* **`AuditLog` (`audit_logs`):** Immutable operational ledger tracking user actions and IP blocks.
* **`Port` (`ports`):** Detailed port mapping records parsed from XML scanner outputs.
* **`Notification` (`notifications`):** Live operator alert feeds.

---

## 2. Index Audit & Query Efficiency

The schema uses extensive index coverage on foreign keys and commonly filtered fields, preventing sequential table scans:

* **Asset:** `ownerId`, `assetType`, `status`
* **Scan:** `importedById`, `status`
* **ScanHost:** `scanId`, `assetId`, `ipAddress`
* **Host:** `assetId`, `scanId`, `ipAddress`
* **Service:** `hostId`, `name`
* **Vulnerability:** `serviceId`, `severity`, `status`, `cveId`
* **Incident:** `createdById`, `assetId`, `vulnerabilityId`, `severity`, `status`
* **AuditLog:** `userId`, `action`, `entityType/entityId`, `createdAt`
* **Port:** `scanHostId`, `portNumber`, `riskLevel`, `state`
* **Notification:** `userId`, `isRead`

---

## 3. Connection Pooling & Production Driver

* **Connection Pool Config (`backend/src/config/prisma.ts`):**
  - Uses the official `@prisma/adapter-pg` driver adapted to a node-postgres `Pool` instance.
  - Connection pool bounds:
    * `max: 10` connections per server instance.
    * `idleTimeoutMillis: 30000` (automatically reclaims idle connections after 30 seconds).
    * `connectionTimeoutMillis: 5000` (fails fast after 5 seconds if database socket acquisition times out).
  - Production SSL: Auto-negotiates SSL configuration with `rejectUnauthorized: false` for database instances hosted on Neon (`neon.tech`).

---

## 4. Migration History Audit

A total of 5 migration files are documented:
1. `20260625100757_init` — Baseline users and core tables.
2. `20260625110735_add_user_password` — Hashed passwords support.
3. `20260625121500_add_assets_fields` — Criticality levels and environment fields.
4. `20260625130210_add_ports` — Dynamic service port bindings.
5. `20260625131500_add_nmap_scans` — Scans, scan hosts, and Nmap parser relationships.
