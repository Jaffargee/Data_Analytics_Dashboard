import React from 'react';
import {
      Card,
      CardHeader,
      CardTitle,
      ProgressBar,
      EmptyState,
} from '@/components/ui/primitives';
import { DonutChart } from '@/components/charts/DonutChart';
import { fmtCurrency, fmt } from '@/lib/utils';
import type { RevenueByCategory } from '../types';
import type { ChartDataPoint } from '../types';

interface CategoryBreakdownProps {
      catData: RevenueByCategory[];
      donutData: ChartDataPoint[];
}

export function CategoryBreakdown({
      catData,
      donutData,
}: CategoryBreakdownProps) {
      const maxCatRev = Math.max(...catData.map((r) => Number(r.revenue)), 1);

      return (
            <>
                  <Card glow>
                        <CardHeader>
                              <CardTitle>Revenue by Category</CardTitle>
                        </CardHeader>
                        {donutData.length ? (
                              <DonutChart
                                    data={donutData}
                                    size={180}
                                    formatValue={fmtCurrency}
                              />
                        ) : (
                              <EmptyState />
                        )}
                  </Card>
                  <Card>
                        <CardHeader>
                              <CardTitle>Category Breakdown</CardTitle>
                        </CardHeader>
                        <div className="space-y-3">
                              {catData.map((r, i) => (
                                    <div
                                          key={i}
                                          className="flex items-center gap-3"
                                    >
                                          <div className="w-24 shrink-0">
                                                <p className="text-xs font-body text-ink-primary truncate">
                                                      {r.category}
                                                </p>
                                                <p className="text-[10px] font-mono text-ink-muted">
                                                      {fmt(r.units_sold)} units
                                                </p>
                                          </div>
                                          <div className="flex-1">
                                                <ProgressBar
                                                      value={Number(r.revenue)}
                                                      max={maxCatRev}
                                                      accent="gold"
                                                />
                                          </div>
                                          <div className="w-24 text-right shrink-0">
                                                <p className="text-xs font-mono text-accent-gold">
                                                      {fmtCurrency(r.revenue)}
                                                </p>
                                                <p className="text-[10px] font-mono text-ink-muted">
                                                      {fmt(r.transactions)} txns
                                                </p>
                                          </div>
                                    </div>
                              ))}
                        </div>
                  </Card>
            </>
      );
}
