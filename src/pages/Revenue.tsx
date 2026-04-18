import React, { useState } from "react";
import { TopBar } from "@/components/ui/TopBar";
import { Card, CardHeader, CardTitle, StatCard, SectionHeader, EmptyState, Badge } from "@/components/ui/primitives";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { useRevenueDaily, useRevenueMonthly, useRevenueRange } from "@/lib/hooks";
import { fmtCurrency, fmt, fmtMonthLabel, fmtDate, nDaysAgo, today } from "@/lib/utils";
import * as Tabs from "@radix-ui/react-tabs";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

export default function RevenuePage() {
  const [from, setFrom] = useState(nDaysAgo(30));
  const [to,   setTo]   = useState(today());

  const daily   = useRevenueDaily(90);
  const monthly = useRevenueMonthly();
  const ranged  = useRevenueRange(from, to);

  // Monthly totals
  const months = [...(monthly.data ?? [])].reverse();
  const latestMonth  = months[months.length - 1];
  const prevMonth    = months[months.length - 2];
  const momChange    = latestMonth && prevMonth
    ? ((latestMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100
    : null;

  const totalAllTime = months.reduce((s, m) => s + Number(m.revenue), 0);
  const totalSales   = months.reduce((s, m) => s + Number(m.num_sales), 0);

  const monthlyChart = months.slice(-12).map((r) => ({
    label: fmtMonthLabel(r.month),
    value: Number(r.revenue),
  }));

  const dailyChart = [...(daily.data ?? [])].reverse().slice(-30).map((r) => ({
    label: r.sale_date.slice(5),
    value: Number(r.revenue),
  }));

  const rangedChart = [...(ranged.data ?? [])].reverse().map((r) => ({
    label: r.sale_date.slice(5),
    value: Number(r.revenue),
  }));

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar title="Revenue" subtitle="Detailed revenue analysis" />

      <main className="flex-1 p-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="All-Time Revenue"    value={fmtCurrency(totalAllTime)} accent="gold"   delay={0} />
          <StatCard label="Total Transactions"  value={fmt(totalSales)}           accent="teal"   delay={100} />
          <StatCard label="This Month"          value={fmtCurrency(latestMonth?.revenue ?? 0)} accent="purple" delay={200} />
          <StatCard
            label="MoM Change"
            value={momChange !== null ? `${momChange >= 0 ? "+" : ""}${momChange.toFixed(1)}%` : "—"}
            accent={momChange !== null && momChange >= 0 ? "teal" : "red"}
            delay={300}
          />
        </div>

        {/* Tabs */}
        <Tabs.Root defaultValue="monthly">
          <div className="flex items-center justify-between mb-4">
            <Tabs.List className="flex gap-1 bg-bg-panel border border-bg-border rounded-lg p-1">
              {["monthly", "daily", "custom"].map((v) => (
                <Tabs.Trigger key={v} value={v}
                  className="px-4 py-1.5 text-xs font-body rounded-md text-ink-secondary
                    data-[state=active]:bg-accent-gold/15 data-[state=active]:text-accent-gold
                    data-[state=active]:border data-[state=active]:border-accent-gold/30
                    hover:text-ink-primary transition-all capitalize">
                  {v}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </div>

          <Tabs.Content value="monthly">
            <Card glow>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
                <Badge variant="gold">{months.length} months</Badge>
              </CardHeader>
              {monthly.loading
                ? <div className="h-64 bg-bg-hover animate-pulse rounded-lg" />
                : <BarChart data={monthlyChart} height={240} color="#f5c842" formatValue={fmtCurrency} />}
            </Card>

            {/* Monthly table */}
            <Card className="mt-4">
              <CardHeader><CardTitle>Month-by-Month Breakdown</CardTitle></CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b border-bg-border">
                      {["Month", "Sales", "Revenue", "Avg Sale", "Items Sold"].map((h) => (
                        <th key={h} className="text-left pb-3 text-xs font-body uppercase tracking-wider text-ink-muted pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...(monthly.data ?? [])].reverse().map((r, i) => (
                      <tr key={i} className="border-b border-bg-border/50 hover:bg-bg-hover transition-colors">
                        <td className="py-3 pr-4 font-mono text-ink-primary text-xs">{r.month}</td>
                        <td className="py-3 pr-4 text-ink-secondary text-xs">{fmt(r.num_sales)}</td>
                        <td className="py-3 pr-4 text-accent-gold font-mono text-xs font-medium">{fmtCurrency(r.revenue)}</td>
                        <td className="py-3 pr-4 text-ink-secondary text-xs font-mono">{fmtCurrency(r.avg_sale)}</td>
                        <td className="py-3 text-ink-secondary text-xs">{fmt(r.items_sold)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!monthly.data?.length && <EmptyState />}
              </div>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="daily">
            <Card glow>
              <CardHeader>
                <CardTitle>Daily Revenue — Last 30 Days</CardTitle>
                <Badge variant="teal">30d</Badge>
              </CardHeader>
              {daily.loading
                ? <div className="h-64 bg-bg-hover animate-pulse rounded-lg" />
                : <LineChart data={dailyChart} height={240} color="#2dd4bf" formatValue={fmtCurrency} />}
            </Card>

            <Card className="mt-4">
              <CardHeader><CardTitle>Daily Breakdown</CardTitle></CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="border-b border-bg-border">
                      {["Date", "Sales", "Revenue", "Items Sold"].map((h) => (
                        <th key={h} className="text-left pb-3 text-xs font-body uppercase tracking-wider text-ink-muted pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(daily.data ?? []).map((r, i) => (
                      <tr key={i} className="border-b border-bg-border/50 hover:bg-bg-hover transition-colors">
                        <td className="py-2.5 pr-4 font-mono text-ink-primary text-xs">{fmtDate(r.sale_date)}</td>
                        <td className="py-2.5 pr-4 text-ink-secondary text-xs">{fmt(r.num_sales)}</td>
                        <td className="py-2.5 pr-4 text-accent-teal font-mono text-xs font-medium">{fmtCurrency(r.revenue)}</td>
                        <td className="py-2.5 text-ink-secondary text-xs">{fmt(r.items_sold)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!daily.data?.length && <EmptyState />}
              </div>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="custom">
            <Card>
              <CardHeader><CardTitle>Custom Date Range</CardTitle></CardHeader>
              <div className="flex items-center gap-4 mb-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-ink-muted" />
                  <label className="text-xs text-ink-muted font-body">From</label>
                  <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                    className="bg-bg-hover border border-bg-border rounded-lg px-3 py-1.5 text-xs font-mono text-ink-primary outline-none focus:border-accent-gold/50 transition-colors" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-ink-muted font-body">To</label>
                  <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                    className="bg-bg-hover border border-bg-border rounded-lg px-3 py-1.5 text-xs font-mono text-ink-primary outline-none focus:border-accent-gold/50 transition-colors" />
                </div>
                <div className="ml-auto flex gap-2 flex-wrap">
                  {[["7d", 7], ["30d", 30], ["90d", 90], ["1y", 365]].map(([label, days]) => (
                    <button key={label}
                      onClick={() => { setFrom(nDaysAgo(Number(days))); setTo(today()); }}
                      className="px-3 py-1.5 text-xs font-mono border border-bg-border rounded-lg text-ink-muted hover:text-accent-gold hover:border-accent-gold/30 transition-all">
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {ranged.loading
                ? <div className="h-64 bg-bg-hover animate-pulse rounded-lg" />
                : rangedChart.length
                  ? <LineChart data={rangedChart} height={240} color="#f5c842" formatValue={fmtCurrency} />
                  : <EmptyState message="No data for selected range" />}
            </Card>
          </Tabs.Content>
        </Tabs.Root>
      </main>
    </div>
  );
}
