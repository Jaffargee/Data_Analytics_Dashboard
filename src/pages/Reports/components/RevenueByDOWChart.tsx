import React from 'react';
import {
      CardHeader,
      CardTitle,
      EmptyState,
} from '@/components/ui/primitives';
import { Card } from "@fluentui/react-components";
import { BarChart } from '@/components/charts/BarChart';
import { fmtCurrency } from '@/lib/utils';
import type { ChartDataPoint } from '../types';

interface RevenueByDOWChartProps {
      data: ChartDataPoint[];
}

export function RevenueByDOWChart({ data }: RevenueByDOWChartProps) {
      return (
            <Card appearance="outline">
                  <CardHeader>
                        <CardTitle>Revenue by Day of Week</CardTitle>
                  </CardHeader>
                  {data.length ? (
                        <BarChart
                              data={data}
                              height={200}
                              color="#f5c842"
                              formatValue={fmtCurrency}
                        />
                  ) : (
                        <EmptyState />
                  )}
            </Card>
      );
}
