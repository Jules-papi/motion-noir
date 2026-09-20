---
name: qa
description: Comprehensive Frontend QA Suite for automated functional, visual, responsive, accessibility, and regression testing.
---

# Frontend QA Suite

Run comprehensive automated quality assurance tests on the application.

## Usage

You can run individual test suites or the entire comprehensive test battery:

- **Quick / Smoke Test**: `npm run qa`
- **Visual Inspection**: `npm run qa:visual`
- **Responsive / Viewport Test**: `npm run qa:responsive`
- **Data Stress / Edge Case Test**: `npm run qa:data`
- **Accessibility (a11y) Test**: `npm run qa:a11y`
- **Visual Regression Test**: `npm run qa:regression`
- **Full QA Suite**: `npm run qa:full`

## Environment Target
By default, the tests point to the production deployment (`https://motion-noir.vercel.app`).
To run against a local development server or custom URL, provide `QA_URL`:

```bash
QA_URL=http://localhost:3000 npm run qa:full
```

## Report Output
Test execution writes reports and captured screenshots directly into `qa-reports/`:
- `qa-reports/report.md`: Formatted Markdown report matching QA specifications.
- `qa-reports/results.json`: JSON output for automated ingestion.
- `qa-reports/screenshots/`: Captured screenshots and visual diffs.
- `qa-reports/baselines/`: Baseline images for visual regression testing.
