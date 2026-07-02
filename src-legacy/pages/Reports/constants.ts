import { accounts_summary_report, todays_sales_report } from '@/constants';

export const PRESETS = [
      { label: 'Last 7 days', days: 7 },
      { label: 'Last 14 days', days: 14 },
      { label: 'Last 30 days', days: 30 },
      { label: 'Last 60 days', days: 60 },
      { label: 'Last 90 days', days: 90 },
];

export const PERIOD1_DEFAULT = { from: '2026-03-31', to: '2026-04-11' };
export const PERIOD2_DEFAULT = { from: '2026-04-11', to: '2026-04-26' };

export const DONUT_COLORS = [
      '#f5c842',
      '#2dd4bf',
      '#a78bfa',
      '#f87171',
      '#fb923c',
      '#34d399',
      '#60a5fa',
];

export const TAB_VALUES = [
      'overview',
      'timing',
      'products',
      'prices',
      'customers',
      'comparison',
] as const;

export type TabValue = (typeof TAB_VALUES)[number];

export const REPORT_TYPES = ['summary', 'sales'] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export { accounts_summary_report, todays_sales_report };
