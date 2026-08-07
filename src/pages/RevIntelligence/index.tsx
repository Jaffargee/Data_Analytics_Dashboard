import React, { useMemo, useState } from 'react';
import { Card, CardHeader } from '@fluentui/react-components';
import { TrendingUp, DollarSign, Percent, Package } from 'lucide-react';
import DataTable, { ColumnDef } from '../../components/ui/DataTable';
import SearchInput from '../../components/ui/SearchInput';
import { fmt, fmtCurrency } from '../../lib/utils';
import { useRevIntelligence, RevIntelligenceItem } from './useRevIntelligence';
import StatCard from "../../components/ui/primitives/StatCard";
import TopBar from "../../components/ui/TopBar";

const RevIntelligence = () => {
      const { status, data, error } = useRevIntelligence();
      const [query, setQuery] = useState('');

      const rows = useMemo(() => {
            if (!data) return [];
            if (!query.trim()) return data;
            const q = query.toLowerCase();
            return data.filter((r) => r.name?.toLowerCase().includes(q));
      }, [data, query]);

      const totals = useMemo(() => {
            const src = data ?? [];

            const revenue = src.reduce((sum, r) => sum + Number(r.revenue), 0);
            const grossRevenue = src.reduce((sum, r) => sum + Number(r.gross_revenue), 0);
            const totalDiscountImpact = src.reduce((sum, r) => sum + Number(r.net_revenue), 0);
            const cogs = src.reduce((sum, r) => sum + Number(r.cogs), 0);
            const profit = src.reduce((sum, r) => sum + Number(r.profit), 0);

            // Margins
            const netProfitMargin = revenue ? (profit / revenue) * 100 : 0;
            const discountImpactMargin = revenue ? (totalDiscountImpact / revenue) * 100 : 0;
            const grossMargin = grossRevenue ? ((grossRevenue - cogs) / grossRevenue) * 100 : 0;
            const cogsRatio = revenue ? (cogs / revenue) * 100 : 0;

            return {
                  revenue,
                  grossRevenue,
                  cogs,
                  profit,
                  totalDiscountImpact,
                  netProfitMargin,
                  discountImpactMargin,
                  grossMargin,
                  cogsRatio,
            };

      }, [data]);

      const columns: ColumnDef<RevIntelligenceItem>[] = [
            {
                  key: 'name',
                  label: 'Item',
                  sortable: true,
                  width: '2fr',
                  sortValue: (r) => r.name?.toLowerCase() ?? '',
                  render: (r) => (
                        <p className="text-xs font-body text-ink-primary truncate">{r.name}</p>
                  ),
            },
            {
                  key: 'total_sales',
                  label: 'Sales',
                  sortable: true,
                  width: '0.8fr',
                  sortValue: (r) => Number(r.total_sales) || 0,
                  render: (r) => <span className="text-xs font-mono text-ink-secondary">{fmt(r.total_sales)}</span>,
            },
            {
                  key: 'total_quantity',
                  label: 'Qty Sold',
                  sortable: true,
                  width: '0.9fr',
                  sortValue: (r) => Number(r.total_quantity) || 0,
                  render: (r) => <span className="text-xs font-mono text-ink-secondary">{fmt(r.total_quantity)}</span>,
            },
            {
                  key: 'cogs',
                  label: 'COGS',
                  sortable: true,
                  width: '1.2fr',
                  sortValue: (r) => Number(r.cogs) || 0,
                  render: (r) => <span className="text-xs font-mono text-ink-muted">{fmtCurrency(r.cogs)}</span>,
            },
            {
                  key: 'gross_revenue',
                  label: 'Gross Revenue',
                  sortable: true,
                  width: '1.3fr',
                  sortValue: (r) => Number(r.gross_revenue) || 0,
                  render: (r) => <span className="text-xs font-mono text-ink-secondary">{fmtCurrency(r.gross_revenue)}</span>,
            },
            {
                  key: 'revenue',
                  label: 'Actual Revenue',
                  sortable: true,
                  width: '1.3fr',
                  sortValue: (r) => Number(r.revenue) || 0,
                  render: (r) => <span className="text-xs font-mono text-accent-gold font-medium">{fmtCurrency(r.revenue)}</span>,
            },
            {
                  key: 'net_revenue',
                  label: 'Discount Impact',
                  sortable: true,
                  width: '1.3fr',
                  sortValue: (r) => Number(r.net_revenue) || 0,
                  render: (r) => {
                        const v = Number(r.net_revenue);
                        return (
                              <span className={`text-xs font-mono ${v > 0 ? 'text-rose-400' : 'text-ink-muted'}`}>
                                    {fmtCurrency(v)}
                              </span>
                        );
                  },
            },
            {
                  key: 'profit',
                  label: 'Profit',
                  sortable: true,
                  width: '1.2fr',
                  align: 'right',
                  sortValue: (r) => Number(r.profit) || 0,
                  render: (r) => {
                        const v = Number(r.profit);
                        return (
                              <span className={`text-xs font-mono font-semibold ${v >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {fmtCurrency(v)}
                              </span>
                        );
                  },
            },
            {
                  key: 'margin',
                  label: 'Margin %',
                  sortable: true,
                  width: '1fr',
                  align: 'right',
                  sortValue: (r) => (Number(r.revenue) ? (Number(r.profit) / Number(r.revenue)) * 100 : 0),
                  render: (r) => {
                        const margin = Number(r.revenue) ? (Number(r.profit) / Number(r.revenue)) * 100 : 0;
                        return (
                              <span className={`text-xs font-mono ${margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {margin.toFixed(1)}%
                              </span>
                        );
                  },
            },
      ];

      return (
            <div className="pb-10">
                  <TopBar onRefresh={() => {}} title="Revenue Intelligence" subtitle="Per-item revenue, cost, and profit breakdown across all sales." />
                  <div className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 py-4">
                        <StatCard
                              label="Actual Revenue"
                              value={fmtCurrency(totals.revenue)}
                              icon={<DollarSign size={16} aria-hidden="true" />}
                        />

                        <StatCard
                              label="Gross Revenue"
                              value={fmtCurrency(totals.grossRevenue)}
                              icon={<DollarSign size={16} aria-hidden="true" />}
                        />

                        <StatCard
                              label="Total COGS"
                              value={fmtCurrency(totals.cogs)}
                              icon={<Package size={16} aria-hidden="true" />}
                        />

                        <StatCard
                              label="Total Profit"
                              value={fmtCurrency(totals.profit)}
                              icon={<TrendingUp size={16} aria-hidden="true" />}
                              tone={totals.profit >= 0 ? 'positive' : 'negative'}
                        />

                        <StatCard
                              label="Net Profit Margin"
                              value={`${totals.netProfitMargin.toFixed(1)}%`}
                              icon={<Percent size={16} aria-hidden="true" />}
                              tone={totals.netProfitMargin >= 0 ? 'positive' : 'negative'}
                        />

                        {/*<StatCard
                              label="Gross Margin"
                              value={`${totals.grossMargin.toFixed(1)}%`}
                              icon={<Percent size={16} aria-hidden="true" />}
                              tone={totals.grossMargin >= 0 ? 'positive' : 'negative'}
                        />*/}

                        <StatCard
                              label="COGS Ratio"
                              value={`${totals.cogsRatio.toFixed(1)}%`}
                              icon={<Percent size={16} aria-hidden="true" />}
                              tone={totals.cogsRatio >= 0 ? 'positive' : 'negative'}
                        />

                        <StatCard
                              label="Total Discount Impact"
                              value={fmtCurrency(totals.totalDiscountImpact)}
                              icon={<DollarSign size={16} aria-hidden="true" />}
                        />

                        <StatCard
                              label="Discount Impact Margin"
                              value={`${totals.discountImpactMargin.toFixed(1)}%`}
                              icon={<Percent size={16} aria-hidden="true" />}
                              tone={totals.discountImpactMargin >= 0 ? 'positive' : 'negative'}
                        />

                  </div>

                  <div className="px-6 mb-4 max-w-sm">
                        <SearchInput
                              value={query}
                              onChange={setQuery}
                              placeholder="Search items..."
                              aria-label="Search items"
                        />
                  </div>

                  {status === 'loading' && (
                        <p className="px-6 text-xs text-ink-muted">Loading revenue intelligence…</p>
                  )}

                  {status === 'error' && (
                        <p className="px-6 text-xs text-rose-400">Failed to load: {error}</p>
                  )}

                  {status === 'success' && (
                        <DataTable
                              data={rows}
                              columns={columns}
                              getRowId={(r) => r.name}
                              ariaLabel="Item revenue intelligence"
                              emptyMessage="No items found"
                              defaultSortKey="revenue"
                              defaultSortDir="desc"
                        />
                  )}
            </div>
      );
};

export default RevIntelligence;