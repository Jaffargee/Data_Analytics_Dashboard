import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/primitives';
import { BarChart } from '@/components/charts/BarChart';
import { fmtCurrency } from '@/lib/utils';
import type { TopCustomer } from '../types';

interface TopCustomersChartProps {
      customers: TopCustomer[];
}

export function TopCustomersChart({ customers }: TopCustomersChartProps) {
      const chartData = customers.slice(0, 10).map((r) => ({
            label: r.customer_name.trim().split(' ')[0],
            value: Number(r.revenue),
      }));

      return (
            <Card glow>
                  <CardHeader>
                        <CardTitle>Top 10 Customers</CardTitle>
                  </CardHeader>
                  <BarChart
                        data={chartData}
                        height={200}
                        color="#34d399"
                        formatValue={fmtCurrency}
                  />
            </Card>
      );
}
