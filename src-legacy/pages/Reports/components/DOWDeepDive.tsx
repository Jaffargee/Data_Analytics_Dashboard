import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/primitives';
import { fmtCurrency, fmt } from '@/lib/utils';
import type { RevenueByDow } from '../types';

interface DOWDeepDiveProps {
      dowData: RevenueByDow[];
}

export function DOWDeepDive({ dowData }: DOWDeepDiveProps) {
      const totalWeekRev = dowData.reduce((s, x) => s + Number(x.revenue), 0);

      return (
            <Card>
                  <CardHeader>
                        <CardTitle>Day of Week Deep Dive</CardTitle>
                  </CardHeader>
                  <div className="overflow-x-auto">
                        <table className="w-full">
                              <thead>
                                    <tr className="border-b border-bg-border">
                                          {[
                                                'Day',
                                                'Revenue',
                                                'Transactions',
                                                'Units Sold',
                                                '% of Week',
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
                                    {dowData
                                          .sort((a, b) => a.dow_num - b.dow_num)
                                          .map((r, i) => (
                                                <tr
                                                      key={i}
                                                      className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors"
                                                >
                                                      <td className="py-2.5 pr-4 text-xs font-body text-ink-primary">
                                                            {r.day_of_week?.trim()}
                                                      </td>
                                                      <td className="py-2.5 pr-4 text-xs font-mono text-accent-gold font-medium">
                                                            {fmtCurrency(
                                                                  r.revenue
                                                            )}
                                                      </td>
                                                      <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">
                                                            {fmt(
                                                                  r.transactions
                                                            )}
                                                      </td>
                                                      <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">
                                                            {fmt(r.units_sold)}
                                                      </td>
                                                      <td className="py-2.5 text-xs font-mono text-ink-muted">
                                                            {(
                                                                  (Number(
                                                                        r.revenue
                                                                  ) /
                                                                        totalWeekRev) *
                                                                  100
                                                            ).toFixed(1)}
                                                            %
                                                      </td>
                                                </tr>
                                          ))}
                              </tbody>
                        </table>
                  </div>
            </Card>
      );
}
