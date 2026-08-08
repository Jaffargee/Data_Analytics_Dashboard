import { useMemo, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import type { EChartsOption } from 'echarts';
import { TopBar } from '@/components/ui/TopBar';
import EChart from '@/components/charts/EChart';
import { CardHeader, CardTitle, EmptyState, StatCard } from '@/components/ui/primitives';
import { useRevenueDaily, useRevenueMonthly, useRevenueRange } from '@/hooks/data';
import { fmt, fmtCurrency, fmtMonthLabel, nDaysAgo, today } from '@/lib/utils';

const chartBase = {
      backgroundColor: 'transparent',
      grid: { left: 64, right: 24, top: 24, bottom: 48 },
      tooltip: { trigger: 'axis', valueFormatter: (value) => fmtCurrency(Number(value)) },
      xAxis: { type: 'category', axisLabel: { color: '#8A8578', rotate: 30 }, axisLine: { lineStyle: { color: '#3A342A' } } },
      yAxis: { type: 'value', axisLabel: { color: '#8A8578', formatter: (value: number) => fmtCurrency(value) }, splitLine: { lineStyle: { color: 'rgba(138,133,120,.18)', type: 'dashed' } } },
} satisfies EChartsOption;

export default function RevenuePage() {
      const [from, setFrom] = useState(nDaysAgo(30));
      const [to, setTo] = useState(today());
      const daily = useRevenueDaily(90);
      const monthly = useRevenueMonthly();
      const range = useRevenueRange(from, to);
      const months = useMemo(() => [...(monthly.data?.data ?? [])].reverse(), [monthly.data]);
      const latest = months[months.length - 1];
      const previous = months[months.length - 2];
      const mom = latest && previous && Number(previous.revenue) !== 0
            ? ((Number(latest.revenue) - Number(previous.revenue)) / Number(previous.revenue)) * 100 : null;
      const totalRevenue = months.reduce((sum, row) => sum + Number(row.revenue), 0);
      const totalSales = months.reduce((sum, row) => sum + Number(row.num_sales), 0);

      const makeOption = (rows: { label: string; value: number }[], type: 'bar' | 'line', color: string): EChartsOption => ({
            ...chartBase,
            xAxis: { ...chartBase.xAxis, data: rows.map((row) => row.label) },
            series: [{ type, data: rows.map((row) => row.value), smooth: type === 'line', symbol: 'none', barMaxWidth: 34, itemStyle: { color, borderRadius: type === 'bar' ? [4, 4, 0, 0] : undefined }, lineStyle: { color, width: 3 }, areaStyle: type === 'line' ? { color: `${color}33` } : undefined }],
      });
      const monthlyRows = months.slice(-12).map((row) => ({ label: fmtMonthLabel(row.month), value: Number(row.revenue) }));
      const dailyRows = [...(daily.data?.data ?? [])].reverse().slice(-30).map((row) => ({ label: row.sale_date.slice(5), value: Number(row.revenue) }));
      const rangeRows = [...(range.data?.data ?? [])].reverse().map((row) => ({ label: row.sale_date.slice(5), value: Number(row.revenue) }));

      return <div className="flex-1 flex flex-col min-h-screen">
            <TopBar title="Revenue" subtitle="Revenue performance across every sales period" />
            <main className="flex-1 p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <StatCard label="All-Time Revenue" value={fmtCurrency(totalRevenue)} accent="gold" delay={0} />
                        <StatCard label="Total Transactions" value={fmt(totalSales)} accent="teal" delay={100} />
                        <StatCard label="Latest Month" value={fmtCurrency(Number(latest?.revenue ?? 0))} accent="purple" delay={200} />
                        <StatCard label="MoM Change" value={mom === null ? '—' : `${mom >= 0 ? '+' : ''}${mom.toFixed(1)}%`} accent={mom !== null && mom >= 0 ? 'teal' : 'red'} delay={300} />
                  </div>
                  <Tabs.Root defaultValue="monthly">
                        <Tabs.List className="flex w-fit gap-1 rounded-lg border border-bg-border bg-bg-panel p-1">
                              {['monthly', 'daily', 'custom'].map((value) => <Tabs.Trigger key={value} value={value} className="rounded-md px-4 py-1.5 text-xs capitalize text-ink-muted data-[state=active]:bg-accent-gold/15 data-[state=active]:text-accent-gold">{value}</Tabs.Trigger>)}
                        </Tabs.List>
                        <RevenuePanel value="monthly" title="Monthly Revenue Trend" rows={monthlyRows} option={makeOption(monthlyRows, 'bar', '#f5c842')} loading={monthly.isLoading} />
                        <RevenuePanel value="daily" title="Daily Revenue — last 30 days" rows={dailyRows} option={makeOption(dailyRows, 'line', '#2dd4bf')} loading={daily.isLoading} />
                        <Tabs.Content value="custom" className="mt-5 space-y-4">
                              <div className="flex flex-wrap items-end gap-3 rounded-lg border border-bg-border bg-bg-panel p-4">
                                    <label className="text-xs text-ink-muted">From<input className="ml-2 rounded border border-bg-border bg-bg-base p-2 text-ink-primary" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
                                    <label className="text-xs text-ink-muted">To<input className="ml-2 rounded border border-bg-border bg-bg-base p-2 text-ink-primary" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
                              </div>
                              <RevenuePanel value="visible" title="Custom Revenue Trend" rows={rangeRows} option={makeOption(rangeRows, 'line', '#a78bfa')} loading={range.isLoading} />
                        </Tabs.Content>
                  </Tabs.Root>
            </main>
      </div>;
}

function RevenuePanel({ value, title, rows, option, loading }: { value: string; title: string; rows: { label: string; value: number }[]; option: EChartsOption; loading: boolean }) {
      const content = <section className="mt-5 rounded-lg border border-bg-border bg-bg-panel p-5"><CardHeader><CardTitle>{title}</CardTitle></CardHeader>{loading ? <div className="h-72 animate-pulse rounded bg-bg-hover" /> : rows.length ? <EChart option={option} height="288px" /> : <EmptyState message="No revenue is recorded for this period." />}</section>;
      return value === 'visible' ? content : <Tabs.Content value={value}>{content}</Tabs.Content>;
}
