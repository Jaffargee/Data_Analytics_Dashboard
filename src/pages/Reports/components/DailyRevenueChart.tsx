import React from 'react';
import {
      Card,
      CardHeader,
      CardTitle,
      Badge,
      EmptyState,
} from '@/components/ui/primitives';
import { LineChart } from '@/components/charts/LineChart';
import { fmtCurrency } from '@/lib/utils';
import type { ChartDataPoint } from '../types';

interface DailyRevenueChartProps {
      data: ChartDataPoint[];
      daysCount: number;
}

export function DailyRevenueChart({ data, daysCount }: DailyRevenueChartProps) {
      return (
            <Card glow>
                  <CardHeader>
                        <CardTitle>Daily Revenue</CardTitle>
                        <Badge variant="teal">{daysCount} days</Badge>
                  </CardHeader>
                  {data.length ? (
                        <LineChart
                              data={data}
                              height={200}
                              color="#2dd4bf"
                              formatValue={fmtCurrency}
                        />
                  ) : (
                        <EmptyState />
                  )}
            </Card>
      );
}
