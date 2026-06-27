# DATABASE REPORT — SentinelX AI RC-2 Audit

This document examines the relational database mapping and constraints.

## Relational Schema Design

Prisma Client hooks into PostgreSQL using strict constraints and mappings:
1. **User Model:** Stores credentials, password hashes, reset tokens, and roles (`ADMIN`, `ANALYST`, `VIEWER`).
2. **Asset Model:** Maps system hostnames and IPs with owner constraints.
3. **Scan Model:** Tracks files imported by operators and parsed services.
4. **Vulnerability Model:** Stores detected security flaws, severity, CVSS scores, and references.
5. **Port Model:** Tracks exposed network ports and services.
6. **AuditLog Model:** Captures administrative transactions and security operations history.

## Performance & Optimization
- Indirection indexes are configured on target relation columns (`userId`, `assetId`, `severity`, etc.) to guarantee fast scans.
- Cascade deletes are implemented via transaction blocks during profile deletions to maintain absolute schema integrity.
