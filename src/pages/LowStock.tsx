import React, { useState } from "react";
import { TopBar } from "@/components/ui/TopBar";
import { Card, CardHeader, CardTitle, StatCard, Badge, ProgressBar, EmptyState } from "@/components/ui/primitives";
import { useLowStock } from "@/lib/hooks";
import { fmtCurrency, fmt } from "@/lib/utils";
import { AlertTriangle, Package, TrendingDown, Search } from "lucide-react";

export default function StockPage() {
  const stock = useLowStock();
  const [search, setSearch] = useState("");
  const all = stock.data ?? [];

  const filtered = all.filter((r) =>
    r.item_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const outOfStock = all.filter((r) => Number(r.stock_qty) <= 0).length;
  const critical   = all.filter((r) => Number(r.stock_qty) > 0 && Number(r.stock_qty) <= Number(r.reorder_level) * 0.5).length;
  const totalValue = all.reduce((s, r) => s + Number(r.stock_qty) * Number(r.cost_price ?? 0), 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar title="Low Stock Alerts" subtitle="Items at or below reorder level" />
      <main className="flex-1 p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Items Flagged"   value={fmt(all.length)}         icon={<AlertTriangle size={14}/>} accent="red"    delay={0}   />
          <StatCard label="Out of Stock"    value={fmt(outOfStock)}          icon={<Package size={14}/>}      accent="red"    delay={100} />
          <StatCard label="Critical Level"  value={fmt(critical)}            icon={<TrendingDown size={14}/>} accent="gold"   delay={200} />
          <StatCard label="Remaining Value" value={fmtCurrency(totalValue)}  icon={<Package size={14}/>}      accent="purple" delay={300} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Items Needing Restock</CardTitle>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="bg-bg-hover border border-bg-border rounded-lg pl-8 pr-3 py-1.5 text-xs font-body text-ink-primary placeholder:text-ink-faint outline-none focus:border-accent-gold/40 w-44 transition-colors"
              />
            </div>
          </CardHeader>

          <div className="space-y-2">
            {filtered.map((r) => {
              const qty      = Number(r.stock_qty);
              const reorder  = Number(r.reorder_level);
              const replenish= Number(r.replenish_level ?? reorder * 2);
              const pct      = reorder > 0 ? Math.min((qty / reorder) * 100, 100) : 0;
              const severity: "red" | "gold" | "muted" = qty <= 0 ? "red" : pct <= 50 ? "gold" : "muted";
              const label    = qty <= 0 ? "Out of stock" : pct <= 50 ? "Critical" : "Low";

              return (
                <div key={r.pos_item_id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-bg-hover/40 hover:bg-bg-hover border border-transparent hover:border-bg-border transition-all">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent-red/10 border border-accent-red/20 shrink-0">
                    <Package size={13} className="text-accent-red" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <p className="text-xs font-body text-ink-primary truncate">{r.item_name}</p>
                      <Badge variant={severity}>{label}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono text-ink-muted">
                        Stock: <span className="text-ink-secondary">{fmt(qty)}</span>
                      </span>
                      <span className="text-ink-faint">·</span>
                      <span className="text-[10px] font-mono text-ink-muted">
                        Reorder at: <span className="text-ink-secondary">{fmt(reorder)}</span>
                      </span>
                      <span className="text-ink-faint">·</span>
                      <span className="text-[10px] font-mono text-ink-muted">
                        Target: <span className="text-ink-secondary">{fmt(replenish)}</span>
                      </span>
                    </div>
                    <ProgressBar
                      value={qty} max={reorder || 1}
                      accent={severity === "red" ? "red" : severity === "gold" ? "gold" : "teal"}
                    />
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono text-accent-gold">{fmtCurrency(r.selling_price)}</p>
                    <p className="text-[10px] text-ink-muted font-mono">cost {fmtCurrency(r.cost_price)}</p>
                  </div>
                </div>
              );
            })}
            {!filtered.length && <EmptyState message={search ? "No items match your search" : "All stock levels healthy 🎉"} />}
          </div>
        </Card>
      </main>
    </div>
  );
}
