import { useState } from 'react';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import { usePeriodTopProducts } from '../hooks/usePeriodReports';
import { fmtCurrency, fmt } from '@/lib/utils';
import type { PeriodTopProductRow } from '@/hooks/data';

const INPUT_CLASS =
      'rounded-md border border-bg-border bg-bg-hover px-2.5 py-1.5 text-xs font-mono text-ink-primary focus:outline-none focus:ring-1 focus:ring-accent-gold';

function isoDate(date: Date): string {
      return date.toISOString().split('T')[0];
}

const columns: ColumnDef<PeriodTopProductRow>[] = [
      {
            key: 'item_name',
            label: 'Item',
            width: '2fr',
            render: (row) => (
                  <div className="min-w-0">
                        <p className="text-xs font-body text-ink-primary truncate">{row.item_name}</p>
                        <p className="text-[10px] text-ink-muted font-body">{row.category}</p>
                  </div>
            ),
      },
      {
            key: 'units_sold',
            label: 'Units',
            sortable: true,
            align: 'right',
            width: '0.9fr',
            sortValue: (row) => Number(row.units_sold),
            render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmt(row.units_sold)}</span>,
      },
      {
            key: 'transactions',
            label: 'Txns',
            sortable: true,
            align: 'right',
            width: '0.9fr',
            sortValue: (row) => Number(row.transactions),
            render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmt(row.transactions)}</span>,
      },
      {
            key: 'avg_price',
            label: 'Avg Price',
            sortable: true,
            align: 'right',
            width: '1.1fr',
            sortValue: (row) => Number(row.avg_price),
            render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmtCurrency(row.avg_price)}</span>,
      },
      {
            key: 'margin_pct',
            label: 'Margin',
            sortable: true,
            align: 'right',
            width: '1fr',
            sortValue: (row) => Number(row.margin_pct),
            render: (row) => (
                  <span className={Number(row.margin_pct) < 15 ? 'text-accent-red text-xs font-mono' : 'text-ink-secondary text-xs font-mono'}>
                        {Number(row.margin_pct).toFixed(1)}%
                  </span>
            ),
      },
      {
            key: 'revenue',
            label: 'Revenue',
            sortable: true,
            align: 'right',
            width: '1.2fr',
            sortValue: (row) => Number(row.revenue),
            render: (row) => <span className="text-xs font-mono text-accent-gold font-medium">{fmtCurrency(row.revenue)}</span>,
      },
];

export function ProductsTab() {
      const now = new Date();
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);

      const [from, setFrom] = useState<string>(isoDate(monthAgo));
      const [to, setTo] = useState<string>(isoDate(now));

      const products = usePeriodTopProducts(from, to, 50);
      const rows = products.data?.data ?? [];

      return (
            <div className="space-y-5">
                  <div className="rounded-lg border border-bg-border bg-bg-panel p-5">
                        <p className="text-[10px] uppercase tracking-wide text-ink-faint mb-2">Date Range</p>
                        <div className="flex items-center gap-2">
                              <input type="date" className={INPUT_CLASS} value={from} onChange={(e) => setFrom(e.target.value)} />
                              <span className="text-ink-faint text-xs">→</span>
                              <input type="date" className={INPUT_CLASS} value={to} onChange={(e) => setTo(e.target.value)} />
                        </div>
                  </div>

                  {products.isLoading ? (
                        <div className="h-64 animate-pulse rounded-lg bg-bg-hover" />
                  ) : (
                        <DataTable
                              data={rows}
                              columns={columns}
                              getRowId={(row) => row.item_name}
                              ariaLabel="Top products for period"
                              emptyMessage="No sales in this range."
                              defaultSortKey="revenue"
                              defaultSortDir="desc"
                        />
                  )}
            </div>
      );
}
