import { CardHeader, CardTitle, EmptyState } from '@/components/ui/primitives';
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

export function ComparisonTable({ comparison, period1Label, period2Label, loading }: ComparisonTableProps) {
      return (
            <section className="rounded-lg border border-bg-border bg-bg-panel p-5">
                  <CardHeader>
                        <CardTitle>Period Comparison</CardTitle>
                        <div className="flex gap-2 text-xs font-mono text-ink-muted">
                              <span className="text-accent-gold">{period1Label}</span>
                              <span>vs</span>
                              <span className="text-accent-teal">{period2Label}</span>
                        </div>
                  </CardHeader>
                  {loading ? (
                        <div className="h-48 animate-pulse rounded bg-bg-hover" />
                  ) : (
                        <div className="overflow-x-auto">
                              <table className="w-full">
                                    <thead>
                                          <tr className="border-b border-bg-border">
                                                {['Metric', 'Period 1', 'Period 2', 'Change', '% Change'].map((h) => (
                                                      <th
                                                            key={h}
                                                            className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted"
                                                      >
                                                            {h}
                                                      </th>
                                                ))}
                                          </tr>
                                    </thead>
                                    <tbody>
                                          {comparison.map((row) => (
                                                <tr
                                                      key={row.metric}
                                                      className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors"
                                                >
                                                      <td className="py-3 pr-4 text-xs font-body text-ink-primary font-medium">
                                                            {row.metric}
                                                      </td>
                                                      <td className="py-3 pr-4 text-xs font-mono text-ink-secondary">
                                                            {displayValue(Number(row.period_1))}
                                                      </td>
                                                      <td className="py-3 pr-4 text-xs font-mono text-accent-gold font-medium">
                                                            {displayValue(Number(row.period_2))}
                                                      </td>
                                                      <td className="py-3 pr-4 text-xs font-mono">
                                                            <span className={cn(Number(row.change) > 0 ? 'text-accent-teal' : 'text-accent-red')}>
                                                                  {Number(row.change) > 0 ? '+' : ''}
                                                                  {displayValue(Number(row.change))}
                                                            </span>
                                                      </td>
                                                      <td className="py-3">
                                                            <TrendBadge pct={Number(row.change_pct)} />
                                                      </td>
                                                </tr>
                                          ))}
                                    </tbody>
                              </table>
                              {!comparison.length && <EmptyState message="No data for these date ranges." />}
                        </div>
                  )}
            </section>
      );
}
