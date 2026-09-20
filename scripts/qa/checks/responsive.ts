import { Page } from '@playwright/test';
import * as path from 'path';
import { QAIssue } from '../types';
import { SCREENSHOTS_DIR } from '../utils';

export interface ViewportConfig {
  width: number;
  height: number;
  label: string;
}

export const VIEWPORTS: ViewportConfig[] = [
  { width: 375, height: 812, label: 'iPhone Mini / Mobile Small' },
  { width: 390, height: 844, label: 'iPhone Standard / Mobile Medium' },
  { width: 768, height: 1024, label: 'iPad Portrait / Tablet' },
  { width: 1024, height: 768, label: 'Tablet Landscape / Small Laptop' },
  { width: 1440, height: 900, label: 'Desktop / MacBook' },
  { width: 1920, height: 1080, label: 'Large Desktop / FHD' }
];

export async function runResponsiveCheck(page: Page, targetUrl: string): Promise<QAIssue[]> {
  const issues: QAIssue[] = [];

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600); // Allow responsive reflow and animations to settle

    const screenshotFile = `responsive-${vp.width}x${vp.height}.png`;
    const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotFile);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    // 1. Check for page-level horizontal overflow
    const overflowInfo = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
      const clientWidth = doc.clientWidth;
      const hasOverflow = scrollWidth > clientWidth + 2;

      // Identify violating elements if overflow exists
      let offenders: string[] = [];
      if (hasOverflow) {
        const allElements = Array.from(document.querySelectorAll('*'));
        for (const el of allElements) {
          const rect = el.getBoundingClientRect();
          if (rect.right > clientWidth + 2) {
            const tag = el.tagName.toLowerCase();
            const id = el.id ? `#${el.id}` : '';
            const cls = el.className && typeof el.className === 'string'
              ? `.${el.className.split(' ').slice(0, 2).join('.')}`
              : '';
            offenders.push(`${tag}${id}${cls} (right: ${Math.round(rect.right)}px)`);
            if (offenders.length >= 3) break;
          }
        }
      }

      return {
        hasOverflow,
        scrollWidth,
        clientWidth,
        offenders
      };
    });

    if (overflowInfo.hasOverflow) {
      issues.push({
        severity: 'HIGH',
        category: 'Responsive',
        route: '/',
        viewport: `${vp.width}x${vp.height} (${vp.label})`,
        problem: `Horizontal scrolling detected: scrollWidth (${overflowInfo.scrollWidth}px) > clientWidth (${overflowInfo.clientWidth}px). Offending elements: ${overflowInfo.offenders.join(', ') || 'Unknown'}`,
        screenshot: screenshotFile,
        probableCause: 'Fixed width containers, unconstrained grid/flex items, or wide padding without box-sizing'
      });
    }

    // 2. Navigation accessibility test on this viewport
    const navAvailable = await page.evaluate((isMobile) => {
      // For mobile (<= 768px), look for bottom dock or mobile menu
      if (isMobile) {
        const dock = document.querySelector('nav, [role="navigation"], .fixed.bottom-0');
        const buttons = Array.from(document.querySelectorAll('button'));
        const hasMobileNav = dock !== null || buttons.some(b => {
          const text = (b.textContent || '').toLowerCase();
          return text.includes('registry') || text.includes('dispatches') || text.includes('dossier') || text.includes('menu');
        });
        return hasMobileNav;
      }
      // For desktop, header navigation should exist
      const header = document.querySelector('header');
      return header !== null;
    }, vp.width <= 768);

    if (!navAvailable) {
      issues.push({
        severity: 'MEDIUM',
        category: 'Responsive',
        route: '/',
        viewport: `${vp.width}x${vp.height} (${vp.label})`,
        problem: `Primary navigation appears inaccessible or missing at viewport ${vp.width}x${vp.height}`,
        screenshot: screenshotFile,
        probableCause: 'Missing responsive navigation layout for this breakpoint'
      });
    }
  }

  // Reset back to standard desktop viewport
  await page.setViewportSize({ width: 1440, height: 900 });

  return issues;
}
