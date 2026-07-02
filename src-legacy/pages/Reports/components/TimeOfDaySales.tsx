import React from 'react';
import {
      Card,
      CardHeader,
      CardTitle,
      ProgressBar,
} from '@/components/ui/primitives';
import { fmtCurrency, fmt } from '@/lib/utils';
import type { TimeIntelligence } from '../types';

interface TimeOfDaySalesProps {
      timingData: TimeIntelligence[];
}

export function TimeOfDaySales({ timingData }: TimeOfDaySalesProps) {
      const sortedData = [...timingData].sort(
            (a, b) => a.sort_order - b.sort_order
      );
      const maxRev = Math.max(...sortedData.map((x) => Number(x.revenue)), 1);

      return (
            <Card glow>
                  <CardHeader>
                        <CardTitle>Sales by Time of Day</CardTitle>
                  </CardHeader>
                  <div className="space-y-3 pt-2">
                        {sortedData.map((r, i) => (
                              <div key={i} className="flex items-center gap-3">
                                    <div className="w-36 shrink-0">
                                          <p className="text-xs font-body text-ink-primary">
                                                {r.time_bucket}
                                          </p>
                                          <p className="text-[10px] font-mono text-ink-muted">
                                                {fmt(r.transactions)} txns
                                          </p>
                                    </div>
                                    <div className="flex-1">
                                          <ProgressBar
                                                value={Number(r.revenue)}
                                                max={maxRev}
                                                accent="teal"
                                          />
                                    </div>
                                    <p className="w-28 text-right text-xs font-mono text-accent-teal shrink-0">
                                          {fmtCurrency(r.revenue)}
                                    </p>
                              </div>
                        ))}
                  </div>
            </Card>
      );
}
