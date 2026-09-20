import { Page } from '@playwright/test';
import { QAIssue } from '../types';

export async function runBasicCheck(page: Page, targetUrl: string, consoleErrors: string[], networkErrors: string[]): Promise<QAIssue[]> {
  const issues: QAIssue[] = [];

  try {
    const response = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
    if (!response || response.status() >= 400) {
      issues.push({
        severity: 'CRITICAL',
        category: 'Functional',
        route: '/',
        viewport: '1440x900',
        problem: `Application failed to load: HTTP ${response?.status()}`,
        probableCause: 'Server unavailable or deployment issue'
      });
      return issues;
    }
  } catch (err: any) {
    issues.push({
      severity: 'CRITICAL',
      category: 'Functional',
      route: '/',
      viewport: '1440x900',
      problem: `Failed to open page: ${err.message}`,
      probableCause: 'Network error or host unreachable'
    });
    return issues;
  }

  // 1. Broken images check
  const brokenImages = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.filter(img => img.naturalWidth === 0 || !img.complete).map(img => img.src);
  });

  if (brokenImages.length > 0) {
    issues.push({
      severity: 'HIGH',
      category: 'Functional',
      route: '/',
      viewport: '1440x900',
      problem: `Found ${brokenImages.length} broken images on page load`,
      probableCause: `Image URLs unreachable: ${brokenImages.slice(0, 3).join(', ')}`
    });
  }

  // 2. Navigation tests: Discovery, Chat, Profile, Feed
  const views = [
    { name: 'The Registry', btnText: 'The Registry' },
    { name: 'Dispatches', btnText: 'Dispatches' },
    { name: 'Member Dossier', btnText: 'Member Dossier' },
    { name: 'The Gazette', btnText: 'The Gazette' }
  ];

  for (const view of views) {
    try {
      const btn = page.locator(`button:has-text("${view.btnText}")`).first();
      await btn.click({ timeout: 5000 });
      await page.waitForTimeout(300);
    } catch (err: any) {
      issues.push({
        severity: 'HIGH',
        category: 'Functional',
        route: view.name,
        viewport: '1440x900',
        problem: `Navigation button "${view.btnText}" failed to respond: ${err.message}`,
        probableCause: 'Broken event handler or obstructed element'
      });
    }
  }

  // 3. Modal open / close tests
  // a. AuthModal (Admission)
  try {
    const admissionBtn = page.locator('header button:has-text("Admission")');
    if (await admissionBtn.isVisible()) {
      await admissionBtn.click();
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  } catch (err: any) {
    issues.push({
      severity: 'HIGH',
      category: 'Functional',
      route: 'Admission Modal',
      viewport: '1440x900',
      problem: `Admission modal open/close failed: ${err.message}`,
      probableCause: 'Uncaught modal state error'
    });
  }

  // b. CreatePostModal
  try {
    const dispatchBtn = page.locator('header button:has-text("Dispatch")');
    if (await dispatchBtn.isVisible()) {
      await dispatchBtn.click();
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  } catch (err: any) {
    issues.push({
      severity: 'HIGH',
      category: 'Functional',
      route: 'Create Post Modal',
      viewport: '1440x900',
      problem: `Create Post modal open/close failed: ${err.message}`,
      probableCause: 'Uncaught modal state error'
    });
  }

  // c. Notifications Drawer
  try {
    const notifBtn = page.locator('header button[title="Notifications"]');
    if (await notifBtn.isVisible()) {
      await notifBtn.click();
      await page.waitForTimeout(300);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  } catch (err: any) {
    issues.push({
      severity: 'HIGH',
      category: 'Functional',
      route: 'Notifications Drawer',
      viewport: '1440x900',
      problem: `Notifications drawer open/close failed: ${err.message}`,
      probableCause: 'Uncaught drawer state error'
    });
  }

  // 4. Report any collected console errors
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(err => {
      issues.push({
        severity: err.includes('Uncaught') || err.includes('ReferenceError') ? 'CRITICAL' : 'HIGH',
        category: 'Console',
        route: '/',
        viewport: '1440x900',
        problem: err,
        probableCause: 'Unhandled client-side exception'
      });
    });
  }

  // 5. Report any network errors
  if (networkErrors.length > 0) {
    networkErrors.forEach(err => {
      issues.push({
        severity: 'MEDIUM',
        category: 'Network',
        route: '/',
        viewport: '1440x900',
        problem: err,
        probableCause: 'Resource missing or endpoint returned 4xx/5xx'
      });
    });
  }

  return issues;
}
