import React, { useState, useMemo } from "react";
import { TopBar } from "@/components/ui/TopBar";
import { Card, CardHeader, CardTitle, StatCard, Badge, ProgressBar, EmptyState } from "@/components/ui/primitives";
import { BarChart } from "@/components/charts/BarChart";
import { useTopCustomers } from "@/lib/hooks";
import { fmtCurrency, fmt, fmtDate } from "@/lib/utils";
import { Search, Users, ShoppingBag, Award, Clock } from "lucide-react";
import * as Avatar from "@radix-ui/react-avatar";
import { Link } from "react-router-dom";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase();
}

const TIER_COLORS: Record<number, "gold" | "teal" | "purple" | "muted"> = {
  0: "gold", 1: "gold", 2: "teal", 3: "teal", 4: "purple",
};

export default function CustomersPage() {
  const customers = useTopCustomers(100);
  const [search, setSearch] = useState("");

  const all = customers.data ?? [];
  const maxLTV = Math.max(...all.map((c) => Number(c.lifetime_value)), 1);

  const totalRevenue = all.reduce((s, c) => s + Number(c.lifetime_value), 0);
  const totalPurchases = all.reduce((s, c) => s + Number(c.total_purchases), 0);
  const avgLTV = all.length ? totalRevenue / all.length : 0;

  const filtered = useMemo(() =>
    all.filter((c) =>
      c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone_number ?? "").includes(search) ||
      (c.email ?? "").toLowerCase().includes(search.toLowerCase())
    ), [all, search]);

  const top10Chart = all.slice(0, 10).map((c) => ({
    label: c.customer_name.split(" ")[0],
    value: Number(c.lifetime_value),
  }));

  // Purchase frequency buckets
  const freq = { once: 0, repeat: 0, loyal: 0 };
  all.forEach((c) => {
    const n = Number(c.total_purchases);
    if (n === 1) freq.once++;
    else if (n <= 5) freq.repeat++;
    else freq.loyal++;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar title="Customers" subtitle="Lifetime value and purchase analysis" />

      <main className="flex-1 p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Customers"     value={fmt(all.length)}           icon={<Users size={14}/>}      accent="gold"   delay={0} />
          <StatCard label="Total Purchases"     value={fmt(totalPurchases)}        icon={<ShoppingBag size={14}/>} accent="teal"   delay={100} />
          <StatCard label="Avg Lifetime Value"  value={fmtCurrency(avgLTV)}        icon={<Award size={14}/>}      accent="purple" delay={200} />
          <StatCard label="Repeat Customers"    value={fmt(freq.repeat + freq.loyal)} icon={<Clock size={14}/>}  accent="gold"   delay={300} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card glow>
            <CardHeader><CardTitle>Top 10 by Lifetime Value</CardTitle></CardHeader>
            {customers.loading
              ? <div className="h-52 bg-bg-hover animate-pulse rounded-lg" />
              : <BarChart data={top10Chart} height={200} color="#a78bfa" formatValue={fmtCurrency} />}
          </Card>

          <Card glow>
            <CardHeader><CardTitle>Customer Frequency Segments</CardTitle></CardHeader>
            <div className="space-y-4 pt-2">
              {[
                { label: "One-time buyers",  value: freq.once,   color: "red"   as const, desc: "1 purchase" },
                { label: "Repeat customers", value: freq.repeat, color: "gold"  as const, desc: "2–5 purchases" },
                { label: "Loyal customers",  value: freq.loyal,  color: "teal"  as const, desc: "6+ purchases" },
              ].map((seg) => (
                <div key={seg.label} className="flex items-center gap-4">
                  <div className="w-40 shrink-0">
                    <p className="text-xs font-body text-ink-primary">{seg.label}</p>
                    <p className="text-[10px] text-ink-muted font-body">{seg.desc}</p>
                  </div>
                  <div className="flex-1">
                    <ProgressBar value={seg.value} max={all.length || 1} accent={seg.color} />
                  </div>
                  <div className="w-16 text-right shrink-0">
                    <Badge variant={seg.color}>{fmt(seg.value)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Customer table */}
        <Card>
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers…"
                className="bg-bg-hover border border-bg-border rounded-lg pl-8 pr-3 py-1.5 text-xs font-body text-ink-primary placeholder:text-ink-faint outline-none focus:border-accent-gold/40 w-52 transition-colors"
              />
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-bg-border">
                  {["Customer", "Phone / Email", "Purchases", "Lifetime Value", "Avg Purchase", "Last Seen"].map((h) => (
                    <th key={h} className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.pos_customer_id} className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors group">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <Avatar.Root className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
                          <Avatar.Fallback className="w-full h-full bg-accent-gold/15 border border-accent-gold/25 flex items-center justify-center text-[10px] font-display font-bold text-accent-gold">
                            {initials(c.customer_name)}
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <div>
                          <p className="text-xs font-body text-ink-primary group-hover:text-accent-gold transition-colors">
                            <Link to={`/customers/customer/${c.pos_customer_id}?ctm_name=${c.customer_name}`}>
                              {c.customer_name}
                            </Link>
                          </p>
                          <p className="text-[10px] text-ink-faint font-mono">#{c.pos_customer_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs font-mono text-ink-secondary">{c.phone_number ?? "—"}</p>
                      {c.email && <p className="text-[10px] text-ink-muted">{c.email}</p>}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={Number(c.total_purchases) > 5 ? "teal" : Number(c.total_purchases) > 1 ? "gold" : "muted"}>
                        {fmt(c.total_purchases)}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs font-mono text-accent-gold font-medium">{fmtCurrency(c.lifetime_value)}</p>
                      <ProgressBar value={Number(c.lifetime_value)} max={maxLTV} className="w-20 mt-1" />
                    </td>
                    <td className="py-3 pr-4 text-xs font-mono text-ink-secondary">{fmtCurrency(c.avg_purchase)}</td>
                    <td className="py-3 text-xs font-mono text-ink-muted">
                      {c.last_purchase_at ? fmtDate(c.last_purchase_at) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && <EmptyState message="No customers found" />}
          </div>
          
        </Card>
      </main>
    </div>
  );
}
