import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // ADJUST PATH if your client lives elsewhere

export interface RevenueWeekRow {
      week_start: string;
      revenue: number;
      cogs: number;
      profit: number;
      margin_pct: number;
      transactions: number;
      units_sold: number;
      avg_order_value: number;
      prev_week_revenue: number | null;
      wow_growth_pct: number | null;
}

export interface DiscountByItemRow {
      pos_item_id: number;
      item_name: string;
      qty_sold: number;
      gross_revenue: number;
      actual_revenue: number;
      discount_given: number;
      discount_pct: number;
      margin_pct: number;
      discount_rank: number;
}

export interface DiscountByCustomerRow {
      pos_customer_id: number;
      customer_name: string;
      category: string | null;
      gross_revenue: number;
      actual_revenue: number;
      discount_given: number;
      discount_pct: number;
      orders: number;
}

export interface DiscountTrendRow {
      week_start: string;
      gross_revenue: number;
      actual_revenue: number;
      discount_pct: number;
}

export interface DeadStockRow {
      pos_item_id: number;
      item_name: string;
      last_sold_at: string | null;
      qty_last_30d: number;
      qty_last_60d: number;
      status: "NEVER SOLD" | "DEAD (60d+)" | "SLOW (30-60d)" | "ACTIVE";
}

export interface AbcRow {
      pos_item_id: number;
      item_name: string;
      revenue: number;
      cumulative_pct: number;
      abc_tier: "A" | "B" | "C";
}

export interface RetentionWeekRow {
      week_start: string;
      new_customers: number;
      returning_customers: number;
      total_active_customers: number;
      returning_pct: number;
}

export interface ChurnRiskRow {
      pos_customer_id: number;
      customer_name: string;
      total_orders: number;
      lifetime_value: number;
      first_order_at: string;
      last_order_at: string;
      avg_days_between_orders: number;
      days_since_last_order: number;
      churn_status: "INSUFFICIENT DATA" | "AT RISK" | "ACTIVE";
}

export interface RevenueAnomalyRow {
      sale_date: string;
      revenue: number;
      trailing_avg: number | null;
      trailing_stddev: number | null;
      z_score: number | null;
      anomaly_status: "INSUFFICIENT HISTORY" | "SPIKE" | "DIP" | "NORMAL";
}

export interface BelowCostRow {
      pos_sale_id: number;
      invoice_datetime: string;
      customer_name: string | null;
      item_name: string;
      quantity: number;
      unit_price: number;
      cost_price: number;
      loss_amount: number;
}

export interface DataQualitySummary {
      total_sales: number;
      sales_missing_customer: number;
      pct_sales_missing_customer: number;
      invoice_total_mismatches: number;
      below_cost_line_items: number;
      earliest_sale: string;
      latest_sale: string;
}

interface AnalyticsDashboardState {
      revenueWeekly: RevenueWeekRow[];
      discountByItem: DiscountByItemRow[];
      discountByCustomer: DiscountByCustomerRow[];
      discountTrend: DiscountTrendRow[];
      deadStock: DeadStockRow[];
      abc: AbcRow[];
      retentionWeekly: RetentionWeekRow[];
      churnRisk: ChurnRiskRow[];
      anomalies: RevenueAnomalyRow[];
      belowCost: BelowCostRow[];
      dataQuality: DataQualitySummary | null;
      loading: boolean;
      error: Error | null;
      refetch: () => void;
}

const EMPTY: Omit<AnalyticsDashboardState, "loading" | "error" | "refetch"> = {
      revenueWeekly: [],
      discountByItem: [],
      discountByCustomer: [],
      discountTrend: [],
      deadStock: [],
      abc: [],
      retentionWeekly: [],
      churnRisk: [],
      anomalies: [],
      belowCost: [],
      dataQuality: null,
};

export default function useAnalyticsDashboard(): AnalyticsDashboardState {
      const [data, setData] = useState(EMPTY);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<Error | null>(null);

      const fetchAll = useCallback(async () => {
            setLoading(true);
            setError(null);
            try {
                  const [
                        revenueWeekly,
                        discountByItem,
                        discountByCustomer,
                        discountTrend,
                        deadStock,
                        abc,
                        retentionWeekly,
                        churnRisk,
                        anomalies,
                        belowCost,
                        dataQuality,
                  ] = await Promise.all([
                        supabase.from("v_revenue_weekly").select("*").order("week_start", { ascending: true }),
                        supabase.from("v_discount_by_item").select("*").order("discount_rank", { ascending: true }),
                        supabase.from("v_discount_by_customer").select("*").order("discount_pct", { ascending: false }),
                        supabase.from("v_discount_trend_weekly").select("*").order("week_start", { ascending: true }),
                        supabase.from("v_dead_stock_candidates").select("*"),
                        supabase.from("v_abc_classification").select("*").order("revenue", { ascending: false }),
                        supabase.from("v_customer_retention_weekly").select("*").order("week_start", { ascending: true }),
                        supabase.from("v_customer_churn_risk").select("*").order("days_since_last_order", { ascending: false }),
                        supabase.from("v_revenue_anomaly_daily").select("*").order("sale_date", { ascending: true }),
                        supabase.from("v_below_cost_sales").select("*").order("loss_amount", { ascending: false }),
                        supabase.from("v_data_quality_summary").select("*").maybeSingle(),
                  ]);

                  const firstError =
                        revenueWeekly.error ||
                        discountByItem.error ||
                        discountByCustomer.error ||
                        discountTrend.error ||
                        deadStock.error ||
                        abc.error ||
                        retentionWeekly.error ||
                        churnRisk.error ||
                        anomalies.error ||
                        belowCost.error ||
                        dataQuality.error;

                  if (firstError) throw firstError;

                  setData({
                        revenueWeekly: revenueWeekly.data ?? [],
                        discountByItem: discountByItem.data ?? [],
                        discountByCustomer: discountByCustomer.data ?? [],
                        discountTrend: discountTrend.data ?? [],
                        deadStock: deadStock.data ?? [],
                        abc: abc.data ?? [],
                        retentionWeekly: retentionWeekly.data ?? [],
                        churnRisk: churnRisk.data ?? [],
                        anomalies: anomalies.data ?? [],
                        belowCost: belowCost.data ?? [],
                        dataQuality: dataQuality.data ?? null,
                  });
            } catch (err) {
                  setError(err as Error);
            } finally {
                  setLoading(false);
            }
      }, []);

      useEffect(() => {
            fetchAll();
      }, [fetchAll]);

      return { ...data, loading, error, refetch: fetchAll };
}