# RELEASE NOTES — SentinelX AI RC-2 Audit

SentinelX AI v2.0-RC2 introduces authentication, cache security boundaries, and modular route namespacing.

## Key Changes
- **Complete Auth Flow:** Self-service registration is now enabled. Password policies check character sets (uppercase, lowercase, number, special character) and length.
- **Resource Protection:** Memory footprint leaks are prevented by a 15-minute TTL eviction strategy on AI stats maps.
- **Clean Namespace Separation:** Routes are segregated under `/api/v1` namespace.
- **SSE Connection Path Correction:** Fixed frontend SSE subscription calls to align with API namespacing.
- **Unit Verification:** All tests run and pass without warnings.
