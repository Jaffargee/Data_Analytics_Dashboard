import React from 'react';
import { Card, CardHeader, CardTitle, Badge } from '@/components/ui/primitives';
import { fmtCurrency, fmt } from '@/lib/utils';
import type { DailyBreakdown } from '../types';

interface DailyBreakdownTableProps {
      daily: DailyBreakdown[];
      tradingDays: number;
}

export function DailyBreakdownTable({
      daily,
      tradingDays,
}: DailyBreakdownTableProps) {
      return (
            <Card>
                  <CardHeader>
                        <CardTitle>Day-by-Day Breakdown</CardTitle>
                        <Badge variant="muted">{tradingDays} days</Badge>
                  </CardHeader>
                  <div className="overflow-x-auto">
                        <table className="w-full">
                              <thead>
                                    <tr className="border-b border-bg-border">
                                          {[
                                                'Date',
                                                'Day',
                                                'Revenue',
                                                'Transactions',
                                                'Units',
                                                'Avg Basket',
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
                                    {daily.map((r, i) => (
                                          <tr
                                                key={i}
                                                className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors"
                                          >
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-primary">
                                                      {r.sale_date}
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-body text-ink-secondary">
                                                      {r.day_of_week?.trim()}
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-accent-gold font-medium">
                                                      {fmtCurrency(r.revenue)}
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">
                                                      {fmt(r.transactions)}
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">
                                                      {fmt(r.units_sold)}
                                                </td>
                                                <td className="py-2.5 text-xs font-mono text-ink-secondary">
                                                      {fmtCurrency(
                                                            Number(r.revenue) /
                                                                  Number(
                                                                        r.transactions
                                                                  )
                                                      )}
                                                </td>
                                          </tr>
                                    ))}
                              </tbody>
                        </table>
                  </div>
            </Card>
      );
}
