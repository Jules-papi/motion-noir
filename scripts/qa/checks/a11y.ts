import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { QAIssue, QASeverity } from '../types';

export async function runA11yCheck(page: Page, route: string = '/'): Promise<QAIssue[]> {
  const issues: QAIssue[] = [];

  try {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    for (const v of results.violations) {
      let severity: QASeverity = 'LOW';
      if (v.impact === 'critical') severity = 'CRITICAL';
      else if (v.impact === 'serious') severity = 'HIGH';
      else if (v.impact === 'moderate') severity = 'MEDIUM';

      const firstNode = v.nodes[0];
      const targetSelector = firstNode ? firstNode.target.join(' ') : 'unknown';
      const htmlSnippet = firstNode ? firstNode.html.slice(0, 100) : '';

      issues.push({
        severity,
        category: 'Accessibility',
        route,
        viewport: `${page.viewportSize()?.width}x${page.viewportSize()?.height}`,
        element: targetSelector,
        problem: `[${v.id}] ${v.help} (${v.description}). Violating node: \`${htmlSnippet}\``,
        probableCause: `WCAG compliance failure: ${v.helpUrl}`
      });
    }
  } catch (err: any) {
    issues.push({
      severity: 'MEDIUM',
      category: 'Accessibility',
      route,
      viewport: `${page.viewportSize()?.width}x${page.viewportSize()?.height}`,
      problem: `Axe accessibility analysis encountered an error: ${err.message}`,
      probableCause: 'Execution failure in accessibility crawler'
    });
  }

  return issues;
}
