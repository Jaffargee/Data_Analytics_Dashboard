import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/primitives';
import { BarChart } from '@/components/charts/BarChart';
import { fmtCurrency, fmt } from '@/lib/utils';
import type { TopProduct } from '../types';

interface TopProductsChartsProps {
      products: TopProduct[];
}

export function TopProductsCharts({ products }: TopProductsChartsProps) {
      const top10ByRevenue = products.slice(0, 10).map((r) => ({
            label: r.item_name.slice(0, 14) + '…',
            value: Number(r.revenue),
      }));

      const top10ByUnits = [...products]
            .sort((a, b) => Number(b.units_sold) - Number(a.units_sold))
            .slice(0, 10)
            .map((r) => ({
                  label: r.item_name.slice(0, 14) + '…',
                  value: Number(r.units_sold),
            }));

      return (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <Card glow>
                        <CardHeader>
                              <CardTitle>Top 10 by Revenue</CardTitle>
                        </CardHeader>
                        <BarChart
                              data={top10ByRevenue}
                              height={200}
                              color="#f5c842"
                              formatValue={fmtCurrency}
                        />
                  </Card>
                  <Card glow>
                        <CardHeader>
                              <CardTitle>Top 10 by Units Sold</CardTitle>
                        </CardHeader>
                        <BarChart
                              data={top10ByUnits}
                              height={200}
                              color="#2dd4bf"
                              formatValue={fmt}
                        />
                  </Card>
            </div>
      );
}
