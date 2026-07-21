import React from 'react';
import {
      Card,
      CardHeader,
      CardTitle,
      EmptyState,
} from '@/components/ui/primitives';
import { fmtCurrency, fmt, cn } from '@/lib/utils';
import { TrendBadge } from './TrendBadge';
import { PERIOD1_DEFAULT } from '../constants';
import type { Comparison } from '../types';

interface ComparisonTableProps {
      comparison: Comparison[];
      period1Label: string;
      period2Label: string;
}

export function ComparisonTable({
      comparison,
      period1Label,
      period2Label,
}: ComparisonTableProps) {
      return (
            <Card>
                  <CardHeader>
                        <CardTitle>Period Comparison</CardTitle>
                        <div className="flex gap-2 text-xs font-mono text-ink-muted">
                              <span className="text-accent-gold">
                                    {period1Label}
                              </span>
                              <span>vs</span>
                              <span className="text-accent-teal">
                                    {period2Label}
                              </span>
                        </div>
                  </CardHeader>
                  <div className="overflow-x-auto">
                        <table className="w-full">
                              <thead>
                                    <tr className="border-b border-bg-border">
                                          {[
                                                'Metric',
                                                'Period 1 (31 Mar–11 Apr)',
                                                'Period 2 (Selected)',
                                                'Change',
                                                '% Change',
                                          ].map((h) => (
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
                                    {comparison.map((r, i) => (
                                          <tr
                                                key={i}
                                                className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors"
                                          >
                                                <td className="py-3 pr-4 text-xs font-body text-ink-primary font-medium">
                                                      {r.metric}
                                                </td>
                                                <td className="py-3 pr-4 text-xs font-mono text-ink-secondary">
                                                      {Number(r.period_1) > 1000
                                                            ? fmtCurrency(
                                                                    r.period_1
                                                              )
                                                            : fmt(r.period_1)}
                                                </td>
                                                <td className="py-3 pr-4 text-xs font-mono text-accent-gold font-medium">
                                                      {Number(r.period_2) > 1000
                                                            ? fmtCurrency(
                                                                    r.period_2
                                                              )
                                                            : fmt(r.period_2)}
                                                </td>
                                                <td className="py-3 pr-4 text-xs font-mono">
                                                      <span
                                                            className={cn(
                                                                  Number(
                                                                        r.change
                                                                  ) > 0
                                                                        ? 'text-accent-teal'
                                                                        : 'text-accent-red'
                                                            )}
                                                      >
                                                            {Number(r.change) >
                                                            0
                                                                  ? '+'
                                                                  : ''}
                                                            {Number(r.change) >
                                                            1000
                                                                  ? fmtCurrency(
                                                                          r.change
                                                                    )
                                                                  : fmt(
                                                                          r.change
                                                                    )}
                                                      </span>
                                                </td>
                                                <td className="py-3">
                                                      <TrendBadge
                                                            pct={Number(
                                                                  r.change_pct
                                                            )}
                                                      />
                                                </td>
                                          </tr>
                                    ))}
                              </tbody>
                        </table>
                        {!comparison.length && <EmptyState />}
                  </div>
            </Card>
      );
}
