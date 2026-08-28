import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import EChart from '@/components/charts/EChart';
import { CardHeader, CardTitle, EmptyState } from '@/components/ui/primitives';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import { fmtCurrency, fmt, fmtDate } from '@/lib/utils';
import { CHART_COLORS } from '@/lib/constants/colors';
import { useProductPeakPeriod, useCategoryBestDay, useProductPerformance } from '@/hooks/data';
import type { ProductPeakPeriodRow } from '@/hooks/data';

type PeakRow = ProductPeakPeriodRow & { margin_pct: number | null };

export function SeasonalityTab() {
      const peakPeriod = useProductPeakPeriod();
      const bestDay = useCategoryBestDay();
      const performance = useProductPerformance();

      const marginByItem = useMemo(() => {
            const map = new Map<number, number>();
            for (const row of performance.data?.data ?? []) {
                  map.set(row.pos_item_id, Number(row.margin_pct));
            }
            return map;
      }, [performance.data]);

      const peakRows: PeakRow[] = useMemo(() => {
            return (peakPeriod.data?.data ?? []).map((row) => ({
                  ...row,
                  margin_pct: marginByItem.get(row.pos_item_id) ?? null,
            }));
      }, [peakPeriod.data, marginByItem]);

      const bestDayRows = bestDay.data?.data ?? [];

      const bestDayOption: EChartsOption = {
            backgroundColor: 'transparent',
            grid: { left: 90, right: 24, top: 8, bottom: 8 },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, valueFormatter: (value) => fmtCurrency(Number(value)) },
            xAxis: { type: 'value', axisLabel: { color: '#8A8578' }, splitLine: { lineStyle: { color: 'rgba(138,133,120,.18)', type: 'dashed' } } },
            yAxis: {
                  type: 'category',
                  data: bestDayRows.map((row) => `${row.category} (${row.day_of_week})`),
                  axisLabel: { color: '#8A8578', fontSize: 11 },
                  axisLine: { lineStyle: { color: '#3A342A' } },
            },
            series: [
                  {
                        type: 'bar',
                        barMaxWidth: 20,
                        data: bestDayRows.map((row, index) => ({
                              value: Number(row.revenue_on_best_day),
                              itemStyle: { color: Object.values(CHART_COLORS)[index % 6], borderRadius: [0, 4, 4, 0] },
                        })),
                  },
            ],
      };

      const columns: ColumnDef<PeakRow>[] = [
            {
                  key: 'item_name',
                  label: 'Item',
                  width: '2fr',
                  render: (row) => <span className="text-xs font-body text-ink-primary truncate">{row.item_name}</span>,
            },
            {
                  key: 'peak_week',
                  label: 'Peak Week',
                  sortable: true,
                  width: '1.2fr',
                  sortValue: (row) => new Date(row.peak_week).getTime(),
                  render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmtDate(row.peak_week)}</span>,
            },
            {
                  key: 'peak_week_quantity',
                  label: 'Peak Qty',
                  sortable: true,
                  align: 'right',
                  width: '1fr',
                  sortValue: (row) => Number(row.peak_week_quantity),
                  render: (row) => <span className="text-xs font-mono text-ink-secondary">{fmt(row.peak_week_quantity)}</span>,
            },
            {
                  key: 'margin_pct',
                  label: 'Margin',
                  sortable: true,
                  align: 'right',
                  width: '1fr',
                  sortValue: (row) => row.margin_pct ?? 0,
                  render: (row) => (
                        <span className="text-xs font-mono text-ink-secondary">
                              {row.margin_pct !== null ? `${row.margin_pct.toFixed(1)}%` : '—'}
                        </span>
                  ),
            },
            {
                  key: 'peak_week_revenue',
                  label: 'Peak Revenue',
                  sortable: true,
                  align: 'right',
                  width: '1.3fr',
                  sortValue: (row) => Number(row.peak_week_revenue),
                  render: (row) => <span className="text-xs font-mono text-accent-gold font-medium">{fmtCurrency(row.peak_week_revenue)}</span>,
            },
      ];

      return (
            <div className="space-y-5 px-4">
                  <section className="rounded-lg border border-bg-border bg-bg-panel p-5">
                        <CardHeader><CardTitle>Best Day by Category</CardTitle></CardHeader>
                        {bestDay.isLoading ? (
                              <div className="h-52 animate-pulse rounded bg-bg-hover" />
                        ) : bestDayRows.length ? (
                              <EChart option={bestDayOption} height="240px" />
                        ) : (
                              <EmptyState message="No category-day data." />
                        )}
                  </section>

                  <div>
                        <p className="text-xs text-ink-muted font-body mb-3">
                              Each item's single best week on record — useful for planning ahead of the season that already worked once
                        </p>
                        {peakPeriod.isLoading ? (
                              <div className="h-64 animate-pulse rounded-lg bg-bg-hover" />
                        ) : (
                              <DataTable
                                    data={peakRows}
                                    columns={columns}
                                    getRowId={(row) => row.pos_item_id}
                                    ariaLabel="Product peak periods"
                                    emptyMessage="No peak-period data."
                                    defaultSortKey="peak_week_revenue"
                                    defaultSortDir="desc"
                              />
                        )}
                  </div>
            </div>
      );
}
