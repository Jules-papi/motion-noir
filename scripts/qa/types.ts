export type QASeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface QAIssue {
  severity: QASeverity;
  category: 'Functional' | 'Visual' | 'Responsive' | 'Accessibility' | 'Console' | 'Network' | 'Data Stress';
  route: string;
  viewport: string;
  element?: string;
  problem: string;
  screenshot?: string;
  relevantLog?: string;
  probableCause?: string;
}

export interface QAEnvironment {
  url: string;
  framework: string;
  browser: string;
  viewport: string;
  timestamp: string;
}

export interface QAResults {
  functional: boolean;
  visual: boolean;
  responsive: boolean;
  accessibility: boolean;
  console: boolean;
  network: boolean;
  dataStress: boolean;
  visualRegression: boolean;
  issues: QAIssue[];
  environment: QAEnvironment;
}
