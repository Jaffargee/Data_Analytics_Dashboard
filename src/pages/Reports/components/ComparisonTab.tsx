import { useState } from 'react';
import { usePeriodComparison } from '../hooks/usePeriodComparison';
import { ComparisonTable } from './ComparisonTable';

const INPUT_CLASS =
      'rounded-md border border-bg-border bg-bg-hover px-2.5 py-1.5 text-xs font-mono text-ink-primary focus:outline-none focus:ring-1 focus:ring-accent-gold';

function isoDate(date: Date): string {
      return date.toISOString().split('T')[0];
}

function defaultRanges() {
      const now = new Date();
      const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
            p1From: isoDate(startOfLastMonth),
            p1To: isoDate(endOfLastMonth),
            p2From: isoDate(startOfThisMonth),
            p2To: isoDate(now),
      };
}

export function ComparisonTab() {
      const defaults = defaultRanges();
      const [p1From, setP1From] = useState<string>(defaults.p1From);
      const [p1To, setP1To] = useState<string>(defaults.p1To);
      const [p2From, setP2From] = useState<string>(defaults.p2From);
      const [p2To, setP2To] = useState<string>(defaults.p2To);

      const comparison = usePeriodComparison(p1From, p1To, p2From, p2To);
      const rows = comparison.data?.data ?? [];

      return (
            <div className="space-y-5">
                  <div className="rounded-lg border border-bg-border bg-bg-panel p-5 flex flex-col lg:flex-row gap-6">
                        <div>
                              <p className="text-[10px] uppercase tracking-wide text-accent-gold mb-2">Period 1</p>
                              <div className="flex items-center gap-2">
                                    <input type="date" className={INPUT_CLASS} value={p1From} onChange={(e) => setP1From(e.target.value)} />
                                    <span className="text-ink-faint text-xs">→</span>
                                    <input type="date" className={INPUT_CLASS} value={p1To} onChange={(e) => setP1To(e.target.value)} />
                              </div>
                        </div>
                        <div>
                              <p className="text-[10px] uppercase tracking-wide text-accent-teal mb-2">Period 2</p>
                              <div className="flex items-center gap-2">
                                    <input type="date" className={INPUT_CLASS} value={p2From} onChange={(e) => setP2From(e.target.value)} />
                                    <span className="text-ink-faint text-xs">→</span>
                                    <input type="date" className={INPUT_CLASS} value={p2To} onChange={(e) => setP2To(e.target.value)} />
                              </div>
                        </div>
                  </div>

                  <ComparisonTable
                        comparison={rows}
                        period1Label={`${p1From} → ${p1To}`}
                        period2Label={`${p2From} → ${p2To}`}
                        loading={comparison.isLoading}
                  />
            </div>
      );
}
