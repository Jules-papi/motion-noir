import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { QAIssue } from '../types';
import { BASELINES_DIR, SCREENSHOTS_DIR } from '../utils';

export async function runRegressionCheck(page: Page, targetUrl: string, route: string = '/'): Promise<QAIssue[]> {
  const issues: QAIssue[] = [];

  const baselinePath = path.join(BASELINES_DIR, 'baseline-desktop.png');
  const currentPath = path.join(SCREENSHOTS_DIR, 'current-desktop.png');
  const diffPath = path.join(SCREENSHOTS_DIR, 'diff-desktop.png');

  // Set fixed viewport for deterministic regression check
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(targetUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Capture current screenshot
  await page.screenshot({ path: currentPath, fullPage: false });

  // If no baseline exists, establish current as baseline
  if (!fs.existsSync(baselinePath)) {
    fs.copyFileSync(currentPath, baselinePath);
    return issues;
  }

  try {
    const imgBaseline = PNG.sync.read(fs.readFileSync(baselinePath));
    const imgCurrent = PNG.sync.read(fs.readFileSync(currentPath));

    if (imgBaseline.width !== imgCurrent.width || imgBaseline.height !== imgCurrent.height) {
      issues.push({
        severity: 'MEDIUM',
        category: 'Visual',
        route,
        viewport: '1440x900',
        problem: `Visual regression: screenshot dimensions mismatch (${imgCurrent.width}x${imgCurrent.height} vs baseline ${imgBaseline.width}x${imgBaseline.height})`,
        probableCause: 'Viewport or canvas resolution changed'
      });
      return issues;
    }

    const { width, height } = imgBaseline;
    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(
      imgBaseline.data,
      imgCurrent.data,
      diff.data,
      width,
      height,
      { threshold: 0.15 }
    );

    const totalPixels = width * height;
    const diffPercentage = (numDiffPixels / totalPixels) * 100;

    // Allow minor antialiasing drift (< 1.5%)
    if (diffPercentage > 1.5) {
      fs.writeFileSync(diffPath, PNG.sync.write(diff));
      issues.push({
        severity: diffPercentage > 10 ? 'HIGH' : 'MEDIUM',
        category: 'Visual',
        route,
        viewport: '1440x900',
        problem: `Visual regression detected: ${numDiffPixels} pixels (${diffPercentage.toFixed(2)}%) differ from baseline.`,
        screenshot: 'diff-desktop.png',
        probableCause: 'Unexpected visual style change, text displacement, or animation freeze'
      });
    }
  } catch (err: any) {
    issues.push({
      severity: 'LOW',
      category: 'Visual',
      route,
      viewport: '1440x900',
      problem: `Visual regression comparison failed: ${err.message}`,
      probableCause: 'Error reading PNG buffer'
    });
  }

  return issues;
}
