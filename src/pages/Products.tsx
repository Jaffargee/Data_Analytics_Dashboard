import React, { useState, useMemo } from "react";
import { TopBar } from "@/components/ui/TopBar";
import { Card, CardHeader, CardTitle, Badge, ProgressBar, EmptyState, StatCard } from "@/components/ui/primitives";
import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { useBestSelling, useCategoryPerf } from "@/lib/hooks";
import { fmtCurrency, fmt, fmtPercent } from "@/lib/utils";
import { Search, ArrowUpDown, Package, TrendingUp, DollarSign, Percent } from "lucide-react";

const DONUT_COLORS = ["#f5c842", "#2dd4bf", "#a78bfa", "#f87171", "#fb923c", "#34d399", "#60a5fa"];

type SortKey = "total_revenue" | "total_qty_sold" | "margin_pct" | "times_sold" | "gross_profit";

export default function ProductsPage() {
  const items = useBestSelling(200);
  const cats  = useCategoryPerf();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("total_revenue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const allItems = items.data ?? [];
  const maxRevenue = Math.max(...allItems.map((i) => Number(i.total_revenue)), 1);

  const filtered = useMemo(() => {
    let rows = allItems.filter((i) =>
      i.item_name.toLowerCase().includes(search.toLowerCase()) ||
      (i.category ?? "").toLowerCase().includes(search.toLowerCase())
    );
    rows = [...rows].sort((a, b) => {
      const va = Number((a as unknown as Record<string, unknown>)[sortKey] ?? 0);
      const vb = Number((b as unknown as Record<string, unknown>)[sortKey] ?? 0);
      return sortDir === "desc" ? vb - va : va - vb;
    });
    return rows;
  }, [allItems, search, sortKey, sortDir]);

  const totalRevenue = allItems.reduce((s, i) => s + Number(i.total_revenue), 0);
  const totalQty     = allItems.reduce((s, i) => s + Number(i.total_qty_sold), 0);
  const totalProfit  = allItems.reduce((s, i) => s + Number(i.gross_profit), 0);
  const avgMargin    = allItems.length
    ? allItems.reduce((s, i) => s + Number(i.margin_pct ?? 0), 0) / allItems.length
    : 0;

  const top10Chart = allItems.slice(0, 10).map((i) => ({
    label: i.item_name.length > 14 ? i.item_name.slice(0, 14) + "…" : i.item_name,
    value: Number(i.total_revenue),
  }));

  const catDonut = (cats.data ?? []).slice(0, 7).map((c, i) => ({
    label: c.category,
    value: Number(c.total_revenue),
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }));

  function toggleSort(key: SortKey) {
    if (sortKey === key) setDir(sortDir === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  }
  function setDir(d: "asc" | "desc") { setSortDir(d); }

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(k)}
      className={`flex items-center gap-1 text-xs font-body uppercase tracking-wider transition-colors ${
        sortKey === k ? "text-accent-gold" : "text-ink-muted hover:text-ink-secondary"
      }`}
    >
      {label}
      <ArrowUpDown size={10} className={sortKey === k ? "text-accent-gold" : "text-ink-faint"} />
    </button>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar title="Products" subtitle="Sales performance by item and category" />

      <main className="flex-1 p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Revenue"   value={fmtCurrency(totalRevenue)} icon={<DollarSign size={14}/>} accent="gold"   delay={0}   />
          <StatCard label="Units Sold"      value={fmt(totalQty)}              icon={<Package size={14}/>}    accent="teal"   delay={100} />
          <StatCard label="Gross Profit"    value={fmtCurrency(totalProfit)}   icon={<TrendingUp size={14}/>} accent="purple" delay={200} />
          <StatCard label="Avg Margin"      value={fmtPercent(avgMargin)}      icon={<Percent size={14}/>}    accent="gold"   delay={300} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card glow>
            <CardHeader><CardTitle>Top 10 by Revenue</CardTitle></CardHeader>
            {items.loading
              ? <div className="h-52 bg-bg-hover animate-pulse rounded-lg" />
              : <BarChart data={top10Chart} height={200} color="#f5c842" formatValue={fmtCurrency} />}
          </Card>

          <Card glow>
            <CardHeader><CardTitle>Revenue by Category</CardTitle></CardHeader>
            {cats.loading
              ? <div className="h-52 bg-bg-hover animate-pulse rounded-lg" />
              : catDonut.length
                ? <DonutChart data={catDonut} size={180} formatValue={fmtCurrency} />
                : <EmptyState />}
          </Card>
        </div>

        {/* Category performance table */}
        <Card>
          <CardHeader><CardTitle>Category Performance</CardTitle></CardHeader>
          <div className="space-y-3">
            {(cats.data ?? []).map((c, i) => {
              const rev = Number(c.total_revenue);
              const maxCat = Math.max(...(cats.data ?? []).map((x) => Number(x.total_revenue)), 1);
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 shrink-0">
                    <p className="text-xs font-body text-ink-primary truncate">{c.category}</p>
                    <p className="text-[10px] font-mono text-ink-muted">{fmt(c.num_items)} items</p>
                  </div>
                  <div className="flex-1">
                    <ProgressBar value={rev} max={maxCat} accent="gold" />
                  </div>
                  <div className="w-28 text-right shrink-0">
                    <p className="text-xs font-mono text-accent-gold">{fmtCurrency(rev)}</p>
                    <p className="text-[10px] font-mono text-ink-muted">{fmt(c.total_qty_sold)} units</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Items table */}
        <Card>
          <CardHeader>
            <CardTitle>All Items</CardTitle>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items…"
                className="bg-bg-hover border border-bg-border rounded-lg pl-8 pr-3 py-1.5 text-xs font-body text-ink-primary placeholder:text-ink-faint outline-none focus:border-accent-gold/40 w-52 transition-colors"
              />
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-border">
                  <th className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted">#</th>
                  <th className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted">Item</th>
                  <th className="text-left pb-3 pr-4"><SortBtn k="total_revenue" label="Revenue" /></th>
                  <th className="text-left pb-3 pr-4"><SortBtn k="total_qty_sold" label="Qty" /></th>
                  <th className="text-left pb-3 pr-4"><SortBtn k="gross_profit" label="Profit" /></th>
                  <th className="text-left pb-3 pr-4"><SortBtn k="margin_pct" label="Margin" /></th>
                  <th className="text-left pb-3"><SortBtn k="times_sold" label="Transactions" /></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const margin = Number(r.margin_pct ?? 0);
                  return (
                    <tr key={r.pos_item_id} className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors group">
                      <td className="py-3 pr-4 text-ink-faint text-xs font-mono">{i + 1}</td>
                      <td className="py-3 pr-4">
                        <div>
                          <p className="text-xs font-body text-ink-primary group-hover:text-accent-gold transition-colors">{r.item_name}</p>
                          {r.category && <p className="text-[10px] text-ink-muted font-body">{r.category}</p>}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div>
                          <p className="text-xs font-mono text-accent-gold font-medium">{fmtCurrency(r.total_revenue)}</p>
                          <ProgressBar value={Number(r.total_revenue)} max={maxRevenue} className="w-20 mt-1" />
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-xs font-mono text-ink-secondary">{fmt(r.total_qty_sold)}</td>
                      <td className="py-3 pr-4 text-xs font-mono text-accent-teal">{fmtCurrency(r.gross_profit)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={margin >= 30 ? "teal" : margin >= 10 ? "gold" : "red"}>
                          {fmtPercent(margin)}
                        </Badge>
                      </td>
                      <td className="py-3 text-xs font-mono text-ink-secondary">{fmt(r.times_sold)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!filtered.length && <EmptyState message="No items match your search" />}
          </div>

        </Card>
      </main>
    </div>
  );
}