import { Page } from '@playwright/test';
import * as path from 'path';
import { QAIssue } from '../types';
import { SCREENSHOTS_DIR } from '../utils';

export async function runVisualCheck(page: Page, route: string = '/'): Promise<QAIssue[]> {
  const issues: QAIssue[] = [];

  // Take screenshot
  const screenshotFilename = `visual-${Date.now()}.png`;
  const screenshotPath = path.join(SCREENSHOTS_DIR, screenshotFilename);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // Evaluate DOM for visual defects
  const visualDefects = await page.evaluate(() => {
    const defects: Array<{ type: string; element: string; details: string }> = [];

    // 1. Check for horizontal overflow
    const docWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    if (scrollWidth > docWidth + 2) {
      defects.push({
        type: 'HorizontalOverflow',
        element: 'document.documentElement',
        details: `Scroll width (${scrollWidth}px) exceeds client width (${docWidth}px) by ${scrollWidth - docWidth}px.`
      });
    }

    // 2. Check for clipped or hidden text in buttons and headers
    const textContainers = Array.from(document.querySelectorAll('button, h1, h2, h3, p, span, a'));
    for (const el of textContainers) {
      const style = window.getComputedStyle(el);
      // If overflow is hidden and scrollWidth > clientWidth, text may be clipped unintentionally
      if (
        (style.overflow === 'hidden' || style.overflowX === 'hidden') &&
        el.scrollWidth > el.clientWidth + 5 &&
        style.textOverflow !== 'ellipsis' &&
        el.children.length === 0 &&
        el.textContent && el.textContent.trim().length > 0
      ) {
        const tag = el.tagName.toLowerCase();
        const classes = el.className ? `.${el.className.split(' ').slice(0, 2).join('.')}` : '';
        defects.push({
          type: 'TextClipped',
          element: `${tag}${classes}`,
          details: `Text "${el.textContent.slice(0, 30)}..." is clipped without ellipsis. scrollWidth: ${el.scrollWidth}, clientWidth: ${el.clientWidth}`
        });
      }
    }

    // 3. Check for overlapping interactive elements (buttons, links)
    const interactives = Array.from(document.querySelectorAll('button, a, input, select, textarea'))
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
      });

    for (let i = 0; i < interactives.length; i++) {
      for (let j = i + 1; j < interactives.length; j++) {
        const a = interactives[i];
        const b = interactives[j];
        if (a.contains(b) || b.contains(a)) continue;

        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();

        const overlapX = Math.max(0, Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left));
        const overlapY = Math.max(0, Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top));
        const overlapArea = overlapX * overlapY;

        // If significant collision
        if (overlapArea > 50 && rectA.width > 0 && rectB.width > 0) {
          const areaA = rectA.width * rectA.height;
          const areaB = rectB.width * rectB.height;
          if (overlapArea / Math.min(areaA, areaB) > 0.4) {
            defects.push({
              type: 'InteractiveCollision',
              element: `${a.tagName.toLowerCase()} & ${b.tagName.toLowerCase()}`,
              details: `Interactive elements overlap significantly by ${Math.round(overlapArea)}px²`
            });
          }
        }
      }
    }

    return defects;
  });

  for (const defect of visualDefects) {
    issues.push({
      severity: defect.type === 'HorizontalOverflow' ? 'HIGH' : 'MEDIUM',
      category: 'Visual',
      route,
      viewport: `${page.viewportSize()?.width}x${page.viewportSize()?.height}`,
      element: defect.element,
      problem: `[${defect.type}] ${defect.details}`,
      screenshot: screenshotFilename,
      probableCause: defect.type === 'HorizontalOverflow' ? 'Fixed width element or unconstrained flex item' : 'CSS styling conflict'
    });
  }

  return issues;
}
