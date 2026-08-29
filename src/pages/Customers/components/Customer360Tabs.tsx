import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { EChartsOption } from 'echarts';
import EChart from '@/components/charts/EChart';
import SearchInput from '@/components/ui/data/SearchInput';
import { CardHeader, CardTitle, EmptyState, Badge } from '@/components/ui/primitives';
import SimpleTable from '@/components/ui/data/SimpleTable';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import { usePagination } from '@/hooks/usePagination';
import { fmt, fmtCurrency, fmtDate } from '@/lib/utils';
import { CHART_COLORS } from '@/lib/constants/colors';
import {
      useCustomerDirectory,
      useCustomerDirectorySearch,
      useCustomerProfit,
      useCustomerCategorySummary,
      useCustomersAtRisk,
      useCustomerIntelligence,
} from '@/hooks/data';
import type {
      CustomerDirectoryRow,
      CustomerAtRiskRow,
      CustomerIntelligenceRow,
} from '@/hooks/data';
import type { BadgeVariant } from '@/components/ui/controls/primitives/types';

const PAGE_SIZE = 20;

const STATUS_BADGE: Record<string, BadgeVariant> = {
      DIAMOND: 'purple',
      PLATINUM: 'gold',
      GOLD: 'gold',
      SILVER: 'muted',
};

function TableSkeleton() {
      return <div className="mx-6 h-40 bg-bg-hover animate-pulse rounded-lg" />;
}

// ── Directory (customer_directory + customer_profit) ────────────────────────────────────
type DirectoryRow = CustomerDirectoryRow & { profit: number | null };

export function DirectoryTab() {
      const navigate = useNavigate();
      const pager = usePagination(PAGE_SIZE);
      const directory = useCustomerDirectory(pager.limit, pager.offset);
      const profit = useCustomerProfit();

      const [search, setSearch] = useState('');
      const localMatches = useMemo(() => {
            if (!search.trim()) return null;
            const q = search.trim().toLowerCase();
            return (directory.data?.data ?? []).filter((row) => row.display_name.toLowerCase().includes(q));
      }, [search, directory.data]);
      const needsRemoteSearch = search.trim().length > 0 && (localMatches?.length ?? 0) === 0 && !directory.isLoading;
      const remoteSearch = useCustomerDirectorySearch(search.trim(), needsRemoteSearch);

      const searching = search.trim().length > 0;
      const totalCount = searching ? (localMatches?.length ? localMatches.length : (remoteSearch.data?.count ?? 0)) : (directory.data?.count ?? 0);
      const totalPages = searching ? 1 : Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

      const profitById = useMemo(() => {
            const map = new Map<number, number>();
            for (const row of profit.data?.data ?? []) {
                  map.set(row.pos_customer_id, Number(row.profit));
            }
            return map;
      }, [profit.data]);

      const sourceRows = searching
            ? (localMatches?.length ? localMatches : remoteSearch.data?.data ?? [])
            : directory.data?.data ?? [];

      const rows: DirectoryRow[] = useMemo(() => {
            return sourceRows.map((row) => ({
                  ...row,
                  profit: profitById.get(row.pos_customer_id) ?? null,
            }));
      }, [sourceRows, profitById]);

      const columns: ColumnDef<DirectoryRow>[] = [
            {
                  key: 'display_name',
                  label: 'Customer',
                  width: '1.8fr',
                  render: (row) => (
                        <div className="min-w-0">
                              <p className="text-xs font-body text-ink-primary truncate">{row.display_name}</p>
                              {row.company_name && <p className="text-[10px] text-ink-muted font-body">{row.company_name}</p>}
                        </div>
                  ),
            },
            {
                  key: 'phone',
                  label: 'Contact',
                  width: '1.4fr',
                  render: (row) => (
                        <div className="text-[11px] text-ink-secondary font-mono">
                              {row.phone && <p>{row.phone}</p>}
                              {row.email && <p className="text-ink-muted truncate">{row.email}</p>}
                              {!row.phone && !row.email && <span className="text-ink-faint">—</span>}
                        </div>
                  ),
            },
            {
                  key: 'category',
                  label: 'Tier',
                  width: '1fr',
                  render: (row) => <Badge variant="teal">{row.category}</Badge>,
            },
            {
                  key: 'status_level',
                  label: 'Status',
                  width: '1fr',
                  render: (row) => <Badge variant={STATUS_BADGE[row.status_level] ?? 'muted'}>{row.status_level}</Badge>,
            },
            {
                  key: 'total_spent',
                  label: 'Total Spent',
                  sortable: true,
                  align: 'right',
                  width: '1.2fr',
                  sortValue: (row) => Number(row.total_spent),
                  render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmtCurrency(row.total_spent)}</span>,
            },
            {
                  key: 'profit',
                  label: 'Profit',
                  sortable: true,
                  align: 'right',
                  width: '1.2fr',
                  sortValue: (row) => row.profit ?? 0,
                  render: (row) => (
                        <span className={row.profit !== null ? 'text-xs font-mono text-accent-gold font-medium' : 'text-xs font-mono text-ink-faint'}>
                              {row.profit !== null ? fmtCurrency(row.profit) : '—'}
                        </span>
                  ),
            },
            {
                  key: 'days_since_last_order',
                  label: 'Last Order',
                  sortable: true,
                  align: 'right',
                  width: '1.1fr',
                  sortValue: (row) => row.days_since_last_order ?? -1,
                  render: (row) => (
                        <span className="text-xs font-mono text-ink-secondary">
                              {row.days_since_last_order !== null ? `${fmt(row.days_since_last_order)}d ago` : '—'}
                        </span>
                  ),
            },
      ];

      return (
            <div>
                  <div className="px-4 sm:px-6 mb-3">
                        <SearchInput
                              value={search}
                              onChange={setSearch}
                              placeholder="Search all customers by name…"
                              className="max-w-sm"
                        />
                        {searching && (
                              <p className="text-[11px] text-ink-faint font-body mt-1.5">
                                    {localMatches?.length
                                          ? `${localMatches.length} match${localMatches.length === 1 ? '' : 'es'} on this page`
                                          : remoteSearch.isFetching
                                          ? 'Nothing on this page — searching the full customer list…'
                                          : (remoteSearch.data?.data?.length ?? 0) > 0
                                          ? `Nothing on this page — found ${remoteSearch.data?.count ?? remoteSearch.data?.data?.length} match(es) elsewhere`
                                          : 'No matches found.'}
                              </p>
                        )}
                  </div>
                  <p className="px-4 sm:px-6 text-xs text-ink-muted font-body mb-3">
                        Full contact + financial directory, with per-customer profit joined in
                  </p>
                  {directory.isLoading ? (
                        <TableSkeleton />
                  ) : (
                        <DataTable
                              data={rows}
                              columns={columns}
                              getRowId={(row) => row.pos_customer_id}
                              ariaLabel="Customer directory"
                              emptyMessage="No customers found."
                              defaultSortKey="total_spent"
                              defaultSortDir="desc"
                              onRowClick={(row) => navigate(`/customers/customer/${row.pos_customer_id}?ctm_name=${encodeURIComponent(row.display_name)}`)}
                              pagination={
                                    searching
                                          ? undefined
                                          : {
                                                page: pager.page,
                                                totalPages,
                                                totalCount,
                                                pageSize: PAGE_SIZE,
                                                onPageChange: pager.setPage,
                                                loading: directory.isFetching,
                                          }
                              }
                        />
                  )}
            </div>
      );
}

// ── Segments (customer_category_summary) ────────────────────────────────────
export function SegmentsTab() {
      const summary = useCustomerCategorySummary();
      const rows = summary.data?.data ?? [];

      const chartOption: EChartsOption = {
            backgroundColor: 'transparent',
            grid: { left: 90, right: 24, top: 8, bottom: 8 },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (value) => fmtCurrency(Number(value)) },
            xAxis: { type: 'value', axisLabel: { color: '#8A8578' }, splitLine: { lineStyle: { color: 'rgba(138,133,120,.18)', type: 'dashed' } } },
            yAxis: {
                  type: 'category',
                  data: rows.map((row) => row.category),
                  axisLabel: { color: '#8A8578', fontSize: 11 },
                  axisLine: { lineStyle: { color: '#3A342A' } },
            },
            series: [
                  {
                        type: 'bar',
                        barMaxWidth: 22,
                        data: rows.map((row, index) => ({
                              value: Number(row.total_revenue),
                              itemStyle: { color: Object.values(CHART_COLORS)[index % 6], borderRadius: [0, 4, 4, 0] },
                        })),
                  },
            ],
      };

      return (
            <div className="space-y-5">
                  <section className="rounded-lg border border-bg-border bg-bg-panel p-5">
                        <CardHeader><CardTitle>Revenue by Segment</CardTitle></CardHeader>
                        {summary.isLoading ? (
                              <div className="h-52 animate-pulse rounded bg-bg-hover" />
                        ) : rows.length ? (
                              <EChart option={chartOption} height="220px" />
                        ) : (
                              <EmptyState message="No segment data." />
                        )}
                  </section>

                  {!summary.isLoading && rows.length > 0 && (
                        <section className="rounded-lg border border-bg-border bg-bg-panel p-5">
                              <SimpleTable
                                    headers={['Segment', 'Customers', 'Avg Spent', 'Avg Orders', '% of Revenue']}
                                    rows={rows}
                                    getRowKey={(row) => row.category}
                                    renderCell={(row, columnIndex) => {
                                          switch (columnIndex) {
                                                case 0:
                                                      return <span className="text-xs font-body text-ink-primary font-medium">{row.category}</span>;
                                                case 1:
                                                      return <span className="text-xs font-mono text-ink-secondary">{fmt(row.customer_count)}</span>;
                                                case 2:
                                                      return <span className="text-xs font-mono text-ink-secondary">{fmtCurrency(row.avg_spent)}</span>;
                                                case 3:
                                                      return <span className="text-xs font-mono text-ink-secondary">{Number(row.avg_orders).toFixed(1)}</span>;
                                                case 4:
                                                      return <span className="text-xs font-mono text-accent-gold font-medium">{Number(row.pct_of_revenue).toFixed(1)}%</span>;
                                                default:
                                                      return null;
                                          }
                                    }}
                              />
                        </section>
                  )}
            </div>
      );
}

// ── At Risk (customers_at_risk) ────────────────────────────────────
export function AtRiskTab() {
      const navigate = useNavigate();
      const pager = usePagination(PAGE_SIZE);
      const atRisk = useCustomersAtRisk(pager.limit, pager.offset);
      const rows = atRisk.data?.data ?? [];
      const totalCount = atRisk.data?.count ?? 0;
      const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

      const columns: ColumnDef<CustomerAtRiskRow>[] = [
            {
                  key: 'display_name',
                  label: 'Customer',
                  width: '1.8fr',
                  render: (row) => (
                        <div className="min-w-0">
                              <p className="text-xs font-body text-ink-primary truncate">{row.display_name}</p>
                              {row.phone && <p className="text-[10px] text-ink-muted font-mono">{row.phone}</p>}
                        </div>
                  ),
            },
            {
                  key: 'category',
                  label: 'Tier',
                  width: '1fr',
                  render: (row) => <Badge variant="teal">{row.category}</Badge>,
            },
            {
                  key: 'lifetime_value',
                  label: 'Lifetime Value',
                  sortable: true,
                  align: 'right',
                  width: '1.3fr',
                  sortValue: (row) => Number(row.lifetime_value),
                  render: (row) => <span className="text-xs font-mono text-accent-gold font-medium">{fmtCurrency(row.lifetime_value)}</span>,
            },
            {
                  key: 'days_since_last_order',
                  label: 'Days Quiet',
                  sortable: true,
                  align: 'right',
                  width: '1.1fr',
                  sortValue: (row) => row.days_since_last_order ?? 0,
                  render: (row) => <span className="text-xs font-mono text-accent-red">{fmt(row.days_since_last_order ?? 0)}d</span>,
            },
            {
                  key: 'last_order_at',
                  label: 'Last Order',
                  width: '1.2fr',
                  render: (row) => <span className="text-xs font-mono text-ink-muted">{row.last_order_at ? fmtDate(row.last_order_at) : '—'}</span>,
            },
      ];

      return (
            <div>
                  <p className="px-6 text-xs text-ink-muted font-body mb-3">
                        Valuable customers who have gone quiet — worth a check-in
                  </p>
                  {atRisk.isLoading ? (
                        <TableSkeleton />
                  ) : (
                        <DataTable
                              data={rows}
                              columns={columns}
                              getRowId={(row) => row.pos_customer_id}
                              ariaLabel="Customers at risk"
                              emptyMessage="No customers currently flagged as at-risk."
                              defaultSortKey="lifetime_value"
                              defaultSortDir="desc"
                              onRowClick={(row) => navigate(`/customers/customer/${row.pos_customer_id}?ctm_name=${encodeURIComponent(row.display_name)}`)}
                              pagination={{
                                    page: pager.page,
                                    totalPages,
                                    totalCount,
                                    pageSize: PAGE_SIZE,
                                    onPageChange: pager.setPage,
                                    loading: atRisk.isFetching,
                              }}
                        />
                  )}
            </div>
      );
}

// ── Purchase Behavior (v_customer_intelligence) ────────────────────────────────────
export function BehaviorTab() {
      const navigate = useNavigate();
      const pager = usePagination(PAGE_SIZE);
      const intelligence = useCustomerIntelligence(pager.limit, pager.offset);
      const rows = intelligence.data?.data ?? [];
      const totalCount = intelligence.data?.count ?? 0;
      const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

      const columns: ColumnDef<CustomerIntelligenceRow>[] = [
            {
                  key: 'customer_name',
                  label: 'Customer',
                  width: '1.6fr',
                  render: (row) => <span className="text-xs font-body text-ink-primary truncate">{row.customer_name}</span>,
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
                  key: 'total_purchases',
                  label: 'Purchases',
                  sortable: true,
                  align: 'right',
                  width: '1fr',
                  sortValue: (row) => Number(row.total_purchases),
                  render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmt(row.total_purchases)}</span>,
            },
            {
                  key: 'first_purchase_at',
                  label: 'Customer Since',
                  sortable: true,
                  width: '1.2fr',
                  sortValue: (row) => (row.first_purchase_at ? new Date(row.first_purchase_at).getTime() : 0),
                  render: (row) => <span className="text-xs font-mono text-ink-muted">{row.first_purchase_at ? fmtDate(row.first_purchase_at) : '—'}</span>,
            },
            {
                  key: 'last_purchase_at',
                  label: 'Last Seen',
                  sortable: true,
                  width: '1.2fr',
                  sortValue: (row) => (row.last_purchase_at ? new Date(row.last_purchase_at).getTime() : 0),
                  render: (row) => <span className="text-xs font-mono text-ink-muted">{row.last_purchase_at ? fmtDate(row.last_purchase_at) : '—'}</span>,
            },
            {
                  key: 'lifetime_value',
                  label: 'Lifetime Value',
                  sortable: true,
                  align: 'right',
                  width: '1.3fr',
                  sortValue: (row) => Number(row.lifetime_value),
                  render: (row) => <span className="text-xs font-mono text-accent-gold font-medium">{fmtCurrency(row.lifetime_value)}</span>,
            },
      ];

      return (
            <div>
                  <p className="px-6 text-xs text-ink-muted font-body mb-3">
                        Basket size and tenure — who buys often vs. who buys big
                  </p>
                  {intelligence.isLoading ? (
                        <TableSkeleton />
                  ) : (
                        <DataTable
                              data={rows}
                              columns={columns}
                              getRowId={(row) => row.pos_customer_id}
                              ariaLabel="Customer purchase behavior"
                              emptyMessage="No purchase behavior data."
                              defaultSortKey="lifetime_value"
                              defaultSortDir="desc"
                              onRowClick={(row) => navigate(`/customers/customer/${row.pos_customer_id}?ctm_name=${encodeURIComponent(row.customer_name)}`)}
                              pagination={{
                                    page: pager.page,
                                    totalPages,
                                    totalCount,
                                    pageSize: PAGE_SIZE,
                                    onPageChange: pager.setPage,
                                    loading: intelligence.isFetching,
                              }}
                        />
                  )}
            </div>
      );
}
