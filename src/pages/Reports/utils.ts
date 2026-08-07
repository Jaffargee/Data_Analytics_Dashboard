import type {
      PeriodSummary,
      RevenueByDow,
      DailyBreakdown,
      RevenueByCategory,
      TopProduct,
      TopCustomer,
} from './types';
import type { ChartDataPoint } from './types';
import { DONUT_COLORS } from './constants';

export function today(): string {
      return new Date().toISOString().split('T')[0];
}

export function nDaysAgo(n: number): string {
      const d = new Date();
      d.setDate(d.getDate() - n);
      return d.toISOString().split('T')[0];
}

export function computeKPIs(summary: PeriodSummary[]) {
      const kpiMap = Object.fromEntries(
            summary.map((r) => [r.metric, r.value])
      );

      return {
            totalRev: kpiMap['total_revenue'] ?? 0,
            totalTxn: kpiMap['total_transactions'] ?? 0,
            avgBasket: kpiMap['avg_basket_value'] ?? 0,
            avgDaily: kpiMap['avg_daily_revenue'] ?? 0,
            totalUnits: kpiMap['total_units_sold'] ?? 0,
            tradingDays: kpiMap['trading_days'] ?? 0,
      };
}

export interface ChartDataSets {
      dowChart: ChartDataPoint[];
      dailyChart: ChartDataPoint[];
      catDonut: ChartDataPoint[];
}

export function transformChartData(
      dowData: RevenueByDow[],
      daily: DailyBreakdown[],
      catData: RevenueByCategory[],
      products: TopProduct[],
      customers: TopCustomer[]
): ChartDataSets {
      return {
            dowChart: dowData
                  .sort((a, b) => a.dow_num - b.dow_num)
                  .map((r) => ({
                        label: r.day_of_week.trim().slice(0, 3),
                        value: Number(r.revenue),
                  })),
            dailyChart: daily.map((r) => ({
                  label: r.sale_date.slice(5),
                  value: Number(r.revenue),
            })),
            catDonut: catData.slice(0, 7).map((r, i) => ({
                  label: r.category,
                  value: Number(r.revenue),
                  color: DONUT_COLORS[i % DONUT_COLORS.length],
            })),
      };
}

export function getMaxRevenue(data: { revenue: number }[]): number {
      return Math.max(...data.map((r) => Number(r.revenue)), 1);
}
