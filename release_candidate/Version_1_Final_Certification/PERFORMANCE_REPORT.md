# SentinelX AI — Performance Report

**Audit Date:** June 28, 2026  
**Tool:** Google Lighthouse CLI 13.4.0  
**Target:** `https://sentinelx-ai-8rnk.onrender.com`  
**Mode:** Navigation (Headless Chromium, no sandbox)  
**HTML Report:** [`lighthouse-report.html`](file:///home/ritheesh/Projects/SentinelX-AI/release_candidate/Version_1_Final_Certification/lighthouse-report.html)

---

## Core Lighthouse Scores

| Category | Score | Rating |
|---|---|---|
| **Performance** | **99 / 100** | 🟢 Excellent |
| **Best Practices** | **100 / 100** | 🟢 Excellent |
| **SEO** | **100 / 100** | 🟢 Excellent |
| **Accessibility** | **89 / 100** | 🟡 Good (Minor Issues) |
| **Agentic Browsing** | **100 / 100** | 🟢 Excellent |

---

## Performance Metrics (99 / 100)

| Metric | Measured Value | Target | Status |
|---|---|---|---|
| **First Contentful Paint (FCP)** | ~0.4 s | < 1.8 s | ✅ PASS |
| **Largest Contentful Paint (LCP)** | ~0.6 s | < 2.5 s | ✅ PASS |
| **Speed Index** | ~0.4 s | < 3.4 s | ✅ PASS |
| **Total Blocking Time (TBT)** | 0 ms | < 200 ms | ✅ PASS |
| **Cumulative Layout Shift (CLS)** | 0 | < 0.1 | ✅ PASS |
| **Time to Interactive (TTI)** | ~0.5 s | < 3.8 s | ✅ PASS |

> [!NOTE]
> All Core Web Vitals thresholds are met or exceeded. The application qualifies for Google's "Good" CWV rating.

---

## Build Bundle Analysis

The Vite production build produced the following optimised chunks:

| Asset | Size (Raw) | Size (gzip) | Type |
|---|---|---|---|
| `vendor-axios-*.js` | 44.72 kB | 17.02 kB | HTTP client library |
| `index-*.js` | 231.65 kB | 38.06 kB | Application bundle |
| `vendor-react-*.js` | 232.62 kB | 74.53 kB | React + React-DOM |
| **Total Transfer** | **~509 kB** | **~130 kB** | |

The total compressed transfer weight of ~130 kB is well within acceptable bounds for a feature-rich React SPA with charting, AI integration, and security dashboards.

---

## Best Practices (100 / 100)

All best-practice audits passed:
- ✅ Serves content over HTTPS
- ✅ No vulnerable JavaScript libraries detected
- ✅ Uses modern, standards-compliant APIs
- ✅ No deprecated APIs in use
- ✅ No browser errors logged during load
- ✅ Images have correct aspect ratios and resolution

---

## SEO (100 / 100)

- ✅ `<title>` tag present and descriptive
- ✅ `<meta name="description">` present
- ✅ Viewport meta tag configured for mobile
- ✅ Page is indexable (no `noindex` directive)
- ✅ Links have descriptive text
- ✅ Tap targets are appropriately sized

---

## Accessibility (89 / 100)

The accessibility score is Good but not perfect. The following issues were detected:

| Issue | Element | Recommendation |
|---|---|---|
| Low color contrast | Gray label text on dark background | Increase contrast ratio to ≥ 4.5:1 (WCAG AA) |
| Missing `aria-label` | SVG icon buttons in sidebar nav | Add descriptive `aria-label` to all icon-only buttons |

**Remediation Plan:** These will be addressed in the v1.1.0 design token and accessibility sprint.

---

## Network Analysis (From Playwright HAR)

The HAR network log (`logs/network.json`, 156 KB) captured during the full E2E test shows:
- All API requests resolved to `https://sentinelx-ai-mymf.onrender.com` — no localhost references
- Zero failed requests critical to core page functionality
- SSE connection (scan progress streaming) established correctly
- All fonts, assets, and scripts served from the Render CDN

---

## Conclusion

SentinelX AI's production frontend achieves **near-perfect performance** with a Lighthouse score of **99/100**. The application loads fast, has zero layout shift, zero main-thread blocking, and achieves all Core Web Vitals thresholds. The bundle is well-split across vendor and application chunks for efficient caching.
