import React, { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';
import { CardHeader, CardTitle, EmptyState } from '@/components/ui/primitives';
import { fmtCurrency } from '@/lib/utils';
import { Card } from '@fluentui/react-components';
import type { EChartsOption } from "echarts";

interface ChartDataPoint {
      label: string;
      value: number;
}

interface DonutDataPoint {
      label: string;
      value: number;
      color: string;
}

interface ProductChartsProps {
      top10Chart: ChartDataPoint[];
      catDonut: DonutDataPoint[];
      itemsLoading: boolean;
      catsLoading: boolean;
}

// Adjust to match your tailwind.config theme exactly — ECharts renders to canvas,
// so it can't pick up Tailwind utility classes at runtime.
const COLORS = {
      gold: '#D4AF37',
      goldSoft: 'rgba(212, 175, 55, 0.35)',
      ink: '#E5E1D8',
      inkMuted: '#8A8578',
      border: 'rgba(138, 133, 120, 0.18)',
      panel: '#1A1712',
};

function useEChart(
      containerRef: React.RefObject<HTMLDivElement>,
      option: echarts.EChartsOption,
      deps: React.DependencyList
) {
      useEffect(() => {
            if (!containerRef.current) return;

            const chart = echarts.init(containerRef.current);
            chart.setOption(option);

            const resize = () => chart.resize();
            window.addEventListener('resize', resize);

            return () => {
                  window.removeEventListener('resize', resize);
                  chart.dispose();
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, deps);
}

function RevenueBarChart({ data, height = 200 }: { data: ChartDataPoint[]; height?: number }) {
      const ref = useRef<HTMLDivElement>(null);

      useEChart(
            ref,
            {
                  backgroundColor: 'transparent',
                  grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
                  tooltip: {
                        trigger: 'axis',
                        axisPointer: { type: 'shadow' },
                        backgroundColor: COLORS.panel,
                        borderColor: COLORS.border,
                        textStyle: { color: COLORS.ink, fontSize: 12 },
                        formatter: (params: any) => {
                              const p = params[0];
                              return `<div style="font-family: monospace;">${p.name}<br/><strong>${fmtCurrency(p.value)}</strong></div>`;
                        },
                  },
                  xAxis: {
                        type: 'category',
                        data: data.map((d) => d.label),
                        axisLabel: { color: COLORS.inkMuted, fontSize: 10, interval: 0, rotate: data.length > 6 ? 30 : 0 },
                        axisLine: { lineStyle: { color: COLORS.border } },
                        axisTick: { show: false },
                  },
                  yAxis: {
                        type: 'value',
                        axisLabel: {
                              color: COLORS.inkMuted,
                              fontSize: 10,
                              formatter: (v: number) => fmtCurrency(v),
                        },
                        splitLine: { lineStyle: { color: COLORS.border, type: 'dashed' } },
                        axisLine: { show: false },
                        axisTick: { show: false },
                  },
                  series: [
                        {
                              type: 'bar',
                              data: data.map((d) => d.value),
                              barMaxWidth: 28,
                              itemStyle: {
                                    color: {
                                          type: 'linear',
                                          x: 0,
                                          y: 0,
                                          x2: 0,
                                          y2: 1,
                                          colorStops: [
                                                { offset: 0, color: COLORS.gold },
                                                { offset: 1, color: COLORS.goldSoft },
                                          ],
                                    },
                                    borderRadius: [4, 4, 0, 0],
                              },
                        },
                  ],
            },
            [data, height]
      );

      return <div ref={ref} style={{ width: '100%', height }} />;
}

function CategoryDonutChart({ data, size = 180 }: { data: DonutDataPoint[]; size?: number }) {
      const ref = useRef<HTMLDivElement>(null);
      const total = useMemo(() => data.reduce((sum, d) => sum + Number(d.value), 0), [data]);

      useEChart(
            ref,
            {
                  backgroundColor: 'transparent',
                  tooltip: {
                        trigger: 'item',
                        backgroundColor: COLORS.panel,
                        borderColor: COLORS.border,
                        textStyle: { color: COLORS.ink, fontSize: 12 },
                        formatter: (p: any) =>
                              `<div style="font-family: monospace;">${p.name}<br/><strong>${fmtCurrency(p.value)}</strong> (${p.percent}%)</div>`,
                  },
                  legend: {
                        orient: 'vertical',
                        right: 0,
                        top: 'middle',
                        textStyle: { color: COLORS.inkMuted, fontSize: 11 },
                        itemWidth: 10,
                        itemHeight: 10,
                        icon: 'circle',
                  },
                  series: [
                        {
                              type: 'pie',
                              radius: ['55%', '78%'],
                              center: ['35%', '50%'],
                              avoidLabelOverlap: true,
                              label: { show: false },
                              labelLine: { show: false },
                              data: data.map((d) => ({
                                    name: d.label,
                                    value: d.value,
                                    itemStyle: { color: d.color },
                              })),
                        },
                  ],
            },
            [data, size]
      );

      return (
            <div className="relative" style={{ width: '100%', height: size }}>
                  <div ref={ref} style={{ width: '100%', height: size }} />
                  <div
                        className="absolute pointer-events-none flex flex-col items-center justify-center"
                        style={{ left: '35%', top: '50%', transform: 'translate(-50%, -50%)' }}
                  >
                        <p className="text-[10px] text-ink-muted">Total</p>
                        <p className="text-xs font-mono text-accent-gold font-medium">{fmtCurrency(total)}</p>
                  </div>
            </div>
      );
}

export function ProductCharts({ top10Chart, catDonut, itemsLoading, catsLoading }: ProductChartsProps) {
      return (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 px-4">
                  <Card appearance="outline">
                        <CardHeader>
                              <CardTitle>Top 10 by Revenue</CardTitle>
                        </CardHeader>
                        {itemsLoading ? (
                              <div className="h-52 bg-bg-hover animate-pulse rounded-lg" />
                        ) : (
                              <RevenueBarChart data={top10Chart} height={200} />
                        )}
                  </Card>
                  <Card appearance="outline">
                        <CardHeader>
                              <CardTitle>Revenue by Category</CardTitle>
                        </CardHeader>
                        {catsLoading ? (
                              <div className="h-52 bg-bg-hover animate-pulse rounded-lg" />
                        ) : catDonut.length ? (
                              <CategoryDonutChart data={catDonut} size={180} />
                        ) : (
                              <EmptyState />
                        )}
                  </Card>
            </div>
      );
}


interface EChartProps {
      option: EChartsOption;
      height?: string;
      className?: string;
      loading?: boolean;
}

export function EChart({
      option,
      height = "320px",
      className = "",
      loading = false,
}: EChartProps): JSX.Element {
      const containerRef = useRef<HTMLDivElement | null>(null);
      const chartRef = useRef<echarts.ECharts | null>(null);

      useEffect(() => {
            if (!containerRef.current) return;

            const chart = echarts.init(containerRef.current);
            chartRef.current = chart;

            const handleResize = () => chart.resize();
            window.addEventListener("resize", handleResize);

            const resizeObserver = new ResizeObserver(() => chart.resize());
            resizeObserver.observe(containerRef.current);

            return () => {
                  window.removeEventListener("resize", handleResize);
                  resizeObserver.disconnect();
                  chart.dispose();
                  chartRef.current = null;
            };
      }, []);

      useEffect(() => {
            if (!chartRef.current) return;
            if (loading) {
                  chartRef.current.showLoading();
            } else {
                  chartRef.current.hideLoading();
                  chartRef.current.setOption(option, true);
            }
      }, [option, loading]);

      return (
            <div
                  ref={containerRef}
                  className={className}
                  style={{ width: "100%", height }}
            />
      );
}

interface SalesTrendRow {
      pos_item_id: number;
      item_name: string;
      period_start: string;
      quantity_sold: number;
      revenue: number;
      orders: number;
}

interface ProductTopCustomerRow {
      pos_item_id: number;
      item_name: string;
      pos_customer_id: number;
      customer_name: string;
      customer_category: string | null;
      total_quantity: number;
      total_revenue: number;
      total_orders: number;
      qty_rank: number;
}

const GOLD = "#D4AF37"; // ADJUST to your actual --accent-gold token if it differs
const AXIS_LINE = "#3a3a3a";
const AXIS_LABEL = "#9a9a9a";

/**
 * Dual-axis line chart: units sold (left axis) vs revenue (right axis) over time.
 * Feed it whichever v_product_sales_{granularity} rows are currently loaded —
 * the x-axis just reads period_start in order, so it works for daily/weekly/
 * biweekly/monthly without changes.
 */
export function buildSalesTrendOption(rows: SalesTrendRow[]): EChartsOption {
      const dates = rows.map((r) =>
            new Date(r.period_start).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
            })
      );

      return {
            backgroundColor: "transparent",
            textStyle: { color: AXIS_LABEL },
            tooltip: {
                  trigger: "axis",
                  backgroundColor: "#1a1a1a",
                  borderColor: AXIS_LINE,
                  textStyle: { color: "#e5e5e5" },
            },
            legend: {
                  data: ["Units Sold", "Revenue"],
                  textStyle: { color: AXIS_LABEL },
                  top: 0,
            },
            grid: { left: 48, right: 56, top: 40, bottom: 32 },
            xAxis: {
                  type: "category",
                  data: dates,
                  axisLine: { lineStyle: { color: AXIS_LINE } },
                  axisLabel: { color: AXIS_LABEL },
            },
            yAxis: [
                  {
                        type: "value",
                        name: "Units",
                        position: "left",
                        axisLine: { show: true, lineStyle: { color: AXIS_LINE } },
                        splitLine: { lineStyle: { color: "#242424" } },
                        axisLabel: { color: AXIS_LABEL },
                  },
                  {
                        type: "value",
                        name: "Revenue",
                        position: "right",
                        axisLine: { show: true, lineStyle: { color: AXIS_LINE } },
                        splitLine: { show: false },
                        axisLabel: {
                              color: AXIS_LABEL,
                              formatter: (value: number) =>
                                    value >= 1_000_000
                                          ? `₦${(value / 1_000_000).toFixed(1)}M`
                                          : `₦${(value / 1_000).toFixed(0)}k`,
                        },
                  },
            ],
            series: [
                  {
                        name: "Units Sold",
                        type: "bar",
                        yAxisIndex: 0,
                        data: rows.map((r) => r.quantity_sold),
                        itemStyle: { color: "#4a4a4a", borderRadius: [3, 3, 0, 0] },
                        barMaxWidth: 22,
                  },
                  {
                        name: "Revenue",
                        type: "line",
                        yAxisIndex: 1,
                        data: rows.map((r) => r.revenue),
                        smooth: true,
                        symbol: "circle",
                        symbolSize: 6,
                        lineStyle: { color: GOLD, width: 2 },
                        itemStyle: { color: GOLD },
                        areaStyle: { color: GOLD, opacity: 0.08 },
                  },
            ],
      };
}

/**
 * Horizontal bar chart of the top N customers for a product, ranked by quantity.
 * Pass v_product_top_customers rows already sorted by qty_rank.
 */
export function buildTopCustomersOption(
      rows: ProductTopCustomerRow[],
      limit = 10
): EChartsOption {
      const top = [...rows]
            .sort((a, b) => a.qty_rank - b.qty_rank)
            .slice(0, limit)
            .reverse(); // reverse so #1 renders at the top of a horizontal bar chart

      return {
            backgroundColor: "transparent",
            textStyle: { color: AXIS_LABEL },
            tooltip: {
                  trigger: "axis",
                  axisPointer: { type: "shadow" },
                  backgroundColor: "#1a1a1a",
                  borderColor: AXIS_LINE,
                  textStyle: { color: "#e5e5e5" },
                  formatter: (params: any) => {
                        const p = Array.isArray(params) ? params[0] : params;
                        const row = top[p.dataIndex];
                        return `${row.customer_name}<br/>Qty: ${row.total_quantity}<br/>Revenue: ₦${row.total_revenue.toLocaleString()}`;
                  },
            },
            grid: { left: 140, right: 32, top: 16, bottom: 24 },
            xAxis: {
                  type: "value",
                  axisLine: { lineStyle: { color: AXIS_LINE } },
                  splitLine: { lineStyle: { color: "#242424" } },
                  axisLabel: { color: AXIS_LABEL },
            },
            yAxis: {
                  type: "category",
                  data: top.map((r) => r.customer_name),
                  axisLine: { lineStyle: { color: AXIS_LINE } },
                  axisLabel: { color: AXIS_LABEL },
            },
            series: [
                  {
                        name: "Quantity",
                        type: "bar",
                        data: top.map((r) => r.total_quantity),
                        itemStyle: { color: GOLD, borderRadius: [0, 3, 3, 0] },
                        barMaxWidth: 18,
                  },
            ],
      };
}