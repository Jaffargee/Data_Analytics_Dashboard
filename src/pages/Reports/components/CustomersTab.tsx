import { useState } from 'react';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import { usePeriodTopCustomers } from '../hooks/usePeriodReports';
import { fmtCurrency, fmt } from '@/lib/utils';
import type { PeriodTopCustomerRow } from '@/hooks/data';

const INPUT_CLASS =
      'rounded-md border border-bg-border bg-bg-hover px-2.5 py-1.5 text-xs font-mono text-ink-primary focus:outline-none focus:ring-1 focus:ring-accent-gold';

function isoDate(date: Date): string {
      return date.toISOString().split('T')[0];
}

const columns: ColumnDef<PeriodTopCustomerRow>[] = [
      {
            key: 'customer_name',
            label: 'Customer',
            width: '2fr',
            render: (row) => <span className="text-xs font-body text-ink-primary truncate">{row.customer_name}</span>,
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
            key: 'units',
            label: 'Units',
            sortable: true,
            align: 'right',
            width: '0.9fr',
            sortValue: (row) => Number(row.units),
            render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmt(row.units)}</span>,
      },
      {
            key: 'avg_basket',
            label: 'Avg Basket',
            sortable: true,
            align: 'right',
            width: '1.2fr',
            sortValue: (row) => Number(row.avg_basket),
            render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmtCurrency(row.avg_basket)}</span>,
      },
      {
            key: 'pct_of_total',
            label: '% of Total',
            sortable: true,
            align: 'right',
            width: '1fr',
            sortValue: (row) => Number(row.pct_of_total),
            render: (row) => <span className="text-xs font-mono text-ink-secondary">{Number(row.pct_of_total).toFixed(1)}%</span>,
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

export function CustomersTab() {
      const now = new Date();
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);

      const [from, setFrom] = useState<string>(isoDate(monthAgo));
      const [to, setTo] = useState<string>(isoDate(now));

      const customers = usePeriodTopCustomers(from, to, 50);
      const rows = customers.data?.data ?? [];

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

                  {customers.isLoading ? (
                        <div className="h-64 animate-pulse rounded-lg bg-bg-hover" />
                  ) : (
                        <DataTable
                              data={rows}
                              columns={columns}
                              getRowId={(row) => row.customer_name}
                              ariaLabel="Top customers for period"
                              emptyMessage="No sales in this range."
                              defaultSortKey="revenue"
                              defaultSortDir="desc"
                        />
                  )}
            </div>
      );
}
