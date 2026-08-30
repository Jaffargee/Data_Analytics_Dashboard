import { useMemo } from 'react';
import { TopBar } from '@/components/ui';
import { Stats, Badge, CardHeader, CardTitle, EmptyState } from '@/components/ui/primitives';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import { usePaginatedRows } from '@/hooks/usePagination';
import EChart from '@/components/charts/EChart';
import type { EChartsOption } from 'echarts';
import { useDeliveries, useDeliveryTrips } from '@/hooks/data';
import type { DeliveryRow, DeliveryTripRow, DeliveryStatus, TripStatus } from '@/hooks/data';
import type { StatCardProps } from '@/components/ui/controls/primitives/types';
import type { BadgeVariant } from '@/components/ui/controls/primitives/types';
import { fmt, fmtCurrency, fmtDate } from '@/lib/utils';
import { CHART_COLORS } from '@/lib/constants/colors';
import { Truck, PackageCheck, PackageX, Clock } from 'lucide-react';

const STATUS_BADGE: Record<DeliveryStatus, BadgeVariant> = {
      PENDING: 'muted',
      DISPATCHED_TO_PARK: 'gold',
      IN_TRANSIT: 'purple',
      DELIVERED: 'teal',
      FAILED: 'red',
};

const TRIP_STATUS_BADGE: Record<TripStatus, BadgeVariant> = {
      LOADING: 'gold',
      DEPARTED: 'purple',
      COMPLETED: 'teal',
};

const STATUS_ORDER: DeliveryStatus[] = ['PENDING', 'DISPATCHED_TO_PARK', 'IN_TRANSIT', 'DELIVERED', 'FAILED'];

function statusLabel(status: DeliveryStatus): string {
      return status.replace(/_/g, ' ');
}

export default function DeliveriesPage() {
      const deliveries = useDeliveries();
      const trips = useDeliveryTrips();

      const rows = deliveries.data?.data ?? [];
      const tripRows = trips.data?.data ?? [];
      const deliveriesPage = usePaginatedRows(rows, 20);
      const tripsPage = usePaginatedRows(tripRows, 20);

      const totals = useMemo(() => {
            const byStatus = new Map<DeliveryStatus, number>();
            for (const row of rows) {
                  byStatus.set(row.status, (byStatus.get(row.status) ?? 0) + 1);
            }
            const inTransit = (byStatus.get('DISPATCHED_TO_PARK') ?? 0) + (byStatus.get('IN_TRANSIT') ?? 0);
            const delivered = byStatus.get('DELIVERED') ?? 0;
            const unpaidFees = rows
                  .filter((row) => !row.is_paid)
                  .reduce((sum, row) => sum + Number(row.delivery_fee ?? 0), 0);
            const codPending = rows
                  .filter((row) => row.status !== 'DELIVERED' && Number(row.cod_amount ?? 0) > 0)
                  .reduce((sum, row) => sum + Number(row.cod_amount ?? 0), 0);
            return { byStatus, inTransit, delivered, unpaidFees, codPending };
      }, [rows]);

      const statusChartData = useMemo(() => {
            const palette = Object.values(CHART_COLORS);
            return STATUS_ORDER.map((status, index) => ({
                  label: statusLabel(status),
                  value: totals.byStatus.get(status) ?? 0,
                  color: palette[index % palette.length],
            })).filter((point) => point.value > 0);
      }, [totals]);

      const destinationChartData = useMemo(() => {
            const byState = new Map<string, number>();
            for (const row of rows) {
                  const key = row.destination_state ?? 'Unspecified';
                  byState.set(key, (byState.get(key) ?? 0) + 1);
            }
            return Array.from(byState.entries()).sort((a, b) => b[1] - a[1]);
      }, [rows]);

      const kpis: StatCardProps[] = [
            {
                  label: 'Total Deliveries',
                  value: fmt(rows.length),
                  icon: <Truck size={14} />,
                  accent: 'gold',
                  delay: 0,
            },
            {
                  label: 'In Transit',
                  value: fmt(totals.inTransit),
                  sub: 'Dispatched to park or on the road',
                  icon: <Clock size={14} />,
                  accent: 'purple',
                  delay: 100,
            },
            {
                  label: 'Delivered',
                  value: fmt(totals.delivered),
                  icon: <PackageCheck size={14} />,
                  accent: 'teal',
                  delay: 200,
            },
            {
                  label: 'Unpaid Delivery Fees',
                  value: fmtCurrency(totals.unpaidFees),
                  sub: `${fmtCurrency(totals.codPending)} COD still to collect`,
                  icon: <PackageX size={14} />,
                  accent: 'red',
                  delay: 300,
            },
      ];

      const statusOption: EChartsOption = {
            backgroundColor: 'transparent',
            grid: { left: 100, right: 24, top: 8, bottom: 8 },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            xAxis: { type: 'value', axisLabel: { color: '#8A8578' }, splitLine: { lineStyle: { color: 'rgba(138,133,120,.18)', type: 'dashed' } } },
            yAxis: {
                  type: 'category',
                  data: statusChartData.map((point) => point.label),
                  axisLabel: { color: '#8A8578', fontSize: 11 },
                  axisLine: { lineStyle: { color: '#3A342A' } },
            },
            series: [
                  {
                        type: 'bar',
                        barMaxWidth: 22,
                        data: statusChartData.map((point) => ({ value: point.value, itemStyle: { color: point.color, borderRadius: [0, 4, 4, 0] } })),
                  },
            ],
      };

      const deliveryColumns: ColumnDef<DeliveryRow>[] = [
            {
                  key: 'customer_name',
                  label: 'Customer',
                  width: '1.6fr',
                  render: (row) => (
                        <div className="min-w-0">
                              <p className="text-xs font-body text-ink-primary truncate">{row.customer_name || 'Unknown'}</p>
                              {row.pos_sale_id && (
                                    <p className="text-[10px] text-ink-muted font-mono">Sale #{row.pos_sale_id}</p>
                              )}
                        </div>
                  ),
            },
            {
                  key: 'destination_state',
                  label: 'Destination',
                  width: '1.4fr',
                  render: (row) => (
                        <span className="text-xs font-body text-ink-secondary">
                              {[row.destination_lga, row.destination_state].filter(Boolean).join(', ') || row.destination_label || '—'}
                        </span>
                  ),
            },
            {
                  key: 'transit_mode',
                  label: 'Mode',
                  width: '1.1fr',
                  render: (row) => <span className="text-xs font-mono text-ink-muted">{row.transit_mode.replace('_', ' ')}</span>,
            },
            {
                  key: 'status',
                  label: 'Status',
                  width: '1.4fr',
                  render: (row) => <Badge variant={STATUS_BADGE[row.status]}>{statusLabel(row.status)}</Badge>,
            },
            {
                  key: 'driver_name',
                  label: 'Driver / Vehicle',
                  width: '1.4fr',
                  render: (row) => (
                        <span className="text-xs font-body text-ink-secondary">
                              {row.driver_name ? `${row.driver_name}${row.vehicle_plate ? ` · ${row.vehicle_plate}` : ''}` : '—'}
                        </span>
                  ),
            },
            {
                  key: 'delivery_fee',
                  label: 'Fee',
                  sortable: true,
                  align: 'right',
                  width: '1.1fr',
                  sortValue: (row) => Number(row.delivery_fee) || 0,
                  render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmtCurrency(row.delivery_fee ?? 0)}</span>,
            },
            {
                  key: 'cod_amount',
                  label: 'COD',
                  sortable: true,
                  align: 'right',
                  width: '1.1fr',
                  sortValue: (row) => Number(row.cod_amount) || 0,
                  render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmtCurrency(row.cod_amount ?? 0)}</span>,
            },
            {
                  key: 'is_paid',
                  label: 'Paid',
                  width: '0.9fr',
                  render: (row) => <Badge variant={row.is_paid ? 'teal' : 'red'}>{row.is_paid ? 'Paid' : 'Unpaid'}</Badge>,
            },
            {
                  key: 'created_at',
                  label: 'Created',
                  sortable: true,
                  width: '1.2fr',
                  sortValue: (row) => new Date(row.created_at).getTime(),
                  render: (row) => <span className="text-xs font-mono text-ink-muted">{fmtDate(row.created_at)}</span>,
            },
      ];

      const tripColumns: ColumnDef<DeliveryTripRow>[] = [
            { key: 'park_name', label: 'Park', width: '1.6fr', render: (row) => <span className="text-xs font-body text-ink-primary">{row.park_name || '—'}</span> },
            { key: 'destination_state', label: 'Destination', width: '1.2fr', render: (row) => <span className="text-xs font-body text-ink-secondary">{row.destination_state || '—'}</span> },
            { key: 'driver_name', label: 'Driver / Vehicle', width: '1.6fr', render: (row) => <span className="text-xs font-body text-ink-secondary">{row.driver_name ? `${row.driver_name}${row.vehicle_plate ? ` · ${row.vehicle_plate}` : ''}` : '—'}</span> },
            { key: 'status', label: 'Status', width: '1.1fr', render: (row) => <Badge variant={TRIP_STATUS_BADGE[row.status]}>{row.status}</Badge> },
            {
                  key: 'loaded_at',
                  label: 'Loaded',
                  sortable: true,
                  width: '1.2fr',
                  sortValue: (row) => (row.loaded_at ? new Date(row.loaded_at).getTime() : 0),
                  render: (row) => <span className="text-xs font-mono text-ink-muted">{row.loaded_at ? fmtDate(row.loaded_at) : '—'}</span>,
            },
      ];

      return (
            <div className="flex-1 flex flex-col min-h-screen">
                  <TopBar
                        title="Deliveries"
                        subtitle="Park-transit and market-run delivery tracking"
                  />
                  <main className="flex-1 space-y-6 pb-8">
                        <Stats stats={kpis} />

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 px-4">
                              <section className="rounded-lg border border-bg-border bg-bg-panel p-5">
                                    <CardHeader><CardTitle>By Status</CardTitle></CardHeader>
                                    {deliveries.isLoading ? (
                                          <div className="h-52 animate-pulse rounded bg-bg-hover" />
                                    ) : statusChartData.length ? (
                                          <EChart option={statusOption} height="220px" />
                                    ) : (
                                          <EmptyState message="No deliveries recorded yet." />
                                    )}
                              </section>
                              <section className="rounded-lg border border-bg-border bg-bg-panel p-5">
                                    <CardHeader><CardTitle>By Destination State</CardTitle></CardHeader>
                                    {deliveries.isLoading ? (
                                          <div className="h-52 animate-pulse rounded bg-bg-hover" />
                                    ) : destinationChartData.length ? (
                                          <div className="space-y-2">
                                                {destinationChartData.map(([state, count]) => (
                                                      <div key={state} className="flex items-center justify-between text-xs font-body">
                                                            <span className="text-ink-secondary">{state}</span>
                                                            <span className="font-mono text-ink-primary">{fmt(count)}</span>
                                                      </div>
                                                ))}
                                          </div>
                                    ) : (
                                          <EmptyState message="No destinations recorded yet." />
                                    )}
                              </section>
                        </div>

                        <div className="px-4">
                              {deliveries.isLoading ? (
                                    <div className="h-40 animate-pulse rounded-lg bg-bg-hover" />
                              ) : (
                                    <DataTable
                                          data={deliveriesPage.rows}
                                          columns={deliveryColumns}
                                          getRowId={(row) => row.id}
                                          ariaLabel="Deliveries"
                                          emptyMessage="No deliveries recorded yet."
                                          defaultSortKey="created_at"
                                          defaultSortDir="desc"
                                          pagination={{
                                                page: deliveriesPage.pager.page,
                                                totalPages: deliveriesPage.totalPages,
                                                totalCount: deliveriesPage.totalCount,
                                                pageSize: 20,
                                                onPageChange: deliveriesPage.pager.setPage,
                                          }}
                                    />
                              )}
                        </div>

                        <div className="px-4">
                              <p className="text-xs text-ink-muted font-body mb-3">Park Trips — vehicles loaded for inter-state transit</p>
                              {trips.isLoading ? (
                                    <div className="h-32 animate-pulse rounded-lg bg-bg-hover" />
                              ) : (
                                    <DataTable
                                          data={tripsPage.rows}
                                          columns={tripColumns}
                                          getRowId={(row) => row.id}
                                          ariaLabel="Delivery trips"
                                          emptyMessage="No park trips recorded yet."
                                          defaultSortKey="loaded_at"
                                          defaultSortDir="desc"
                                          pagination={{
                                                page: tripsPage.pager.page,
                                                totalPages: tripsPage.totalPages,
                                                totalCount: tripsPage.totalCount,
                                                pageSize: 20,
                                                onPageChange: tripsPage.pager.setPage,
                                          }}
                                    />
                              )}
                        </div>
                  </main>
            </div>
      );
}
