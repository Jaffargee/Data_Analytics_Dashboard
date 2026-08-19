import {
      type DiscountByItemRow,
      type DiscountByCustomerRow,
      type AbcRow,
      type DeadStockRow,
      type ChurnRiskRow,
      type RevenueAnomalyRow,
      type BelowCostRow,
      type RevenueWeekRow,
      type DiscountTrendRow,
      type RetentionWeekRow,
      type DataQualityRow,
} from "./types";

import { useRevenueWeekly } from "../data";

export default function useAnalyticsDashboard() {

      const weekly_revenue = useRevenueWeekly()?.data;

      return {
            revenueWeekly: weekly_revenue?.data ?? [] as RevenueWeekRow[],
            discountByItem: [] as DiscountByItemRow[],
            discountByCustomer: [] as DiscountByCustomerRow[],
            discountTrend: [] as DiscountTrendRow[],
            deadStock: [] as DeadStockRow[],
            abc: [] as AbcRow[],
            retentionWeekly: [] as RetentionWeekRow[],
            churnRisk: [] as ChurnRiskRow[],
            anomalies: [] as RevenueAnomalyRow[],
            belowCost: [] as BelowCostRow[],
            dataQuality: null as DataQualityRow | null,
            loading: false,
            error: null as Error | null,
      };
}
