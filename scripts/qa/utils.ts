import { chromium, Browser, BrowserContext, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { QAResults, QAIssue } from './types';

export const QA_DIR = path.resolve(process.cwd(), 'qa-reports');
export const SCREENSHOTS_DIR = path.join(QA_DIR, 'screenshots');
export const BASELINES_DIR = path.join(QA_DIR, 'baselines');

export function ensureDirectories() {
  if (!fs.existsSync(QA_DIR)) fs.mkdirSync(QA_DIR, { recursive: true });
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  if (!fs.existsSync(BASELINES_DIR)) fs.mkdirSync(BASELINES_DIR, { recursive: true });
}

export async function createBrowser(): Promise<{ browser: Browser; context: BrowserContext; page: Page }> {
  let browser: Browser;
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  } catch {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  return { browser, context, page };
}

export function setupListeners(page: Page, consoleErrors: string[], networkErrors: string[]) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[CONSOLE ERROR] ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(`[UNCAUGHT EXCEPTION] ${err.message}`);
  });

  page.on('response', (res) => {
    const status = res.status();
    const url = res.url();
    // Ignore benign status codes
    if (status >= 400 && !url.includes('favicon.ico')) {
      networkErrors.push(`[HTTP ${status}] ${url}`);
    }
  });

  page.on('requestfailed', (req) => {
    networkErrors.push(`[REQUEST FAILED] ${req.url()}: ${req.failure()?.errorText || 'Unknown error'}`);
  });
}

export function generateMarkdownReport(results: QAResults): string {
  const criticalIssues = results.issues.filter(i => i.severity === 'CRITICAL');
  const highIssues = results.issues.filter(i => i.severity === 'HIGH');
  const mediumIssues = results.issues.filter(i => i.severity === 'MEDIUM');
  const lowIssues = results.issues.filter(i => i.severity === 'LOW');

  const finalStatus = (criticalIssues.length === 0 && highIssues.length === 0) ? 'PASS' : 'FAIL';

  let md = `# QA REPORT\n\n`;
  md += `## Environment\n\n`;
  md += `* URL: ${results.environment.url}\n`;
  md += `* framework: ${results.environment.framework}\n`;
  md += `* browser: ${results.environment.browser}\n`;
  md += `* viewport: ${results.environment.viewport}\n`;
  md += `* timestamp: ${results.environment.timestamp}\n\n`;

  md += `## Functional\n\n${results.functional ? 'PASS' : 'FAIL'}\n\n`;
  md += `## Visual\n\n${results.visual ? 'PASS' : 'FAIL'}\n\n`;
  md += `## Responsive\n\n${results.responsive ? 'PASS' : 'FAIL'}\n\n`;
  md += `## Accessibility\n\n${results.accessibility ? 'PASS' : 'FAIL'}\n\n`;
  md += `## Console\n\n${results.console ? 'PASS' : 'FAIL'}\n\n`;
  md += `## Network\n\n${results.network ? 'PASS' : 'FAIL'}\n\n`;
  md += `## Data Stress\n\n${results.dataStress ? 'PASS' : 'FAIL'}\n\n`;
  md += `## Visual Regression\n\n${results.visualRegression ? 'PASS' : 'FAIL'}\n\n`;

  md += `## Issues\n\n`;

  md += `### CRITICAL\n`;
  if (criticalIssues.length === 0) {
    md += `* None\n\n`;
  } else {
    criticalIssues.forEach(i => {
      md += `* **[${i.category}]** ${i.problem}\n`;
    });
    md += `\n`;
  }

  md += `### HIGH\n`;
  if (highIssues.length === 0) {
    md += `* None\n\n`;
  } else {
    highIssues.forEach(i => {
      md += `* **[${i.category}]** ${i.problem}\n`;
    });
    md += `\n`;
  }

  md += `### MEDIUM\n`;
  if (mediumIssues.length === 0) {
    md += `* None\n\n`;
  } else {
    mediumIssues.forEach(i => {
      md += `* **[${i.category}]** ${i.problem}\n`;
    });
    md += `\n`;
  }

  md += `### LOW\n`;
  if (lowIssues.length === 0) {
    md += `* None\n\n`;
  } else {
    lowIssues.forEach(i => {
      md += `* **[${i.category}]** ${i.problem}\n`;
    });
    md += `\n`;
  }

  md += `## Evidence\n\n`;
  if (results.issues.length === 0) {
    md += `All automated checks passed with no blocking issues detected.\n\n`;
  } else {
    results.issues.forEach((i, idx) => {
      md += `### Case ${idx + 1}: ${i.problem}\n`;
      md += `* **route**: ${i.route}\n`;
      md += `* **viewport**: ${i.viewport}\n`;
      if (i.element) md += `* **element**: \`${i.element}\`\n`;
      md += `* **problem**: ${i.problem}\n`;
      if (i.screenshot) md += `* **screenshot**: ${i.screenshot}\n`;
      if (i.relevantLog) md += `* **relevant console/network error**: \`${i.relevantLog}\`\n`;
      if (i.probableCause) md += `* **probable cause**: ${i.probableCause}\n`;
      md += `\n`;
    });
  }

  md += `## Final Status\n\n${finalStatus}\n`;

  return md;
}
