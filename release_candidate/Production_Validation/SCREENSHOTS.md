# Screenshots Gallery — SentinelX AI Live Site Verification

This document compiles all screenshots captured during the SentinelX AI Production Validation Sprint. All screenshot files are stored in `release_candidate/Production_Validation/screenshots/`.

---

## 1. Phase 1 — Navigation & Redirect Verification

- **Page redirect on clean load:**
  - File: [phase1_login_redirect.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase1_login_redirect.png)
  - Description: Accessing the root path `/` without an active JWT session redirects the browser to the `/login` route.

- **Registration page load:**
  - File: [phase1_register_page.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase1_register_page.png)
  - Description: Navigating client-side to the register view displays the "Create Security Account" form.

---

## 2. Phase 2 — Authentication Verification

- **Password length validation error:**
  - File: [phase2_password_validation_error.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase2_password_validation_error.png)
  - Description: Registering with a short password triggers the validation message: "Password must be at least...".

- **Successful registration redirect:**
  - File: [phase2_registration_success.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase2_registration_success.png)
  - Description: Registering with a strong password redirects the operator back to `/login` to log in.

- **Duplicate email registration block:**
  - File: [phase2_duplicate_email_error.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase2_duplicate_email_error.png)
  - Description: Submitting a registration request with an email that is already registered is blocked by the server with a 409 Conflict.

- **Successful login redirect:**
  - File: [phase2_login_success.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase2_login_success.png)
  - Description: Logging in with the newly registered credentials successfully directs the operator to the `/dashboard`.

- **Session persistence check:**
  - File: [phase2_session_persistence.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase2_session_persistence.png)
  - Description: Reloading the root URL `/` with the JWT token in `localStorage` redirects the operator to `/dashboard`.

---

## 3. Phase 3 & 4 — Functional Sub-Sections & Workflows

- **Asset Inventory grid:**
  - File: [phase3_assets_page.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase3_assets_page.png)
  - Description: Verified layout showing the grid of registered hosts and environments.

- **Asset registered success:**
  - File: [phase4_asset_created.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase4_asset_created.png)
  - Description: Form submission inserts a new asset (e.g. `pat-host-*`) and reloads the grid.

- **System Scans hub:**
  - File: [phase3_scans_page.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase3_scans_page.png)
  - Description: Displays history of network scans.

- **Scan Import view:**
  - File: [phase4_scan_import_view.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase4_scan_import_view.png)
  - Description: The interface for uploading XML/Nmap reports.

- **Scanner simulator triggered:**
  - File: [phase4_scan_simulation_triggered.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase4_scan_simulation_triggered.png)
  - Description: Clicking "Run Scan" kicks off the scanner worker loop on the backend.

- **SSE scan progress monitoring:**
  - File: [phase4_scans_list_progress.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase4_scans_list_progress.png)
  - Description: Real-time scan completion updates push via SSE to the progress indicator.

- **Ports & Services list:**
  - File: [phase3_ports_page.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase3_ports_page.png)
  - Description: Verified list of discovered ports, services, and products.

- **Vulnerabilities index:**
  - File: [phase3_vulnerabilities_page.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase3_vulnerabilities_page.png)
  - Description: Verified display of CVE details and CVSS threat levels.

- **Executive Report dashboard:**
  - File: [phase3_executive_report_page.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase3_executive_report_page.png)
  - Description: Verified overview charts.

- **Security Graphs panel:**
  - File: [phase3_security_graphs_page.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase3_security_graphs_page.png)
  - Description: SVG dynamic charts showing risk profiles.

- **MITRE Mapping panel:**
  - File: [phase3_mitre_page.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase3_mitre_page.png)
  - Description: Interface mapping CVE entries to MITRE ATT&CK techniques.

- **Incident Response playbooks:**
  - File: [phase3_incident_response_page.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase3_incident_response_page.png)
  - Description: The playbooks section for alert mitigation.

- **SOC AI Chat hub:**
  - File: [phase3_soc_chat_page.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase3_soc_chat_page.png)
  - Description: Visualizes the chatbot layout before user query submission.

- **SOC AI Chat response:**
  - File: [phase4_soc_chat_sent.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase4_soc_chat_sent.png)
  - Description: Submitting a query streams real-time advice from the Gemini API model.

- **On-Demand Analyst view:**
  - File: [phase3_ai_agent_page.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase3_ai_agent_page.png)
  - Description: Verification of the on-demand analyst form.

- **Control Settings panel:**
  - File: [phase3_settings_page.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase3_settings_page.png)
  - Description: Profile configuration form.

---

## 4. Phase 8 — Multi-Viewport Responsive Tests

The UI scales adaptively across multiple layout widths:
- **320px (Mobile Small):** [responsive_viewport_320.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/responsive_viewport_320.png)
- **375px (Mobile Medium):** [responsive_viewport_375.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/responsive_viewport_375.png)
- **425px (Mobile Large):** [responsive_viewport_425.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/responsive_viewport_425.png)
- **768px (Tablet):** [responsive_viewport_768.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/responsive_viewport_768.png)
- **1024px (Netbook):** [responsive_viewport_1024.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/responsive_viewport_1024.png)
- **1280px (WXGA):** [responsive_viewport_1280.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/responsive_viewport_1280.png)
- **1440px (HD+):** [responsive_viewport_1440.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/responsive_viewport_1440.png)
- **1920px (Full HD):** [responsive_viewport_1920.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/responsive_viewport_1920.png)

---

## 5. Security & Isolation Tests

- **SQL Injection block:**
  - File: [security_sqli_protection.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/security_sqli_protection.png)
  - Description: Submitting SQL payloads on `/login` stays on the login page (unauthorized).

- **XSS input validation:**
  - File: [security_xss_protection.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/security_xss_protection.png)
  - Description: Injecting HTML script tags into the text input gets safely encoded by the client wrapper.

- **Missing JWT block:**
  - File: [security_missing_jwt_protection.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/security_missing_jwt_protection.png)
  - Description: Clearing storage and navigating to dashboard immediately forces a redirect back to `/login`.

- **Multi-Tab isolation:**
  - File: [stress_multitabs.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/stress_multitabs.png)
  - Description: Verifying that concurrent tabs load correctly and validate auth state in isolation.

---

## 6. Phase 12 — Purging Test Account

- **Control settings delete account view:**
  - File: [phase12_settings_delete_view.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase12_settings_delete_view.png)
  - Description: The delete section under Control Settings.

- **Purge confirm modal:**
  - File: [phase12_delete_modal_confirm.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase12_delete_modal_confirm.png)
  - Description: The modal prompts the user to type "DELETE" to confirm data deletion.

- **Clean redirect on account purge:**
  - File: [phase12_account_purged_redirect.png](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Production_Validation/screenshots/phase12_account_purged_redirect.png)
  - Description: Successfully executing the purge wipes all associated database records, destroys the local session, and redirects back to `/login`.
