import React from 'react';
import {
      Card,
      CardHeader,
      CardTitle,
      ProgressBar,
} from '@/components/ui/primitives';
import { fmtCurrency, fmt, cn } from '@/lib/utils';
import type { PriceSensitivity } from '../types';

interface PriceSensitivityTableProps {
      prices: PriceSensitivity[];
}

export function PriceSensitivityTable({ prices }: PriceSensitivityTableProps) {
      return (
            <Card>
                  <CardHeader>
                        <CardTitle>Price Sensitivity Analysis</CardTitle>
                  </CardHeader>
                  <div className="overflow-x-auto">
                        <table className="w-full">
                              <thead>
                                    <tr className="border-b border-bg-border">
                                          {[
                                                'Price Range',
                                                'Line Items',
                                                'Units Sold',
                                                'Revenue',
                                                '% of Revenue',
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
                                    {prices.map((r, i) => (
                                          <tr
                                                key={i}
                                                className={cn(
                                                      'border-b border-bg-border/40 hover:bg-bg-hover transition-colors',
                                                      r.price_bucket ===
                                                            '10-20k' &&
                                                            'bg-accent-gold/5'
                                                )}
                                          >
                                                <td className="py-2.5 pr-4">
                                                      <span
                                                            className={cn(
                                                                  'text-xs font-mono',
                                                                  r.price_bucket ===
                                                                        '10-20k'
                                                                        ? 'text-accent-gold font-medium'
                                                                        : 'text-ink-primary'
                                                            )}
                                                      >
                                                            {r.price_bucket}
                                                            {r.price_bucket ===
                                                                  '10-20k' && (
                                                                  <span className="ml-2 text-[10px] text-accent-gold">
                                                                        ★ Sweet
                                                                        Spot
                                                                  </span>
                                                            )}
                                                      </span>
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">
                                                      {fmt(r.line_items)}
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-ink-secondary">
                                                      {fmt(r.units_sold)}
                                                </td>
                                                <td className="py-2.5 pr-4 text-xs font-mono text-accent-gold font-medium">
                                                      {fmtCurrency(r.revenue)}
                                                </td>
                                                <td className="py-2.5">
                                                      <div className="flex items-center gap-2">
                                                            <ProgressBar
                                                                  value={Number(
                                                                        r.pct_of_revenue
                                                                  )}
                                                                  max={100}
                                                                  accent="gold"
                                                                  className="w-16"
                                                            />
                                                            <span className="text-xs font-mono text-ink-muted">
                                                                  {Number(
                                                                        r.pct_of_revenue
                                                                  ).toFixed(1)}
                                                                  %
                                                            </span>
                                                      </div>
                                                </td>
                                          </tr>
                                    ))}
                              </tbody>
                        </table>
                  </div>
            </Card>
      );
}
