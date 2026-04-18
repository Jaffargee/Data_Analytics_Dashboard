import React from "react";
import { TopBar } from "@/components/ui/TopBar";
import { Card, CardHeader, CardTitle, StatCard, Badge, ProgressBar, EmptyState } from "@/components/ui/primitives";
import { BarChart } from "@/components/charts/BarChart";
import { useSupplierStock } from "@/lib/hooks";
import { fmtCurrency, fmt } from "@/lib/utils";
import { Truck, Package, DollarSign, AlertCircle } from "lucide-react";

export default function SuppliersPage() {
  const suppliers = useSupplierStock();
  const all = suppliers.data ?? [];

  const totalCostValue   = all.reduce((s, r) => s + Number(r.stock_cost_value ?? 0), 0);
  const totalRetailValue = all.reduce((s, r) => s + Number(r.stock_retail_value ?? 0), 0);
  const totalBalance     = all.reduce((s, r) => s + Number(r.outstanding_balance ?? 0), 0);
  const totalProducts    = all.reduce((s, r) => s + Number(r.num_products ?? 0), 0);

  const maxCostValue = Math.max(...all.map((r) => Number(r.stock_cost_value ?? 0)), 1);

  const barData = all.map((r) => ({
    label: r.supplier_name.split(" ")[0],
    value: Number(r.stock_retail_value ?? 0),
  }));

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar title="Suppliers" subtitle="Stock value and outstanding balances" />

      <main className="flex-1 p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Stock Cost Value"   value={fmtCurrency(totalCostValue)}   icon={<Package size={14}/>}    accent="gold"   delay={0}   />
          <StatCard label="Stock Retail Value" value={fmtCurrency(totalRetailValue)} icon={<DollarSign size={14}/>} accent="teal"   delay={100} />
          <StatCard label="Outstanding Owed"   value={fmtCurrency(totalBalance)}     icon={<AlertCircle size={14}/>} accent="red"   delay={200} />
          <StatCard label="Total Products"     value={fmt(totalProducts)}             icon={<Truck size={14}/>}      accent="purple" delay={300} />
        </div>

        {/* Bar chart */}
        <Card glow>
          <CardHeader><CardTitle>Retail Stock Value by Supplier</CardTitle></CardHeader>
          {suppliers.loading
            ? <div className="h-52 bg-bg-hover animate-pulse rounded-lg" />
            : barData.length
              ? <BarChart data={barData} height={200} color="#2dd4bf" formatValue={fmtCurrency} />
              : <EmptyState />}
        </Card>

        {/* Supplier cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {suppliers.loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><div className="h-24 bg-bg-hover animate-pulse rounded-lg" /></Card>
              ))
            : all.map((s) => {
                const cost    = Number(s.stock_cost_value ?? 0);
                const retail  = Number(s.stock_retail_value ?? 0);
                const balance = Number(s.outstanding_balance ?? 0);
                const markup  = cost > 0 ? ((retail - cost) / cost) * 100 : 0;

                return (
                  <Card key={s.pos_supplier_id} glow className="animate-fade-up opacity-0-init" style={{ animationFillMode: "forwards" }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent-teal/10 border border-accent-teal/25 flex items-center justify-center">
                          <Truck size={14} className="text-accent-teal" />
                        </div>
                        <div>
                          <p className="text-sm font-display font-semibold text-ink-primary">{s.supplier_name}</p>
                          <p className="text-[10px] font-mono text-ink-muted">{fmt(s.num_products)} products</p>
                        </div>
                      </div>
                      <Badge variant={balance > 0 ? "red" : "teal"}>
                        {balance > 0 ? `Owes ${fmtCurrency(balance)}` : "Settled"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div>
                        <p className="text-[10px] text-ink-muted font-body uppercase tracking-wider mb-1">Cost</p>
                        <p className="text-sm font-mono text-ink-primary">{fmtCurrency(cost)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-ink-muted font-body uppercase tracking-wider mb-1">Retail</p>
                        <p className="text-sm font-mono text-accent-gold">{fmtCurrency(retail)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-ink-muted font-body uppercase tracking-wider mb-1">Markup</p>
                        <p className="text-sm font-mono text-accent-teal">+{markup.toFixed(1)}%</p>
                      </div>
                    </div>

                    <ProgressBar value={cost} max={maxCostValue} accent="teal" />
                  </Card>
                );
              })}
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle>Supplier Summary Table</CardTitle></CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-bg-border">
                  {["Supplier", "Products", "Cost Value", "Retail Value", "Markup", "Balance"].map((h) => (
                    <th key={h} className="text-left pb-3 pr-4 text-xs font-body uppercase tracking-wider text-ink-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {all.map((s) => {
                  const cost   = Number(s.stock_cost_value ?? 0);
                  const retail = Number(s.stock_retail_value ?? 0);
                  const markup = cost > 0 ? ((retail - cost) / cost) * 100 : 0;
                  const bal    = Number(s.outstanding_balance ?? 0);
                  return (
                    <tr key={s.pos_supplier_id} className="border-b border-bg-border/40 hover:bg-bg-hover transition-colors">
                      <td className="py-3 pr-4 text-xs font-body text-ink-primary">{s.supplier_name}</td>
                      <td className="py-3 pr-4 text-xs font-mono text-ink-secondary">{fmt(s.num_products)}</td>
                      <td className="py-3 pr-4 text-xs font-mono text-ink-secondary">{fmtCurrency(cost)}</td>
                      <td className="py-3 pr-4 text-xs font-mono text-accent-gold">{fmtCurrency(retail)}</td>
                      <td className="py-3 pr-4"><Badge variant="teal">+{markup.toFixed(1)}%</Badge></td>
                      <td className="py-3">
                        <Badge variant={bal > 0 ? "red" : "teal"}>{fmtCurrency(bal)}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!all.length && <EmptyState />}
          </div>
        </Card>
      </main>
    </div>
  );
}
