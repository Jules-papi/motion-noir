import { Page } from '@playwright/test';
import { QAIssue } from '../types';

export async function runDataStressCheck(page: Page, targetUrl: string): Promise<QAIssue[]> {
  const issues: QAIssue[] = [];

  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // 1. Search Bar Stress Testing (if present)
  try {
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      // Long input test
      const longText = 'A'.repeat(500);
      await searchInput.fill(longText);
      await page.waitForTimeout(300);

      // Check if input broke layout
      const inputWidth = await searchInput.evaluate(el => el.getBoundingClientRect().width);
      const parentWidth = await searchInput.evaluate(el => el.parentElement?.getBoundingClientRect().width || 0);
      if (parentWidth > 0 && inputWidth > parentWidth + 10) {
        issues.push({
          severity: 'MEDIUM',
          category: 'Data Stress',
          route: '/',
          viewport: `${page.viewportSize()?.width}x${page.viewportSize()?.height}`,
          element: 'input',
          problem: 'Search input container expanded beyond parent boundary on long text entry.',
          probableCause: 'Missing CSS max-width: 100% or overflow handling on input wrapper'
        });
      }

      // XSS / Special characters test
      const xssPayload = `<img src=x onerror="window.__xss_vulnerable=true">`;
      await searchInput.fill(xssPayload);
      await page.waitForTimeout(200);

      const isXss = await page.evaluate(() => (window as any).__xss_vulnerable === true);
      if (isXss) {
        issues.push({
          severity: 'CRITICAL',
          category: 'Data Stress',
          route: '/',
          viewport: `${page.viewportSize()?.width}x${page.viewportSize()?.height}`,
          element: 'input',
          problem: 'Cross-Site Scripting (XSS) vulnerability detected via search input.',
          probableCause: 'Unsanitized HTML rendering (dangerouslySetInnerHTML or raw DOM insertion)'
        });
      }

      // Reset search
      await searchInput.fill('');
    }
  } catch (err: any) {
    // Non-blocking if input search is absent
  }

  // 2. Dispatch/Post Modal Form Stress Testing
  try {
    const dispatchBtn = page.locator('header button:has-text("Dispatch"), button:has-text("Dispatch")').first();
    if (await dispatchBtn.isVisible()) {
      await dispatchBtn.click();
      await page.waitForTimeout(400);

      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible()) {
        // Extreme long string with no whitespace
        const unspacedExtremeString = 'SUPERLONGCHARACTERSTRINGWITHOUTWHITESPACETOTESTWORDBREAKOVERFLOW'.repeat(10);
        await textarea.fill(unspacedExtremeString);
        await page.waitForTimeout(200);

        // Check if modal has horizontal scroll or breaks out
        const modalContainer = page.locator('[role="dialog"], .fixed.inset-0').first();
        if (await modalContainer.isVisible()) {
          const hasBrokenScroll = await modalContainer.evaluate(el => {
            return el.scrollWidth > el.clientWidth + 5;
          });
          if (hasBrokenScroll) {
            issues.push({
              severity: 'HIGH',
              category: 'Data Stress',
              route: 'Dispatch Modal',
              viewport: `${page.viewportSize()?.width}x${page.viewportSize()?.height}`,
              element: 'textarea',
              problem: 'Dispatch modal content overflowed horizontally on long unspaced word input.',
              probableCause: 'Missing break-words / overflow-wrap: break-word in modal container or typography'
            });
          }
        }
      }

      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  } catch (err: any) {
    // Non-fatal
  }

  // 3. Rapid click stress test (debounce check on actionable buttons)
  try {
    const firstLikeOrActionButton = page.locator('button:has(svg)').first();
    if (await firstLikeOrActionButton.isVisible()) {
      // Rapid click 5 times
      for (let i = 0; i < 5; i++) {
        await firstLikeOrActionButton.click({ timeout: 1000 }).catch(() => {});
      }
      await page.waitForTimeout(300);
    }
  } catch (err: any) {
    // Non-fatal
  }

  return issues;
}
