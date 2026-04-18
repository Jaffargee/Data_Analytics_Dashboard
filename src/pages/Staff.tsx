import React from "react";
import { TopBar } from "@/components/ui/TopBar";
import { Card, CardHeader, CardTitle, StatCard, Badge, ProgressBar, EmptyState } from "@/components/ui/primitives";
import { BarChart } from "@/components/charts/BarChart";
import { useSalesperson } from "@/lib/hooks";
import { fmtCurrency, fmt } from "@/lib/utils";
import { UserCheck, TrendingUp, ShoppingCart, Award } from "lucide-react";

export default function StaffPage() {
  const staff = useSalesperson();
  const all   = staff.data ?? [];

  const totalRevenue = all.reduce((s, r) => s + Number(r.total_revenue), 0);
  const totalSales   = all.reduce((s, r) => s + Number(r.total_sales), 0);
  const maxRev       = Math.max(...all.map((r) => Number(r.total_revenue)), 1);

  const barData = all.map((r) => ({
    label: r.salesperson.split(" ")[0],
    value: Number(r.total_revenue),
  }));

  const topPerson = all[0];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar title="Staff Performance" subtitle="Sales by salesperson" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Staff"        value={fmt(all.length)}           icon={<UserCheck size={14}/>}  accent="gold"   delay={0}   />
          <StatCard label="Total Revenue"      value={fmtCurrency(totalRevenue)} icon={<TrendingUp size={14}/>} accent="teal"   delay={100} />
          <StatCard label="Total Sales"        value={fmt(totalSales)}           icon={<ShoppingCart size={14}/>} accent="purple" delay={200} />
          <StatCard label="Top Performer"      value={topPerson?.salesperson.split(" ")[0] ?? "—"} icon={<Award size={14}/>} accent="gold" delay={300} />
        </div>

        <Card glow>
          <CardHeader><CardTitle>Revenue by Salesperson</CardTitle></CardHeader>
          {staff.loading
            ? <div className="h-52 bg-bg-hover animate-pulse rounded-lg" />
            : barData.length
              ? <BarChart data={barData} height={200} color="#a78bfa" formatValue={fmtCurrency} />
              : <EmptyState />}
        </Card>

        <Card>
          <CardHeader><CardTitle>Detailed Breakdown</CardTitle></CardHeader>
          <div className="space-y-4">
            {all.map((r, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-bg-hover/40 hover:bg-bg-hover transition-colors">
                <div className="w-8 h-8 rounded-lg bg-accent-purple/15 border border-accent-purple/25 flex items-center justify-center text-xs font-display font-bold text-accent-purple shrink-0">
                  {r.salesperson.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-body text-ink-primary truncate">{r.salesperson}</p>
                    <span className="text-xs font-mono text-accent-purple ml-2 shrink-0">{fmtCurrency(r.total_revenue)}</span>
                  </div>
                  <ProgressBar value={Number(r.total_revenue)} max={maxRev} accent="purple" />
                  <div className="flex gap-4 mt-1.5">
                    <span className="text-[10px] font-mono text-ink-muted">{fmt(r.total_sales)} sales</span>
                    <span className="text-[10px] font-mono text-ink-muted">avg {fmtCurrency(r.avg_sale)}</span>
                    <span className="text-[10px] font-mono text-ink-muted">{fmt(r.items_sold)} items</span>
                  </div>
                </div>
                {i === 0 && <Badge variant="gold">Top</Badge>}
              </div>
            ))}
            {!all.length && <EmptyState />}
          </div>
        </Card>
      </main>
    </div>
  );
}
