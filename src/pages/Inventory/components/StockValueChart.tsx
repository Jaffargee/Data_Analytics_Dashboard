import type { EChartsOption } from 'echarts';
import EChart from '@/components/charts/EChart';
import { CardHeader, CardTitle, Card, EmptyState } from '@/components/ui/primitives';
import { fmtCurrency } from '@/lib/utils';
import type { CategoryValuePoint } from '../hooks';

interface StockValueChartProps {
      title: string;
      data: CategoryValuePoint[];
      loading: boolean;
      emptyMessage?: string;
}

export function StockValueChart({
      title,
      data,
      loading,
      emptyMessage = 'No data available',
}: StockValueChartProps) {
      const option: EChartsOption = {
            backgroundColor: 'transparent',
            grid: { left: 64, right: 24, top: 24, bottom: 48 },
            tooltip: {
                  trigger: 'axis',
                  axisPointer: { type: 'shadow' },
                  valueFormatter: (value) => fmtCurrency(Number(value)),
            },
            xAxis: {
                  type: 'category',
                  data: data.map((point) => point.label),
                  axisLabel: {
                        color: '#8A8578',
                        rotate: data.length > 6 ? 30 : 0,
                  },
                  axisLine: { lineStyle: { color: '#3A342A' } },
            },
            yAxis: {
                  type: 'value',
                  axisLabel: {
                        color: '#8A8578',
                        formatter: (value: number) => fmtCurrency(value),
                  },
                  splitLine: { lineStyle: { color: 'rgba(138,133,120,.18)', type: 'dashed' } },
            },
            series: [
                  {
                        type: 'bar',
                        barMaxWidth: 34,
                        data: data.map((point) => ({
                              value: point.value,
                              itemStyle: { color: point.color, borderRadius: [4, 4, 0, 0] },
                        })),
                  },
            ],
      };

      return (
            <Card appearance="outline">
                  <CardHeader>
                        <CardTitle>{title}</CardTitle>
                  </CardHeader>
                  {loading ? (
                        <div className="h-64 bg-bg-hover animate-pulse rounded-lg" />
                  ) : data.length ? (
                        <EChart option={option} height="280px" />
                  ) : (
                        <EmptyState message={emptyMessage} />
                  )}
            </Card>
      );
}
