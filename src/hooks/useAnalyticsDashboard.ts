export interface RevenueWeekRow {
  week_start: string;
  revenue: number;
  profit: number;
  margin_pct: number;
  wow_growth_pct?: number;
  avg_order_value?: number;
}

export interface DiscountTrendRow {
  week_start: string;
  discount_pct: number;
}

export interface RetentionWeekRow {
  week_start: string;
  new_customers: number;
  returning_customers: number;
}

export interface AbcRow {
  abc_tier: 'A' | 'B' | 'C';
  item_name: string;
  revenue: number;
  cumulative_pct: number;
}

export interface DiscountByItemRow {
  pos_item_id: string | number;
  item_name: string;
  qty_sold: number;
  gross_revenue: number;
  discount_given: number;
  discount_pct: number;
  margin_pct: number;
}

export interface DiscountByCustomerRow {
  pos_customer_id: string | number;
  customer_name: string;
  category: string;
  orders: number;
  gross_revenue: number;
  discount_given: number;
  discount_pct: number;
}

export interface DeadStockRow {
  pos_item_id: string | number;
  item_name: string;
  qty_last_30d: number;
  qty_last_60d: number;
  last_sold_at: string | null;
  status: 'NEVER SOLD' | 'DEAD (60d+)' | 'SLOW (30-60d)' | 'ACTIVE';
}

export interface ChurnRiskRow {
  churn_status: 'AT RISK' | 'ACTIVE' | 'INSUFFICIENT DATA';
  customer_name: string;
  total_orders: number;
  lifetime_value: number;
  avg_days_between_orders: number;
  days_since_last_order: number;
}

export interface RevenueAnomalyRow {
  anomaly_status: 'SPIKE' | 'DIP' | 'NORMAL' | 'INSUFFICIENT HISTORY';
  sale_date: string;
  revenue: number;
  trailing_avg: number | null;
  z_score: number;
}

export interface BelowCostRow {
  invoice_datetime: string;
  item_name: string;
  customer_name: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  loss_amount: number;
}

export interface DataQualityRow {
  sales_missing_customer: number;
  pct_sales_missing_customer: number;
  invoice_total_mismatches: number;
  below_cost_line_items: number;
  total_sales: number;
}

export default function useAnalyticsDashboard() {
  return {
    revenueWeekly: [] as RevenueWeekRow[],
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
