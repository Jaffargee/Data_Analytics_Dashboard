import React from 'react';
import { DailyRevenueChart } from './DailyRevenueChart';
import { RevenueByDOWChart } from './RevenueByDOWChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { DailyBreakdownTable } from './DailyBreakdownTable';
import type { ChartDataSets } from '../utils';
import type { RevenueByCategory, DailyBreakdown } from '../types';

interface OverviewTabProps {
      chartData: ChartDataSets;
      catData: RevenueByCategory[];
      daily: DailyBreakdown[];
      tradingDays: number;
}

export function OverviewTab({
      chartData,
      catData,
      daily,
      tradingDays,
}: OverviewTabProps) {
      return (
            <>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <DailyRevenueChart
                              data={chartData.dailyChart}
                              daysCount={daily.length}
                        />
                        <RevenueByDOWChart data={chartData.dowChart} />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <CategoryBreakdown
                              catData={catData}
                              donutData={chartData.catDonut}
                        />
                  </div>

                  <DailyBreakdownTable
                        daily={daily}
                        tradingDays={tradingDays}
                  />
            </>
      );
}
