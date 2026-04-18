import React from "react";
import { TopBar } from "@/components/ui/TopBar";
import { Card, CardHeader, CardTitle, StatCard, SkeletonCard, EmptyState } from "@/components/ui/primitives";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import {
  useRevenueDaily, useRevenueMonthly, useBestSelling,
  useCategoryPerf, useDailySnapshot,
} from "@/lib/hooks";
import { fmtCurrency, fmt, fmtMonthLabel, today } from "@/lib/utils";
import { TrendingUp, ShoppingCart, Package, BarChart2 } from "lucide-react";

const DONUT_COLORS = ["#f5c842", "#2dd4bf", "#a78bfa", "#f87171", "#fb923c", "#34d399"];

export default function OverviewPage() {
  const daily   = useRevenueDaily(30);
  const monthly = useRevenueMonthly();
  const items   = useBestSelling(5);
  const cats    = useCategoryPerf();
  const snap    = useDailySnapshot(today());

  const snapMap = Object.fromEntries((snap.data ?? []).map((r) => [r.metric, r.value]));
  const revenue  = snapMap["revenue"]   ?? 0;
  const numSales = snapMap["num_sales"] ?? 0;
  const soldToday= snapMap["items_sold"]?? 0;
  const avgSale  = snapMap["avg_sale_value"] ?? 0;

  const monthlyForChart = [...(monthly.data ?? [])].reverse().slice(-12).map((r) => ({
    label: fmtMonthLabel(r.month),
    value: Number(r.revenue),
  }));

  const dailyForChart = [...(daily.data ?? [])].reverse().slice(-30).map((r) => ({
    label: r.sale_date.slice(5),
    value: Number(r.revenue),
  }));

  const catData = (cats.data ?? []).slice(0, 6).map((c, i) => ({
    label: c.category,
    value: Number(c.total_revenue),
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  const topItems = (items.data ?? []).slice(0, 5).map((d) => ({
    label: d.item_name.length > 22 ? d.item_name.slice(0, 22) + "…" : d.item_name,
    value: Number(d.total_revenue),
  }));

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar title="Overview" subtitle="All-time performance snapshot" />

      <main className="flex-1 p-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {snap.loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard label="Revenue Today"   value={fmtCurrency(revenue)}  sub="Based on today's sales" icon={<TrendingUp size={14}/>} accent="gold"   delay={0} />
              <StatCard label="Sales Today"     value={fmt(numSales)}          sub="Completed transactions" icon={<ShoppingCart size={14}/>} accent="teal"   delay={100} />
              <StatCard label="Items Sold"      value={fmt(soldToday)}         sub="Units moved today"      icon={<Package size={14}/>}     accent="purple" delay={200} />
              <StatCard label="Avg Sale Value"  value={fmtCurrency(avgSale)}   sub="Per transaction"        icon={<BarChart2 size={14}/>}   accent="gold"   delay={300} />
            </>
          )}
        </div>

        {/* Revenue charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card glow className="animate-fade-up opacity-0-init" style={{ animationDelay: "150ms", animationFillMode: "forwards" }}>
            <CardHeader>
              <CardTitle>Daily Revenue — Last 30 Days</CardTitle>
              <span className="text-xs font-mono text-accent-teal">₦ NGN</span>
            </CardHeader>
            {daily.loading
              ? <div className="h-48 bg-bg-hover animate-pulse rounded-lg" />
              : dailyForChart.length
                ? <LineChart data={dailyForChart} height={180} color="#2dd4bf" formatValue={fmtCurrency} />
                : <EmptyState />}
          </Card>

          <Card glow className="animate-fade-up opacity-0-init" style={{ animationDelay: "250ms", animationFillMode: "forwards" }}>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <span className="text-xs font-mono text-accent-gold">₦ NGN</span>
            </CardHeader>
            {monthly.loading
              ? <div className="h-48 bg-bg-hover animate-pulse rounded-lg" />
              : monthlyForChart.length
                ? <BarChart data={monthlyForChart} height={180} color="#f5c842" formatValue={fmtCurrency} />
                : <EmptyState />}
          </Card>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card glow className="animate-fade-up opacity-0-init" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
            </CardHeader>
            {cats.loading
              ? <div className="h-48 bg-bg-hover animate-pulse rounded-lg" />
              : catData.length
                ? <DonutChart data={catData} size={180} formatValue={fmtCurrency} />
                : <EmptyState />}
          </Card>

          <Card glow className="animate-fade-up opacity-0-init" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
            <CardHeader>
              <CardTitle>Top 5 Items by Revenue</CardTitle>
            </CardHeader>
            {items.loading
              ? <div className="h-48 bg-bg-hover animate-pulse rounded-lg" />
              : topItems.length
                ? <BarChart data={topItems} height={180} color="#a78bfa" formatValue={fmtCurrency} />
                : <EmptyState />}
          </Card>
        </div>
      </main>
    </div>
  );
}
