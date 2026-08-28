import { CardHeader, CardTitle } from '@/components/ui/primitives';
import SimpleTable from '@/components/ui/data/SimpleTable';
import { fmtCurrency, fmt, cn } from '@/lib/utils';
import { TrendBadge } from './TrendBadge';
import type { PeriodComparisonRow } from '@/hooks/data';

interface ComparisonTableProps {
      comparison: PeriodComparisonRow[];
      period1Label: string;
      period2Label: string;
      loading: boolean;
}

function displayValue(value: number): string {
      return Math.abs(value) > 1000 ? fmtCurrency(value) : fmt(value);
}

const HEADERS = ['Metric', 'Period 1', 'Period 2', 'Change', '% Change'];

export function ComparisonTable({ comparison, period1Label, period2Label, loading }: ComparisonTableProps) {
      return (
            <section className="rounded-lg border border-bg-border bg-bg-panel p-5">
                  <CardHeader>
                        <CardTitle>Period Comparison</CardTitle>
                        <div className="flex flex-wrap gap-2 text-xs font-mono text-ink-muted">
                              <span className="text-accent-gold">{period1Label}</span>
                              <span>vs</span>
                              <span className="text-accent-teal">{period2Label}</span>
                        </div>
                  </CardHeader>
                  {loading ? (
                        <div className="h-48 animate-pulse rounded bg-bg-hover" />
                  ) : (
                        <SimpleTable
                              headers={HEADERS}
                              rows={comparison}
                              getRowKey={(row) => row.metric}
                              emptyMessage="No data for these date ranges."
                              renderCell={(row, columnIndex) => {
                                    switch (columnIndex) {
                                          case 0:
                                                return <span className="text-xs font-body text-ink-primary font-medium">{row.metric}</span>;
                                          case 1:
                                                return <span className="text-xs font-mono text-ink-secondary">{displayValue(Number(row.period_1))}</span>;
                                          case 2:
                                                return <span className="text-xs font-mono text-accent-gold font-medium">{displayValue(Number(row.period_2))}</span>;
                                          case 3:
                                                return (
                                                      <span className={cn('text-xs font-mono', Number(row.change) > 0 ? 'text-accent-teal' : 'text-accent-red')}>
                                                            {Number(row.change) > 0 ? '+' : ''}
                                                            {displayValue(Number(row.change))}
                                                      </span>
                                                );
                                          case 4:
                                                return <TrendBadge pct={Number(row.change_pct)} />;
                                          default:
                                                return null;
                                    }
                              }}
                        />
                  )}
            </section>
      );
}
