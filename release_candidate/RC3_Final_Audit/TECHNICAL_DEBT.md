# TECHNICAL DEBT — SentinelX AI RC-3 Audit

This document registries technical debt backlog items for future sprints.

## Debt Items Registry

1. **Persistent Cache Infrastructure:**
   - **Context:** In-memory caching works for single-node setups.
   - **Recommendation:** Integrate Redis to allow horizontal scaling and persistent sessions.
2. **Centralized SIEM/Log Routing:**
   - **Context:** Logging is printed to stdout.
   - **Recommendation:** Pipe logs to syslog daemon or external SIEM providers.
3. **Advanced E2E UI Coverage:**
   - **Context:** Automated tests verify services and compilation.
   - **Recommendation:** Set up Playwright/Cypress for automated UI route regression testing.
