# SentinelX AI — Authentication Audit

This report evaluates session management configurations, role structures, and credentials verification checks.

---

## 1. Authentication Configuration Summary

* **Session Validation:** Authenticated request routing verifies Bearer JWT tokens signed with HS256 and configured with 1-hour expiration limits.
* **Brute-force Blockage:** `/auth/*` paths limit login attempts to a maximum of 15 requests per 15 minutes per IP.
* **Credentials Complexity Requirements:** Enforces password safety rules on user registration, password changes, and resets:
  - Minimum length of 8 characters.
  - At least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol.

---

## 2. Implemented Features Checklist (Sprint 15)

- [x] **Forgot Password:** Generates a 6-digit recovery token in `auth.service.ts` expiring in 15 minutes. Logs token output for local preview.
- [x] **Reset Password:** Validates recovery tokens and resets the user's password.
- [x] **Change Password:** Enables authenticated users to update their credentials after validating their current password.
- [x] **Profile Editing:** Allows users to modify full name and email addresses while checking for conflicts.
- [x] **Account Deletion:** Cascades deletions across audit logs, incidents, scans, assets, and notifications.
- [x] **Admin bootstrapping:** Seeds a default `System Admin` account (`admin@sentinelx.ai` / `SecureAdminPassword123!`) if database is empty on startup.
