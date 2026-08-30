import { useNavigate } from 'react-router-dom';
import { Stats, Badge, EmptyState } from '@/components/ui/primitives';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import { usePaginatedRows } from '@/hooks/usePagination';
import type { StatCardProps } from '@/components/ui/controls/primitives/types';
import type { BadgeVariant } from '@/components/ui/controls/primitives/types';
import { fmt, fmtCurrency, fmtDate } from '@/lib/utils';
import { usePostCorrelation } from '../useCorrelation';
import type { PostCorrelation } from '../useCorrelation';
import { TrendingUp, Clock, Target, MessageCircle } from 'lucide-react';

function formatDuration(hours: number | null): string {
      if (hours === null) return '—';
      if (hours < 1) return `${Math.round(hours * 60)}m`;
      if (hours < 48) return `${hours.toFixed(1)}h`;
      return `${(hours / 24).toFixed(1)}d`;
}

export function PostPerformanceTab() {
      const navigate = useNavigate();
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
                  sub: summary.totalPosts ? `${summary.conversionRate.toFixed(0)}% of posts` : undefined,
                  icon: <Target size={14} />,
                  accent: 'gold',
                  delay: 100,
            },
            {
                  label: 'Avg. Time to First Sale',
                  value: formatDuration(summary.avgHoursToSale),
                  icon: <Clock size={14} />,
                  accent: 'purple',
                  delay: 200,
            },
            {
                  label: 'Avg. 7-Day Lift',
                  value: summary.avgLift !== null ? `${summary.avgLift >= 0 ? '+' : ''}${summary.avgLift.toFixed(0)}%` : '—',
                  sub: 'vs. the 7 days before the post',
                  icon: <TrendingUp size={14} />,
                  accent: summary.avgLift !== null && summary.avgLift < 0 ? 'red' : 'teal',
                  delay: 300,
            },
      ];

      const columns: ColumnDef<PostCorrelation>[] = [
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
                  key: 'hours_to_first_sale',
                  label: 'Time to First Sale',
                  sortable: true,
                  align: 'right',
                  width: '1.3fr',
                  sortValue: (row) => row.hours_to_first_sale ?? Number.MAX_SAFE_INTEGER,
                  render: (row) => (
                        <span className={row.hours_to_first_sale !== null ? 'text-xs font-mono text-ink-secondary' : 'text-xs font-mono text-ink-faint'}>
                              {row.hours_to_first_sale !== null ? formatDuration(row.hours_to_first_sale) : 'No sale yet'}
                        </span>
                  ),
            },
            {
                  key: 'units_after_7d',
                  label: 'Units (7d after)',
                  sortable: true,
                  align: 'right',
                  width: '1.2fr',
                  sortValue: (row) => row.units_after_7d,
                  render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmt(row.units_after_7d)}</span>,
            },
            {
                  key: 'lift_pct',
                  label: 'Lift vs. Prior 7d',
                  sortable: true,
                  align: 'right',
                  width: '1.3fr',
                  sortValue: (row) => row.lift_pct ?? -Infinity,
                  render: (row) => {
                        if (row.lift_pct === null) {
                              return <span className="text-xs font-mono text-ink-faint">No prior sales</span>;
                        }
                        const variant: BadgeVariant = row.lift_pct >= 0 ? 'teal' : 'red';
                        return <Badge variant={variant}>{row.lift_pct >= 0 ? '+' : ''}{row.lift_pct.toFixed(0)}%</Badge>;
                  },
            },
            {
                  key: 'revenue_after_7d',
                  label: 'Revenue (7d after)',
                  sortable: true,
                  align: 'right',
                  width: '1.3fr',
                  sortValue: (row) => row.revenue_after_7d,
                  render: (row) => <span className="text-xs font-mono text-accent-gold font-medium">{fmtCurrency(row.revenue_after_7d)}</span>,
            },
      ];

      if (!loading && correlations.length === 0) {
            return (
                  <div className="px-3 sm:px-6">
                        <EmptyState message="No posts logged yet. Log a post in the Log Posts tab, and its sales performance will show up here — including how long it took to sell and whether it beat the item's normal pace." />
                  </div>
            );
      }

      return (
            <div className="space-y-6">
                  <Stats stats={kpis} />
                  <div className="px-3 sm:px-6">
                        <p className="text-xs text-ink-muted font-body mb-3">
                              "Lift" compares units sold in the 7 days after a post to the 7 days before it — a rough read on whether the post moved product faster than usual. Items with no sales in the prior 7 days show "No prior sales" instead of a lift number, since there's no baseline to compare against.
                        </p>
                  </div>
                  {loading ? (
                        <div className="px-3 sm:px-6"><div className="h-40 animate-pulse rounded-lg bg-bg-hover" /></div>
                  ) : (
                        <DataTable
                              data={correlationsPage.rows}
                              columns={columns}
                              getRowId={(row) => row.id}
                              ariaLabel="WhatsApp post performance"
                              emptyMessage="No posts logged yet."
                              defaultSortKey="posted_at"
                              defaultSortDir="desc"
                              onRowClick={(row) => row.pos_item_id && navigate(`/products/${row.pos_item_id}`)}
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
