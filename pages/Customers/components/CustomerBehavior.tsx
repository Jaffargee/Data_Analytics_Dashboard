import React, { useMemo, useRef } from 'react';
import { Card, CardHeader } from '@fluentui/react-components';
import CardTitle from '../../../components/ui/primitives/CardTitle';
import StatCard from '../../../components/ui/primitives/StatCard';
import { Clock, Repeat, RotateCcw, ShoppingBag } from 'lucide-react';
import { fmt } from '../../../lib/utils';
import { useEChart, CHART_COLORS } from '../hooks/useEChart';

interface SaleRow {
      pos_sale_id: number | string;
      invoice_datetime: string;
      items_sold: number;
      items_returned: number;
      invoice_total: number;
}

interface CustomerBehaviorProps {
      sales: SaleRow[];
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const GAP_BUCKETS = ['0-7d', '8-14d', '15-30d', '31-60d', '60d+'];

function bucketGap(days: number): string {
      if (days <= 7) return '0-7d';
      if (days <= 14) return '8-14d';
      if (days <= 30) return '15-30d';
      if (days <= 60) return '31-60d';
      return '60d+';
}

export default function CustomerBehavior({ sales }: CustomerBehaviorProps) {
      const dayChartRef = useRef<HTMLDivElement>(null);
      const gapChartRef = useRef<HTMLDivElement>(null);

      const sorted = useMemo(
            () => [...sales].sort((a, b) => new Date(a.invoice_datetime).getTime() - new Date(b.invoice_datetime).getTime()),
            [sales]
      );

      const dayOfWeekCounts = useMemo(() => {
            const counts = new Array(7).fill(0);
            for (const s of sales) {
                  const d = new Date(s.invoice_datetime);
                  if (!Number.isNaN(d.getTime())) counts[d.getDay()]++;
            }
            return counts;
      }, [sales]);

      const gapDays = useMemo(() => {
            const gaps: number[] = [];
            for (let i = 1; i < sorted.length; i++) {
                  const prev = new Date(sorted[i - 1].invoice_datetime).getTime();
                  const curr = new Date(sorted[i].invoice_datetime).getTime();
                  gaps.push((curr - prev) / (1000 * 60 * 60 * 24));
            }
            return gaps;
      }, [sorted]);

      const gapBucketCounts = useMemo(() => {
            const counts: Record<string, number> = Object.fromEntries(GAP_BUCKETS.map((b) => [b, 0]));
            for (const g of gapDays) counts[bucketGap(g)]++;
            return GAP_BUCKETS.map((b) => counts[b]);
      }, [gapDays]);

      const stats = useMemo(() => {
            const avgGap = gapDays.length ? gapDays.reduce((s, g) => s + g, 0) / gapDays.length : 0;
            const totalItems = sales.reduce((s, r) => s + Number(r.items_sold || 0), 0);
            const totalReturned = sales.reduce((s, r) => s + Number(r.items_returned || 0), 0);
            const returnRate = totalItems ? (totalReturned / totalItems) * 100 : 0;
            const avgBasket = sales.length ? totalItems / sales.length : 0;
            const busiestDayIndex = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts));
            const busiestDay = sales.length ? DAY_LABELS[busiestDayIndex] : '—';

            return { avgGap, returnRate, avgBasket, busiestDay };
      }, [gapDays, sales, dayOfWeekCounts]);

      useEChart(
            dayChartRef,
            {
                  backgroundColor: 'transparent',
                  grid: { left: 8, right: 16, top: 16, bottom: 24, containLabel: true },
                  tooltip: {
                        trigger: 'axis',
                        axisPointer: { type: 'shadow' },
                        backgroundColor: CHART_COLORS.panel,
                        borderColor: CHART_COLORS.border,
                        textStyle: { color: CHART_COLORS.ink, fontSize: 12 },
                  },
                  xAxis: {
                        type: 'category',
                        data: DAY_LABELS,
                        axisLabel: { color: CHART_COLORS.inkMuted, fontSize: 10 },
                        axisLine: { lineStyle: { color: CHART_COLORS.border } },
                        axisTick: { show: false },
                  },
                  yAxis: {
                        type: 'value',
                        axisLabel: { color: CHART_COLORS.inkMuted, fontSize: 10 },
                        splitLine: { lineStyle: { color: CHART_COLORS.border, type: 'dashed' } },
                        axisLine: { show: false },
                        axisTick: { show: false },
                  },
                  series: [
                        {
                              type: 'bar',
                              data: dayOfWeekCounts,
                              barMaxWidth: 32,
                              itemStyle: { color: CHART_COLORS.gold, borderRadius: [4, 4, 0, 0] },
                        },
                  ],
            },
            [dayOfWeekCounts]
      );

      useEChart(
            gapChartRef,
            {
                  backgroundColor: 'transparent',
                  grid: { left: 8, right: 16, top: 16, bottom: 24, containLabel: true },
                  tooltip: {
                        trigger: 'axis',
                        axisPointer: { type: 'shadow' },
                        backgroundColor: CHART_COLORS.panel,
                        borderColor: CHART_COLORS.border,
                        textStyle: { color: CHART_COLORS.ink, fontSize: 12 },
                  },
                  xAxis: {
                        type: 'category',
                        data: GAP_BUCKETS,
                        axisLabel: { color: CHART_COLORS.inkMuted, fontSize: 10 },
                        axisLine: { lineStyle: { color: CHART_COLORS.border } },
                        axisTick: { show: false },
                  },
                  yAxis: {
                        type: 'value',
                        axisLabel: { color: CHART_COLORS.inkMuted, fontSize: 10 },
                        splitLine: { lineStyle: { color: CHART_COLORS.border, type: 'dashed' } },
                        axisLine: { show: false },
                        axisTick: { show: false },
                  },
                  series: [
                        {
                              type: 'bar',
                              data: gapBucketCounts,
                              barMaxWidth: 32,
                              itemStyle: { color: CHART_COLORS.teal, borderRadius: [4, 4, 0, 0] },
                        },
                  ],
            },
            [gapBucketCounts]
      );

      if (!sales.length) {
            return <p className="text-xs text-ink-muted">Not enough purchase history to analyze behavior yet.</p>;
      }

      return (
            <div className="space-y-6">
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        <StatCard
                              label="Avg. Days Between Visits"
                              value={fmt(Math.round(stats.avgGap))}
                              icon={<Clock size={14} />}
                              accent="gold"
                        />
                        <StatCard
                              label="Busiest Day"
                              value={stats.busiestDay}
                              icon={<Repeat size={14} />}
                              accent="teal"
                        />
                        <StatCard
                              label="Avg. Items Per Visit"
                              value={stats.avgBasket.toFixed(1)}
                              icon={<ShoppingBag size={14} />}
                              accent="purple"
                        />
                        <StatCard
                              label="Return Rate"
                              value={`${stats.returnRate.toFixed(1)}%`}
                              icon={<RotateCcw size={14} />}
                              accent={stats.returnRate > 10 ? 'red' : 'teal'}
                        />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <Card appearance="outline">
                              <CardHeader>
                                    <CardTitle>Purchases by Day of Week</CardTitle>
                              </CardHeader>
                              <div className="p-4 h-56">
                                    <div ref={dayChartRef} style={{ width: '100%', height: '100%' }} />
                              </div>
                        </Card>

                        <Card appearance="outline">
                              <CardHeader>
                                    <CardTitle>Time Between Visits</CardTitle>
                              </CardHeader>
                              <div className="p-4 h-56">
                                    <div ref={gapChartRef} style={{ width: '100%', height: '100%' }} />
                              </div>
                        </Card>
                  </div>
            </div>
      );
}