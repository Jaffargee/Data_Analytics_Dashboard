import { useState } from 'react';
import type { EChartsOption } from 'echarts';
import EChart from '@/components/charts/EChart';
import { CardHeader, CardTitle, EmptyState } from '@/components/ui/primitives';
import { usePeriodRevenueByDow } from '../hooks/usePeriodReports';
import { fmtCurrency, fmt } from '@/lib/utils';
import { CHART_COLORS } from '@/lib/constants/colors';

const INPUT_CLASS =
      'rounded-md border border-bg-border bg-bg-hover px-2.5 py-1.5 text-xs font-mono text-ink-primary focus:outline-none focus:ring-1 focus:ring-accent-gold';

function isoDate(date: Date): string {
      return date.toISOString().split('T')[0];
}

export function TimingTab() {
      const now = new Date();
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);

      const [from, setFrom] = useState<string>(isoDate(monthAgo));
      const [to, setTo] = useState<string>(isoDate(now));

      const dow = usePeriodRevenueByDow(from, to);
      const rows = [...(dow.data?.data ?? [])].sort((a, b) => a.dow_num - b.dow_num);

      const option: EChartsOption = {
            backgroundColor: 'transparent',
            grid: { left: 64, right: 24, top: 24, bottom: 48 },
            tooltip: {
                  trigger: 'axis',
                  axisPointer: { type: 'shadow' },
                  valueFormatter: (value) => fmtCurrency(Number(value)),
            },
            xAxis: {
                  type: 'category',
                  data: rows.map((row) => row.day_of_week),
                  axisLabel: { color: '#8A8578' },
                  axisLine: { lineStyle: { color: '#3A342A' } },
            },
            yAxis: {
                  type: 'value',
                  axisLabel: { color: '#8A8578', formatter: (value: number) => fmtCurrency(value) },
                  splitLine: { lineStyle: { color: 'rgba(138,133,120,.18)', type: 'dashed' } },
            },
            series: [
                  {
                        type: 'bar',
                        barMaxWidth: 40,
                        data: rows.map((row) => ({ value: Number(row.revenue), itemStyle: { color: CHART_COLORS.gold, borderRadius: [4, 4, 0, 0] } })),
                  },
            ],
      };

      return (
            <div className="space-y-5">
                  <div className="rounded-lg border border-bg-border bg-bg-panel p-5">
                        <p className="text-[10px] uppercase tracking-wide text-ink-faint mb-2">Date Range</p>
                        <div className="flex items-center gap-2">
                              <input type="date" className={INPUT_CLASS} value={from} onChange={(e) => setFrom(e.target.value)} />
                              <span className="text-ink-faint text-xs">→</span>
                              <input type="date" className={INPUT_CLASS} value={to} onChange={(e) => setTo(e.target.value)} />
                        </div>
                  </div>

                  <section className="rounded-lg border border-bg-border bg-bg-panel p-5">
                        <CardHeader><CardTitle>Revenue by Day of Week</CardTitle></CardHeader>
                        {dow.isLoading ? (
                              <div className="h-64 animate-pulse rounded bg-bg-hover" />
                        ) : rows.length ? (
                              <EChart option={option} height="280px" />
                        ) : (
                              <EmptyState message="No sales in this range." />
                        )}
                  </section>

                  {!dow.isLoading && rows.length > 0 && (
                        <section className="rounded-lg border border-bg-border bg-bg-panel p-5 overflow-x-auto">
                              <table className="w-full">
                                    <thead>
                                          <tr className="border-b border-bg-border">
                                                {['Day', 'Transactions', 'Units Sold', 'Revenue'].map((h) => (
                                                      <th key={h} className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted">{h}</th>
                                                ))}
                                          </tr>
                                    </thead>
                                    <tbody>
                                          {rows.map((row) => (
                                                <tr key={row.dow_num} className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors">
                                                      <td className="py-3 pr-4 text-xs font-body text-ink-primary font-medium">{row.day_of_week}</td>
                                                      <td className="py-3 pr-4 text-xs font-mono text-ink-secondary">{fmt(row.transactions)}</td>
                                                      <td className="py-3 pr-4 text-xs font-mono text-ink-secondary">{fmt(row.units_sold)}</td>
                                                      <td className="py-3 pr-4 text-xs font-mono text-accent-gold font-medium">{fmtCurrency(row.revenue)}</td>
                                                </tr>
                                          ))}
                                    </tbody>
                              </table>
                        </section>
                  )}
            </div>
      );
}
