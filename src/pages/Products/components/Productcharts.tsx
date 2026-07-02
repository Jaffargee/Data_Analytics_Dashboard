import React from 'react';
import { Card, CardHeader, CardTitle, EmptyState } from '@/components/ui/primitives';
import { BarChart } from '@/components/charts/BarChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { fmtCurrency } from '@/lib/utils';

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

export function ProductCharts({ top10Chart, catDonut, itemsLoading, catsLoading }: ProductChartsProps) {
      return (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <Card glow>
                        <CardHeader>
                              <CardTitle>Top 10 by Revenue</CardTitle>
                        </CardHeader>
                        {itemsLoading ? (
                              <div className="h-52 bg-bg-hover animate-pulse rounded-lg" />
                        ) : (
                              <BarChart
                                    data={top10Chart}
                                    height={200}
                                    color="#f5c842"
                                    formatValue={fmtCurrency}
                              />
                        )}
                  </Card>

                  <Card glow>
                        <CardHeader>
                              <CardTitle>Revenue by Category</CardTitle>
                        </CardHeader>
                        {catsLoading ? (
                              <div className="h-52 bg-bg-hover animate-pulse rounded-lg" />
                        ) : catDonut.length ? (
                              <DonutChart data={catDonut} size={180} formatValue={fmtCurrency} />
                        ) : (
                              <EmptyState />
                        )}
                  </Card>
            </div>
      );
}