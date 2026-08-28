import { useMemo, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import type { EChartsOption } from 'echarts';
import { TopBar } from '@/components/ui/TopBar';
import EChart from '@/components/charts/EChart';
import { CardHeader, CardTitle, EmptyState, StatCard } from '@/components/ui/primitives';
import { useRevenueDaily, useRevenueMonthly, useRevenueRange, usePayments, useRevenueSummary } from '@/hooks/data';
import { fmt, fmtCurrency, fmtMonthLabel, nDaysAgo, today } from '@/lib/utils';
import { CHART_COLORS } from '@/lib/constants/colors';
import { TAB_LIST_CLASS, TAB_TRIGGER_CLASS, STICKY_TAB_WRAPPER_CLASS } from '@/lib/constants/tabs';

const chartBase = {
      backgroundColor: 'transparent',
      grid: { left: 64, right: 24, top: 24, bottom: 48 },
      tooltip: { trigger: 'axis', valueFormatter: (value) => fmtCurrency(Number(value)) },
      xAxis: { type: 'category', axisLabel: { color: '#8A8578', rotate: 30 }, axisLine: { lineStyle: { color: '#3A342A' } } },
      yAxis: { type: 'value', axisLabel: { color: '#8A8578', formatter: (value: number) => fmtCurrency(value) }, splitLine: { lineStyle: { color: 'rgba(138,133,120,.18)', type: 'dashed' } } },
} satisfies EChartsOption;

const PAYMENT_PALETTE: readonly string[] = Object.values(CHART_COLORS);

interface PaymentSlice {
      name: string;
      value: number;
      itemStyle: { color: string };
}

function buildPaymentOption(slices: PaymentSlice[]): EChartsOption {
      return {
            backgroundColor: 'transparent',
            tooltip: { trigger: 'item', valueFormatter: (value) => fmtCurrency(Number(value)) },
            legend: {
                  orient: 'vertical',
                  right: 0,
                  top: 'middle',
                  textStyle: { color: '#8A8578', fontSize: 11 },
                  itemWidth: 10,
                  itemHeight: 10,
                  icon: 'circle',
            },
            series: [
                  {
                        type: 'pie',
                        radius: ['50%', '75%'],
                        center: ['38%', '50%'],
                        avoidLabelOverlap: true,
                        label: { show: false },
                        labelLine: { show: false },
                        data: slices,
                  },
            ],
      };
}

export default function RevenuePage() {
      const [from, setFrom] = useState(nDaysAgo(30));
      const [to, setTo] = useState(today());
      const daily = useRevenueDaily(90);
      const monthly = useRevenueMonthly();
      const range = useRevenueRange(from, to);
      const payments = usePayments();
      const revSummary = useRevenueSummary(30);
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

      const paymentBreakdown = useMemo(() => {
            const rows = payments.data?.data ?? [];
            const byAccount = new Map<string, number>();
            for (const row of rows) {
                  const key = row.account ?? 'Unknown';
                  const current = byAccount.get(key) ?? 0;
                  byAccount.set(key, current + Number(row.amount));
            }
            const slices: PaymentSlice[] = Array.from(byAccount.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, value], index) => ({
                        name,
                        value,
                        itemStyle: { color: PAYMENT_PALETTE[index % PAYMENT_PALETTE.length] },
                  }));
            return slices;
      }, [payments.data]);
      const paymentOption = useMemo(() => buildPaymentOption(paymentBreakdown), [paymentBreakdown]);

      const returnsSummary = useMemo(() => {
            const rows = revSummary.data?.data ?? [];
            const itemsSold = rows.reduce((sum, row) => sum + Number(row.total_items_sold), 0);
            const itemsReturned = rows.reduce((sum, row) => sum + Number(row.total_items_returned), 0);
            const returnRate = itemsSold > 0 ? (itemsReturned / itemsSold) * 100 : 0;
            return { itemsSold, itemsReturned, returnRate };
      }, [revSummary.data]);

      return <div className="flex-1 flex flex-col min-h-screen">
            <TopBar title="Revenue" subtitle="Revenue performance across every sales period" />
            <main className="flex-1 p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <StatCard label="All-Time Revenue" value={fmtCurrency(totalRevenue)} accent="gold" delay={0} />
                        <StatCard label="Total Transactions" value={fmt(totalSales)} accent="teal" delay={100} />
                        <StatCard label="Latest Month" value={fmtCurrency(Number(latest?.revenue ?? 0))} accent="purple" delay={200} />
                        <StatCard label="MoM Change" value={mom === null ? '—' : `${mom >= 0 ? '+' : ''}${mom.toFixed(1)}%`} accent={mom !== null && mom >= 0 ? 'teal' : 'red'} delay={300} />
                  </div>
                  <section className="rounded-lg border border-bg-border bg-bg-panel p-5">
                        <CardHeader><CardTitle>Revenue by Payment Method</CardTitle></CardHeader>
                        {payments.isLoading ? (
                              <div className="h-72 animate-pulse rounded bg-bg-hover" />
                        ) : paymentBreakdown.length ? (
                              <EChart option={paymentOption} height="240px" />
                        ) : (
                              <EmptyState message="No payment records found." />
                        )}
                  </section>
                  <section className="rounded-lg border border-bg-border bg-bg-panel p-5">
                        <CardHeader>
                              <CardTitle>Returns</CardTitle>
                              <span className="text-[10px] text-ink-faint">Last 30 days</span>
                        </CardHeader>
                        {revSummary.isLoading ? (
                              <div className="h-16 animate-pulse rounded bg-bg-hover" />
                        ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                          <p className="text-[10px] uppercase tracking-wide text-ink-faint mb-1">Items Sold</p>
                                          <p className="text-lg font-mono text-ink-primary">{fmt(returnsSummary.itemsSold)}</p>
                                    </div>
                                    <div>
                                          <p className="text-[10px] uppercase tracking-wide text-ink-faint mb-1">Items Returned</p>
                                          <p className="text-lg font-mono text-accent-red">{fmt(returnsSummary.itemsReturned)}</p>
                                    </div>
                                    <div>
                                          <p className="text-[10px] uppercase tracking-wide text-ink-faint mb-1">Return Rate</p>
                                          <p className="text-lg font-mono text-ink-primary">{returnsSummary.returnRate.toFixed(1)}%</p>
                                    </div>
                              </div>
                        )}
                  </section>
                  <Tabs.Root defaultValue="monthly">
                        <div className={STICKY_TAB_WRAPPER_CLASS}>
                        <Tabs.List className={TAB_LIST_CLASS}>
                              {['monthly', 'daily', 'custom'].map((value) => <Tabs.Trigger key={value} value={value} className={TAB_TRIGGER_CLASS + ' capitalize'}>{value}</Tabs.Trigger>)}
                        </Tabs.List>
                        </div>
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
