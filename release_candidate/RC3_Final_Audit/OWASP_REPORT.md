# OWASP REPORT — SentinelX AI RC-3 Audit

This document aligns architectural checks against the OWASP Top 10 guidelines.

## OWASP Top 10 Mapping

### A01:2021-Broken Access Control
- JWT payload extracts authenticated `id` strictly, validation filters verify request scopes, and route bindings restrict direct resource reads.

### A02:2021-Cryptographic Failures
- Passwords are encrypted with standard Bcrypt algorithms using 10 rounds. Secure JWT signing prevents manipulation of user properties.

### A03:2021-Injection
- Parameterized database operations using Prisma Client prevent SQL injection.

### A04:2021-Insecure Design
- Multi-tier abstraction segregates Controllers, Services, and Repositories.

### A05:2021-Security Misconfiguration
- Cors restricts connections to origin domain lists, Helmet injects protective HTTP headers, and error details are suppressed in production.
