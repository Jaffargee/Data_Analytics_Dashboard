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

import { useABCClassification, useBelowCost, useCustomerChurnRisk, useCustomerRetention, useDataQuality, useDeadStocks, useDiscountByCustomer, useDiscountByItem, useDiscountTrend, useRevenueAnomarly, useRevenueWeekly } from "../data";
import { useState } from "react";

export default function useAnalyticsDashboard() {

      const [loading, setLoading] = useState<boolean>(false);
      const [error, setError] = useState<Error | null>(null);

      const weekly_revenue = useRevenueWeekly()?.data;
      const discount_trend = useDiscountTrend()?.data;
      const discount_by_item = useDiscountByItem()?.data;
      const discount_by_customer = useDiscountByCustomer()?.data;
      const customer_churn_risk = useCustomerChurnRisk()?.data;
      const customer_retention = useCustomerRetention()?.data;
      const dead_stocks  = useDeadStocks()?.data;
      const abc_classification = useABCClassification()?.data;
      const below_cost  = useBelowCost()?.data;
      const data_quality = useDataQuality()?.data;
      const rev_anomalies = useRevenueAnomarly()?.data;

      return {
            revenueWeekly: weekly_revenue?.data ?? [] as RevenueWeekRow[],
            discountByItem: discount_by_item?.data ?? [] as DiscountByItemRow[],
            discountByCustomer: discount_by_customer?.data ?? [] as DiscountByCustomerRow[],
            discountTrend: discount_trend?.data ?? [] as DiscountTrendRow[],
            deadStock: dead_stocks?.data ?? [] as DeadStockRow[],
            abc: abc_classification?.data ?? [] as AbcRow[],
            retentionWeekly: customer_retention?.data ?? [] as RetentionWeekRow[],
            churnRisk: customer_churn_risk?.data ?? [] as ChurnRiskRow[],
            anomalies: rev_anomalies?.data ?? [] as RevenueAnomalyRow[],
            belowCost: below_cost?.data ?? [] as BelowCostRow[],
            dataQuality: data_quality?.data?.[0] ?? null as DataQualityRow | null,
            loading: loading,
            error: error as Error | null,
      };
}
