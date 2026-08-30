import { Stats, EmptyState } from '@/components/ui/primitives';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import { usePaginatedRows } from '@/hooks/usePagination';
import type { StatCardProps } from '@/components/ui/controls/primitives/types';
import { fmt, fmtCurrency, fmtDate } from '@/lib/utils';
import { usePostCorrelation } from '../useCorrelation';
import { Clock, Target, MessageCircle, DollarSign } from 'lucide-react';
import { WhatsappPostCorelationRow } from '@/hooks/data';

export function PostPerformanceTab() {
      const { correlations, summary, loading } = usePostCorrelation();
      const correlationsPage = usePaginatedRows(correlations, 20);

      const kpis: StatCardProps[] = [
            {
                  label: 'Posts Tracked',
                  value: fmt(summary.totalPosts),
                  icon: <MessageCircle size={14} />,
                  accent: 'teal',
                  delay: 0,
            },
            {
                  label: 'Led to a Sale',
                  value: summary.totalPosts ? `${summary.postsWithSale}/${summary.totalPosts}` : '—',
                  sub: summary.totalPosts ? `${summary.conversionRate.toFixed(0)}% conversion rate` : undefined,
                  icon: <Target size={14} />,
                  accent: 'gold',
                  delay: 100,
            },
            {
                  label: 'Avg. Days to First Sale',
                  value: summary.avgDaysToFirstSale !== null ? `${summary.avgDaysToFirstSale.toFixed(1)} days` : '—',
                  icon: <Clock size={14} />,
                  accent: 'purple',
                  delay: 200,
            },
            {
                  label: 'Total Sales Revenue',
                  value: fmtCurrency(summary.totalRevenue),
                  sub: `${fmt(summary.totalUnitsSold)} units (${fmtCurrency(summary.totalGrossProfit)} profit)`,
                  icon: <DollarSign size={14} />,
                  accent: 'teal',
                  delay: 300,
            },
      ];

      const columns: ColumnDef<WhatsappPostCorelationRow>[] = [
            {
                  key: 'item_name',
                  label: 'Item',
                  width: '1.8fr',
                  render: (row) => (
                        <div className="min-w-0">
                              <p className="text-xs font-body text-ink-primary truncate">{row.item_name}</p>
                              <p className="text-[10px] text-ink-muted font-mono">{row.media_type}</p>
                        </div>
                  ),
            },
            {
                  key: 'posted_at',
                  label: 'Posted',
                  sortable: true,
                  width: '1.2fr',
                  sortValue: (row) => new Date(row.posted_at).getTime(),
                  render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmtDate(row.posted_at)}</span>,
            },
            {
                  key: 'days_to_first_sale',
                  label: 'Days to First Sale',
                  sortable: true,
                  align: 'right',
                  width: '1.3fr',
                  sortValue: (row) => row.days_to_first_sale ?? Number.MAX_SAFE_INTEGER,
                  render: (row) => (
                        <span className={row.days_to_first_sale !== null && row.days_to_first_sale !== undefined ? 'text-xs font-mono text-ink-secondary' : 'text-xs font-mono text-ink-faint'}>
                              {row.days_to_first_sale !== null && row.days_to_first_sale !== undefined ? `${Math.round(row.days_to_first_sale)}d` : 'No sale yet'}
                        </span>
                  ),
            },
            {
                  key: 'sales_count',
                  label: 'Sales Count',
                  sortable: true,
                  align: 'right',
                  width: '1.1fr',
                  sortValue: (row) => row.sales_count,
                  render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmt(row.sales_count)}</span>,
            },
            {
                  key: 'unit_sold',
                  label: 'Units Sold',
                  sortable: true,
                  align: 'right',
                  width: '1.2fr',
                  sortValue: (row) => row.units_sold,
                  render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmt(row.units_sold)}</span>,
            },
            {
                  key: 'sales_revenue',
                  label: 'Revenue',
                  sortable: true,
                  align: 'right',
                  width: '1.3fr',
                  sortValue: (row) => row.sales_revenue,
                  render: (row) => <span className="text-xs font-mono text-accent-gold font-medium">{fmtCurrency(row.sales_revenue)}</span>,
            },
            {
                  key: 'gross_profit',
                  label: 'Gross Profit',
                  sortable: true,
                  align: 'right',
                  width: '1.3fr',
                  sortValue: (row) => row.gross_profit,
                  render: (row) => <span className="text-xs font-mono text-accent-gold font-medium">{fmtCurrency(row.gross_profit)}</span>,
            },
      ];

      if (correlations.length === 0) {
            return (
                  <div className="px-4 sm:px-6">
                        <EmptyState message="No posts logged yet. Log a post in the Log Posts tab, and its sales performance will show up here — including how long it took to sell and whether it beat the item's normal pace." />
                  </div>
            );
      }

      return (
            <div className="space-y-6">
                  <Stats stats={kpis} />
                  <div className="px-4 sm:px-6">
                        <p className="text-xs text-ink-muted font-body mb-3">
                              "Lift" compares units sold in the 7 days after a post to the 7 days before it — a rough read on whether the post moved product faster than usual. Items with no sales in the prior 7 days show "No prior sales" instead of a lift number, since there's no baseline to compare against.
                        </p>
                  </div>
                  {loading ? (
                        <div className="px-4 sm:px-6"><div className="h-40 animate-pulse rounded-lg bg-bg-hover" /></div>
                  ) : (
                        <DataTable
                              data={correlations}
                              columns={columns}
                              getRowId={(row) => row.tracking_id}
                              ariaLabel="WhatsApp post performance"
                              emptyMessage="No posts logged yet."
                              defaultSortKey="posted_at"
                              defaultSortDir="desc"
                              // onRowClick={(row) => row.items_id && navigate(`/products/${row.items_id}`)}
                              pagination={{
                                    page: correlationsPage.pager.page,
                                    totalPages: correlationsPage.totalPages,
                                    totalCount: correlationsPage.totalCount,
                                    pageSize: 20,
                                    onPageChange: correlationsPage.pager.setPage,
                              }}
                        />
                  )}
            </div>
      );
}
