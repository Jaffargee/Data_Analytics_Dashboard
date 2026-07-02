import React from 'react';
import { Card, CardHeader, CardTitle, ProgressBar } from '@/components/ui/primitives';
import { fmtCurrency, fmt } from '@/lib/utils';

interface CategoryPerfProps {
      data: Array<{
            category: string;
            total_revenue: number | string;
            total_qty_sold: number | string;
            num_items: number | string;
      }>;
}

export function CategoryPerformance({ data }: CategoryPerfProps) {
      const maxCat = Math.max(...data.map((x) => Number(x.total_revenue)), 1);

      return (
            <Card>
                  <CardHeader>
                        <CardTitle>Category Performance</CardTitle>
                  </CardHeader>
                  <div className="space-y-3">
                        {data.map((c, i) => {
                              const rev = Number(c.total_revenue);
                              return (
                                    <div key={i} className="flex items-center gap-4">
                                          <div className="w-32 shrink-0">
                                                <p className="text-xs font-body text-ink-primary truncate">
                                                      {c.category}
                                                </p>
                                                <p className="text-[10px] font-mono text-ink-muted">
                                                      {fmt(c.num_items)} items
                                                </p>
                                          </div>
                                          <div className="flex-1">
                                                <ProgressBar value={rev} max={maxCat} accent="gold" />
                                          </div>
                                          <div className="w-28 text-right shrink-0">
                                                <p className="text-xs font-mono text-accent-gold">
                                                      {fmtCurrency(rev)}
                                                </p>
                                                <p className="text-[10px] font-mono text-ink-muted">
                                                      {fmt(c.total_qty_sold)} units
                                                </p>
                                          </div>
                                    </div>
                              );
                        })}
                  </div>
            </Card>
      );
}