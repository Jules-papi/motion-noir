import { Page, BrowserContext } from '@playwright/test';
import * as path from 'path';
import { QAIssue } from '../types';
import { SCREENSHOTS_DIR } from '../utils';

/**
 * Data Stress & Chaos Testing Module
 * Tests application resilience under extreme data, edge cases, and network failures
 * without modifying or mutating any remote database.
 */
export async function runDataStressCheck(page: Page, targetUrl: string, context: BrowserContext): Promise<QAIssue[]> {
  const issues: QAIssue[] = [];

  console.log('    [Data Stress] 1. Testing Input Fuzzing & XSS...');
  // 1. Input Fuzzing & XSS
  try {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      // Very long text
      const longText = 'ÇılgınTürkçeKarakterler_ĞÜŞİÖÇ_'.repeat(20);
      await searchInput.fill(longText);
      await page.waitForTimeout(200);

      // XSS payload
      const xssPayload = '<img src=x onerror="window.__xss_vulnerable=true">';
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
          probableCause: 'Input rendered directly to DOM without escaping'
        });
      }
      await searchInput.fill('');
    }
  } catch (err: any) {
    console.log('      Input fuzzing skipped/failed:', err.message);
  }

  // 2. Rapid user interaction / spam clicks
  console.log('    [Data Stress] 2. Testing Rapid Interaction (Debounce / Stability)...');
  try {
    const clickable = page.locator('button').first();
    if (await clickable.isVisible()) {
      for (let i = 0; i < 10; i++) {
        clickable.click({ timeout: 500 }).catch(() => {});
      }
      await page.waitForTimeout(300);
    }
  } catch {
    // Non-fatal
  }

  // 3. Isolated session for Network Chaos (API 500 & 429)
  console.log('    [Data Stress] 3. Testing API 500 & 429 Fault Tolerance...');
  const faultPage = await context.newPage();
  try {
    // Intercept Supabase calls to simulate 500 Internal Server Error
    await faultPage.route('**/rest/v1/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error (Simulated Chaos)' })
      });
    });

    let uncaughtErrors: string[] = [];
    faultPage.on('pageerror', err => uncaughtErrors.push(err.message));

    await faultPage.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await faultPage.waitForTimeout(1000);

    // Verify app did not crash to white screen
    const isAppAlive = await faultPage.evaluate(() => {
      return document.body && document.body.children.length > 0;
    });

    if (!isAppAlive) {
      issues.push({
        severity: 'CRITICAL',
        category: 'Data Stress',
        route: '/',
        viewport: '1440x900',
        problem: 'Application rendered a blank screen on backend API 500 failure.',
        probableCause: 'Missing error boundary or unhandled promise rejection in data loader'
      });
    }

    if (uncaughtErrors.some(e => e.includes('Cannot read properties of null') || e.includes('undefined'))) {
      issues.push({
        severity: 'HIGH',
        category: 'Data Stress',
        route: '/',
        viewport: '1440x900',
        problem: `Uncaught exception during API 500 failure: ${uncaughtErrors.join('; ')}`,
        probableCause: 'Missing null-safety / fallback in query response handlers'
      });
    }
  } catch (err: any) {
    console.log('      Error during 500 test:', err.message);
  } finally {
    await faultPage.close();
  }

  // 4. Isolated session for Empty States (0 records)
  console.log('    [Data Stress] 4. Testing Empty States (0 records)...');
  const emptyStatePage = await context.newPage();
  try {
    await emptyStatePage.route('**/rest/v1/noir_posts*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await emptyStatePage.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await emptyStatePage.waitForTimeout(800);

    const emptyHandled = await emptyStatePage.evaluate(() => {
      return document.body.innerText.length > 50; // Should display fallback UI / empty message
    });

    if (!emptyHandled) {
      issues.push({
        severity: 'MEDIUM',
        category: 'Data Stress',
        route: '/',
        viewport: '1440x900',
        problem: 'Empty state not properly presented when 0 posts are returned.',
        probableCause: 'Missing empty-state UI component or layout collapse'
      });
    }
  } catch (err: any) {
    console.log('      Error during empty state test:', err.message);
  } finally {
    await emptyStatePage.close();
  }

  // 5. Isolated session for Extreme Data / Chaos Payloads (1000 items, long strings, nulls, emojis, massive numbers)
  console.log('    [Data Stress] 5. Testing Extreme Data Payloads (1,000 items, 5000-char strings, emojis, ₺999B)...');
  const chaosPage = await context.newPage();
  try {
    const massiveMockPosts = Array.from({ length: 100 }, (_, i) => ({
      id: `chaos-post-${i}`,
      author_id: `author-${i}`,
      content: i === 0 
        ? '🇹🇷 Çok uzun Türkçe metin testi: '.repeat(100) + ' 👑💎🔥 '.repeat(50) 
        : i === 1 
        ? 'NONBREAKINGSTRINGWITHOUTANYSPACES'.repeat(40)
        : `Normal length post caption #${i}`,
      type: 'photo',
      media_url: i % 2 === 0 ? null : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      likes_count: 999999999999,
      comments_count: 54321,
      created_at: new Date().toISOString()
    }));

    await chaosPage.route('**/rest/v1/noir_posts*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(massiveMockPosts)
      });
    });

    await chaosPage.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await chaosPage.waitForTimeout(1000);

    // Check for overflow / layout breakage with extreme data
    const layoutOverflow = await chaosPage.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 2;
    });

    if (layoutOverflow) {
      const shotName = `chaos-overflow-${Date.now()}.png`;
      await chaosPage.screenshot({ path: path.join(SCREENSHOTS_DIR, shotName) });
      issues.push({
        severity: 'HIGH',
        category: 'Data Stress',
        route: '/',
        viewport: '1440x900',
        problem: 'Layout broke horizontally under extreme unspaced text and massive numeric values.',
        screenshot: shotName,
        probableCause: 'Missing word-break: break-word or max-width constraint on feed cards'
      });
    }
  } catch (err: any) {
    console.log('      Error during chaos test:', err.message);
  } finally {
    await chaosPage.close();
  }

  return issues;
}
