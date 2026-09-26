import * as fs from 'fs';
import * as path from 'path';
import { QAResults, QAIssue } from './types';
import { QA_DIR, ensureDirectories, createBrowser, setupListeners, generateMarkdownReport } from './utils';
import { runBasicCheck } from './checks/basic';
import { runVisualCheck } from './checks/visual';
import { runResponsiveCheck } from './checks/responsive';
import { runDataStressCheck } from './checks/data-stress';
import { runA11yCheck } from './checks/a11y';
import { runRegressionCheck } from './checks/regression';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase() || 'full';
  const targetUrl = process.env.QA_URL || 'http://localhost:4173';

  console.log(`[QA Orchestrator] Starting suite: "${command.toUpperCase()}" against ${targetUrl}`);

  ensureDirectories();

  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];

  const { browser, context, page } = await createBrowser();
  setupListeners(page, consoleErrors, networkErrors);

  const allIssues: QAIssue[] = [];

  const results: QAResults = {
    functional: true,
    visual: true,
    responsive: true,
    accessibility: true,
    console: true,
    network: true,
    dataStress: true,
    visualRegression: true,
    issues: [],
    environment: {
      url: targetUrl,
      framework: 'React 18 + Vite + Tailwind CSS',
      browser: 'Chromium / Google Chrome',
      viewport: '1440x900',
      timestamp: new Date().toISOString()
    }
  };

  try {
    // 1. Basic & Functional Checks
    if (['full', 'quick', 'basic'].includes(command)) {
      console.log(`[QA] Running Basic & Functional Checks...`);
      const basicIssues = await runBasicCheck(page, targetUrl, consoleErrors, networkErrors);
      allIssues.push(...basicIssues);
      if (basicIssues.some(i => i.category === 'Functional')) results.functional = false;
    }

    // 2. Visual Check
    if (['full', 'visual'].includes(command)) {
      console.log(`[QA] Running Visual Inspection Checks...`);
      const visualIssues = await runVisualCheck(page, '/');
      allIssues.push(...visualIssues);
      if (visualIssues.length > 0) results.visual = false;
    }

    // 3. Responsive Check
    if (['full', 'responsive'].includes(command)) {
      console.log(`[QA] Running Responsive Viewport Checks...`);
      const responsiveIssues = await runResponsiveCheck(page, targetUrl);
      allIssues.push(...responsiveIssues);
      if (responsiveIssues.length > 0) results.responsive = false;
    }

    // 4. Data Stress Check
    if (['full', 'data'].includes(command)) {
      console.log(`[QA] Running Data Stress Checks...`);
      const dataIssues = await runDataStressCheck(page, targetUrl, context);
      allIssues.push(...dataIssues);
      if (dataIssues.length > 0) results.dataStress = false;
    }

    // 5. Accessibility Check
    if (['full', 'a11y', 'accessibility'].includes(command)) {
      console.log(`[QA] Running Accessibility (WCAG) Checks...`);
      const a11yIssues = await runA11yCheck(page, '/');
      allIssues.push(...a11yIssues);
      if (a11yIssues.some(i => i.severity === 'CRITICAL' || i.severity === 'HIGH')) results.accessibility = false;
    }

    // 6. Visual Regression Check
    if (['full', 'regression'].includes(command)) {
      console.log(`[QA] Running Visual Regression Checks...`);
      const regressionIssues = await runRegressionCheck(page, targetUrl, '/');
      allIssues.push(...regressionIssues);
      if (regressionIssues.length > 0) results.visualRegression = false;
    }

    // Populate console and network statuses
    if (consoleErrors.length > 0) results.console = false;
    if (networkErrors.length > 0) results.network = false;

  } catch (err: any) {
    console.error(`[QA] Fatal execution error:`, err);
    allIssues.push({
      severity: 'CRITICAL',
      category: 'Functional',
      route: '/',
      viewport: '1440x900',
      problem: `QA runner crashed: ${err.message}`,
      probableCause: 'Unhandled script exception during QA run'
    });
  } finally {
    await browser.close();
  }

  results.issues = allIssues;

  // Generate artifacts
  const markdownReport = generateMarkdownReport(results);
  const reportPath = path.join(QA_DIR, 'report.md');
  const jsonPath = path.join(QA_DIR, 'results.json');

  fs.writeFileSync(reportPath, markdownReport, 'utf-8');
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf-8');

  console.log(`\n================== REPORT GENERATED ==================\n`);
  console.log(markdownReport);
  console.log(`Report written to ${reportPath}`);

  const hasCriticalOrHigh = allIssues.some(i => i.severity === 'CRITICAL' || i.severity === 'HIGH');
  if (hasCriticalOrHigh) {
    console.error(`[QA] Suite completed with blocking issues.`);
    process.exit(1);
  } else {
    console.log(`[QA] Suite completed with 0 blocking issues.`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error('[QA Fatal]', err);
  process.exit(1);
});
