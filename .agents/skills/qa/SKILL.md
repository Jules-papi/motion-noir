---
name: qa
description: Enterprise-grade autonomous Frontend QA system with visual, responsive, data stress/chaos, accessibility, and functional verification. Enforces a strict 12-step verification loop and zero-production-tampering security rules.
---

# Autonomous Frontend QA & Verification System

This skill enforces high-standard QA for all frontend modifications.

> **Motto**: *"Build successful" never equals "UI successful".*

---

## 🔒 Security & Workflow Boundaries (MANDATORY)

1. **NEVER Auto-Deploy or Push to Production**:
   - The agent MUST NOT execute `vercel --prod` or `git push` autonomously as part of the QA loop.
   - The workflow MUST be:
     `CODE -> QA (Local) -> FIX -> QA AGAIN -> PASS -> REPORT TO USER -> DEPLOY ONLY UPON USER APPROVAL`.
2. **NEVER Mutate Production Database / Services**:
   - QA tests must run against local mock data or use Playwright route interception (`page.route`).
   - Never run raw `UPDATE`, `DELETE`, or `INSERT` against the production database to satisfy test conditions.
3. **Local Testing First**:
   - By default, QA runs against the local build/preview (`http://localhost:4173` or `http://localhost:3000`).

---

## 🔁 Mandatory 12-Step Verification Loop

Whenever frontend changes are implemented, follow this strict loop:

1. **Open in real browser**: Launch browser via Playwright (using system Chrome or Chromium).
2. **Visit relevant routes**: Navigate through affected views, feeds, dialogs, and components.
3. **Capture screenshots**: Take full-page and element-level screenshots into `qa-reports/screenshots/`.
4. **Inspect DOM geometry**: Measure bounding boxes, check for horizontal overflow, clipped text, or z-index collisions.
5. **Monitor Console & Network**: Catch all unhandled JS exceptions, console warnings/errors, and failed network calls (4xx/5xx/ORB).
6. **Test across Viewports**: Verify responsive design across:
   - 375x812 (Mobile compact - iPhone SE/Mini)
   - 390x844 (Mobile standard - iPhone 12/13/14/15)
   - 768x1024 (Tablet portrait - iPad)
   - 1024x768 (Tablet landscape / Netbook)
   - 1440x900 (Desktop - MacBook / Laptop)
   - 1920x1080 (FHD desktop)
7. **Execute Chaos / Data-Stress Testing**:
   - Null / undefined properties
   - Empty arrays (Zero-state UI validation)
   - 1,000+ records (Performance & list stability)
   - 500-char usernames and 5000-char descriptions (Unspaced string overflow)
   - Extreme currency/numbers (e.g. ₺999,999,999,999)
   - Missing / broken images & fallback rendering
   - Injected XSS & sanitize checks
   - Simulated API 500 (Internal Server Error)
   - Simulated API 429 (Rate Limiting)
   - Simulated Network Timeout
   - Turkish characters (`ç, ğ, ı, ö, ş, ü, İ`) & heavy emoji payloads (`🔥💎👑`)
8. **Accessibility Audit (a11y)**:
   - Run `@axe-core/playwright` across views.
   - Verify WCAG 2.1 AA compliance (color contrast, button-name, alt text, form labels, ARIA landmarks).
9. **Visual Regression Check**:
   - Compare screenshots against `qa-reports/baselines/` using `pixelmatch` (<1.5% tolerance).
10. **Diagnose and Fix**:
    - If any CRITICAL or HIGH issue is found, fix the root cause in the source code.
11. **Re-run QA Suite**:
    - Rebuild and execute the QA suite to verify the fix.
12. **Verify & Report**:
    - Confirm all checks are green (PASS). Provide the structured QA report to the user and await approval before pushing or deploying.

---

## 🛠️ CLI Commands

Run these commands in the terminal:

- `npm run qa` - Quick smoke test (routing, console, network, broken images).
- `npm run qa:visual` - Visual geometry, overflow, clipping, overlap checks.
- `npm run qa:responsive` - Multi-device viewport testing.
- `npm run qa:data` - Data stress, chaos, null-safety, and API failure testing.
- `npm run qa:a11y` - Automated WCAG 2.1 AA accessibility audit.
- `npm run qa:regression` - Pixelmatch visual regression against saved baselines.
- `npm run qa:full` - Complete test battery + markdown report generation.

---

## 📄 Standard Report Output Format

The output is saved to `qa-reports/report.md` with the following structure:

```markdown
# QA REPORT

## Environment
* URL: [Target URL]
* framework: [Stack details]
* browser: [Browser version]
* viewport: [Screen dimensions]
* timestamp: [ISO timestamp]

## Functional
[PASS/FAIL]

## Visual
[PASS/FAIL]

## Responsive
[PASS/FAIL]

## Accessibility
[PASS/FAIL]

## Console
[PASS/FAIL]

## Network
[PASS/FAIL]

## Data Stress
[PASS/FAIL]

## Visual Regression
[PASS/FAIL]

## Issues
### CRITICAL
* [Description or None]

### HIGH
* [Description or None]

### MEDIUM
* [Description or None]

### LOW
* [Description or None]

## Evidence
[Per-issue details: route, viewport, element, problem, screenshot, log, probable cause]

## Final Status
[PASS/FAIL]
```
