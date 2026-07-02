import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/primitives';
import { BarChart } from '@/components/charts/BarChart';
import { fmtCurrency, fmt } from '@/lib/utils';
import type { PriceSensitivity } from '../types';

interface PriceBandChartsProps {
      prices: PriceSensitivity[];
}

export function PriceBandCharts({ prices }: PriceBandChartsProps) {
      const revenueData = prices.map((r) => ({
            label: r.price_bucket,
            value: Number(r.revenue),
      }));

      const volumeData = prices.map((r) => ({
            label: r.price_bucket,
            value: Number(r.units_sold),
      }));

      return (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <Card glow>
                        <CardHeader>
                              <CardTitle>Revenue by Price Band</CardTitle>
                        </CardHeader>
                        <BarChart
                              data={revenueData}
                              height={200}
                              color="#fb923c"
                              formatValue={fmtCurrency}
                        />
                  </Card>
                  <Card glow>
                        <CardHeader>
                              <CardTitle>Volume by Price Band</CardTitle>
                        </CardHeader>
                        <BarChart
                              data={volumeData}
                              height={200}
                              color="#a78bfa"
                              formatValue={fmt}
                        />
                  </Card>
            </div>
      );
}
