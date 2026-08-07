import React, { useMemo, useState } from 'react';
import { Card, CardHeader } from '@fluentui/react-components';
import { DollarSign, Percent, Package, TrendingUp } from 'lucide-react';
import DataTable, { ColumnDef } from '../../../components/ui/DataTable';
import SearchInput from '../../../components/ui/SearchInput';
import StatCard from '../../../components/ui/primitives/StatCard';
import { fmt, fmtCurrency } from '../../../lib/utils';
import {
      useCustomerItemIntelligence,
      CustomerItemIntelligence,
} from '../hooks/useCustomerItemIntelligence';

interface CustomerProductIntelligenceProps {
      customerId: string | number | undefined;
}

export default function CustomerProductIntelligence({ customerId }: CustomerProductIntelligenceProps) {
      const { status, data, error } = useCustomerItemIntelligence(customerId);
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
            const cogs = src.reduce((sum, r) => sum + Number(r.cogs), 0);
            const profit = src.reduce((sum, r) => sum + Number(r.profit), 0);
            const discountImpact = src.reduce((sum, r) => sum + Number(r.net_revenue), 0);
            const margin = revenue ? (profit / revenue) * 100 : 0;
            return { revenue, cogs, profit, discountImpact, margin };
      }, [data]);

      const columns: ColumnDef<CustomerItemIntelligence>[] = [
            {
                  key: 'name',
                  label: 'Item',
                  sortable: true,
                  width: '2fr',
                  sortValue: (r) => r.name?.toLowerCase() ?? '',
                  render: (r) => <p className="text-xs font-body text-ink-primary truncate">{r.name}</p>,
            },
            {
                  key: 'total_sales',
                  label: 'Purchases',
                  sortable: true,
                  width: '0.9fr',
                  sortValue: (r) => Number(r.total_sales) || 0,
                  render: (r) => <span className="text-xs font-mono text-ink-secondary">{fmt(r.total_sales)}</span>,
            },
            {
                  key: 'total_quantity',
                  label: 'Qty',
                  sortable: true,
                  width: '0.8fr',
                  sortValue: (r) => Number(r.total_quantity) || 0,
                  render: (r) => <span className="text-xs font-mono text-ink-secondary">{fmt(r.total_quantity)}</span>,
            },
            {
                  key: 'revenue',
                  label: 'Actual Revenue',
                  sortable: true,
                  width: '1.3fr',
                  sortValue: (r) => Number(r.revenue) || 0,
                  render: (r) => (
                        <span className="text-xs font-mono text-accent-gold font-medium">{fmtCurrency(r.revenue)}</span>
                  ),
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
                  align: 'right',
                  width: '1.2fr',
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
                  align: 'right',
                  width: '1fr',
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
            <div>
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                        <StatCard
                              label="Revenue From This Customer"
                              value={fmtCurrency(totals.revenue)}
                              icon={<DollarSign size={14} />}
                              accent="gold"
                        />
                        <StatCard
                              label="Profit"
                              value={fmtCurrency(totals.profit)}
                              icon={<TrendingUp size={14} />}
                              accent="teal"
                        />
                        <StatCard
                              label="Discount Impact"
                              value={fmtCurrency(totals.discountImpact)}
                              icon={<Package size={14} />}
                              accent="red"
                        />
                        <StatCard
                              label="Margin"
                              value={`${totals.margin.toFixed(1)}%`}
                              icon={<Percent size={14} />}
                              accent="purple"
                        />
                  </div>

                  <div className="mb-4 max-w-sm">
                        <SearchInput
                              value={query}
                              onChange={setQuery}
                              placeholder="Search this customer's purchases…"
                              aria-label="Search products purchased by this customer"
                        />
                  </div>

                  {status === 'loading' && (
                        <p className="text-xs text-ink-muted">Loading product intelligence…</p>
                  )}

                  {status === 'error' && (
                        <p className="text-xs text-rose-400">Failed to load: {error}</p>
                  )}

                  {status === 'success' && (
                        <DataTable
                              data={rows}
                              columns={columns}
                              getRowId={(r) => r.name}
                              ariaLabel="Products purchased by this customer"
                              emptyMessage="No product purchases found for this customer"
                              defaultSortKey="revenue"
                              defaultSortDir="desc"
                        />
                  )}
            </div>
      );
}