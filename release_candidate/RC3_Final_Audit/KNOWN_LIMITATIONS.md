# KNOWN LIMITATIONS — SentinelX AI RC-3 Audit

This document registries known operational limitations of SentinelX AI v2.0.

## Limitations Registry

1. **In-Memory Caches:**
   - Active cache states (such as active chat session memory and executive report caches) are stored in server memory. If the server node restarts, these active states are reset.
2. **Scanner Integrations:**
   - Supports XML-formatted scan logs. Custom formats require custom parsing adapters.
3. **Simulated Scan Scope:**
   - Simulated scans represent sandbox flows to prevent excessive load on target networks during local testing.
