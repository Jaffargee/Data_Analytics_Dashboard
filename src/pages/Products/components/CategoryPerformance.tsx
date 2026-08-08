import React, { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';
import { CardHeader, CardTitle } from '@/components/ui/primitives';
import { fmtCurrency, fmt } from '@/lib/utils';
import { Card } from '@fluentui/react-components';

interface CategoryPerfProps {
      data: Array<{
            category: string;
            total_revenue: number | string;
            total_qty_sold: number | string;
            num_items: number | string;
      }>;
}

// Adjust these to match your tailwind.config theme exactly — ECharts renders to
// canvas, so it can't read Tailwind utility classes at runtime like the rest of the UI.
const COLORS = {
      gold: '#D4AF37',
      goldSoft: 'rgba(212, 175, 55, 0.35)',
      ink: '#E5E1D8',
      inkMuted: '#8A8578',
      border: 'rgba(138, 133, 120, 0.18)',
      panel: '#1A1712',
};

export function CategoryPerformance({ data }: CategoryPerfProps) {
      const containerRef = useRef<HTMLDivElement>(null);
      const chartRef = useRef<echarts.ECharts | null>(null);

      const sorted = useMemo(
            () => [...data].sort((a, b) => Number(a.total_revenue) - Number(b.total_revenue)),
            [data]
      );

      const chartHeight = Math.max(sorted.length * 42, 160);

      useEffect(() => {
            if (!containerRef.current) return;

            const chart = echarts.init(containerRef.current);
            chartRef.current = chart;

            const option: echarts.EChartsOption = {
                  backgroundColor: 'transparent',
                  grid: {
                        left: 8,
                        right: 24,
                        top: 8,
                        bottom: 8,
                        containLabel: true,
                  },
                  tooltip: {
                        trigger: 'axis',
                        axisPointer: { type: 'shadow' },
                        backgroundColor: COLORS.panel,
                        borderColor: COLORS.border,
                        textStyle: { color: COLORS.ink, fontSize: 12 },
                        formatter: (params: any) => {
                              const p = params[0];
                              const row = sorted[p.dataIndex];
                              return `
                                    <div style="font-family: monospace;">
                                          <strong>${row.category}</strong><br/>
                                          Revenue: ${fmtCurrency(Number(row.total_revenue))}<br/>
                                          Units: ${fmt(Number(row.total_qty_sold))}<br/>
                                          Items: ${fmt(Number(row.num_items))}
                                    </div>
                              `;
                        },
                  },
                  xAxis: {
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
                  yAxis: {
                        type: 'category',
                        data: sorted.map((c) => c.category),
                        axisLabel: { color: COLORS.ink, fontSize: 11 },
                        axisLine: { lineStyle: { color: COLORS.border } },
                        axisTick: { show: false },
                  },
                  series: [
                        {
                              type: 'bar',
                              data: sorted.map((c) => Number(c.total_revenue)),
                              barMaxWidth: 22,
                              itemStyle: {
                                    color: {
                                          type: 'linear',
                                          x: 0,
                                          y: 0,
                                          x2: 1,
                                          y2: 0,
                                          colorStops: [
                                                { offset: 0, color: COLORS.goldSoft },
                                                { offset: 1, color: COLORS.gold },
                                          ],
                                    },
                                    borderRadius: [0, 4, 4, 0],
                              },
                              label: {
                                    show: true,
                                    position: 'right',
                                    color: COLORS.inkMuted,
                                    fontSize: 10,
                                    fontFamily: 'monospace',
                                    formatter: (p: any) => fmtCurrency(p.value),
                              },
                        },
                  ],
            };

            chart.setOption(option);

            const resize = () => chart.resize();
            window.addEventListener('resize', resize);

            return () => {
                  window.removeEventListener('resize', resize);
                  chart.dispose();
                  chartRef.current = null;
            };
      }, [sorted]);

      return (
            <div className="px-4">
                  <Card appearance="outline">
                        <CardHeader>
                              <CardTitle>Category Performance</CardTitle>
                        </CardHeader>

                        {sorted.length ? (
                              <div ref={containerRef} style={{ width: '100%', height: chartHeight }} />
                        ) : (
                              <p className="text-xs text-ink-muted px-4 py-6 text-center">
                                    No category data available.
                              </p>
                        )}
                  </Card>
            </div>
      );
}
