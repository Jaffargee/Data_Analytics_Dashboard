import { AbcRow, BelowCostRow, ChurnRiskRow, DataQualityRow, DeadStockRow, RetentionWeekRow } from "./types";
import { useViewQuery } from "./use-supabase";

// Customer Churn Risk
export function useCustomerChurnRisk() {
      return useViewQuery<ChurnRiskRow>('v_customer_churn_risk');
}

// Customer Retension
export function useCustomerRetention() {
      return useViewQuery<RetentionWeekRow>('v_customer_retention_weekly');
}

// Dead Stocks
export function useDeadStocks() {
      return useViewQuery<DeadStockRow>('v_dead_stock_candidates');
}

// ABC Classification
export function useABCClassification() {
      return useViewQuery<AbcRow>('v_abc_classification');
}

// Below Cost
export function useBelowCost() {
      return useViewQuery<BelowCostRow>('v_below_cost_sales');
}

// Data Quality
export function useDataQuality() {
      return useViewQuery<DataQualityRow>('v_data_quality_summary');
}
