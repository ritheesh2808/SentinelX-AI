# Bug & Issue Report — SentinelX AI Production Sprint

This report documents all software issues, design flaws, and test script mismatches identified during the SentinelX AI Production Validation Sprint.

---

## 1. Summary of Discovered Issues

| Bug ID | Component | Severity | Title | Impact |
|---|---|---|---|---|
| **BUG-001** | Backend API (`app.ts`) | **Critical** | Global Authentication Rate Limit Lockout | Prevents users from navigating or refreshing the page more than 15 times within 15 minutes. |
| **BUG-002** | Test Script (`pat_flow.spec.ts`) | **Medium** | Chat Input Placeholder Mismatch | Caused Playwright test runs to hang and time out on the SOC AI Chat step. |
| **BUG-003** | Test Script (`pat_flow.spec.ts`) | **Medium** | Chat Submit Button Text Selector Error | Selector `button:has-text("Send")` failed because the submit button is textless (SVG icon only). |
| **BUG-004** | Test Script (`pat_flow.spec.ts`) | **Medium** | Session Persistence Bypassed Login Page | Persistence redirected `/` to `/dashboard`, causing `waitForURL('**/login')` to hang in Phase 10. |

---

## 2. Issue Details

### BUG-001: Global Authentication Rate Limit Lockout
- **Component:** Backend Express Server (`backend/src/app.ts`)
- **Severity:** **Critical** (Production Block/Usability Failure)
- **Description:** 
  The backend API server registered an Express rate limiter (`authLimiter`) on the `/api/v1/auth` routing group. This limit was configured to a maximum of **15 requests per 15 minutes** per IP:
  ```typescript
  app.use('/api/v1/auth', authLimiter, authRoutes)
  ```
  However, this routing group contains not only login/register routes but also `/profile` and `/logout` routes. The frontend React app requests `/profile` on page refreshes and route updates. An active user navigating the dashboard and reloading a few times easily hits 15 requests, resulting in a **429 Too Many Requests** error that locks them out of their profile context and breaks the application layout.
- **Root Cause:** The auth rate limit was globally applied to all routes in `authRoutes` instead of selectively targeting brute-force sensitive endpoints, and the ceiling (15 requests/15 mins) was set too low for normal interactive sessions.

### BUG-002: Chat Input Placeholder Mismatch
- **Component:** Test Code (`production_acceptance/pat_flow.spec.ts`)
- **Severity:** **Medium** (Test Suite Block)
- **Description:** 
  The Playwright test suite attempted to type into the chat input using:
  ```typescript
  await page.fill('input[placeholder*="Ask AI SOC Analyst"]', ...);
  ```
  However, the actual placeholder defined in `ChatPage.tsx` is:
  ```typescript
  placeholder="Ask a question about your security risks..."
  ```
  Since the substring `Ask AI SOC Analyst` was not present, the selector failed, causing the test runner to hang until it hit the 120-second test timeout.

### BUG-003: Chat Submit Button Text Selector Error
- **Component:** Test Code (`production_acceptance/pat_flow.spec.ts`)
- **Severity:** **Medium** (Test Suite Block)
- **Description:** 
  The Playwright test suite attempted to submit the chat message by clicking a button with text:
  ```typescript
  await page.click('button:has-text("Send")');
  ```
  The chat submit button in `ChatPage.tsx` actually contains only an SVG icon with no text content, meaning Playwright could never locate a button with the text "Send".

### BUG-004: Session Persistence Bypassed Login Page
- **Component:** Test Code (`production_acceptance/pat_flow.spec.ts`)
- **Severity:** **Medium** (Test Suite Block)
- **Description:** 
  In Phase 10 (Security payload testing), the test navigated to `/` and waited for `/login`. However, because the user had a valid login session from Phase 3 in `localStorage`, the frontend router automatically redirected `/` to `/dashboard`. The test got stuck waiting for `/login`.
