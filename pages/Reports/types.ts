// ── Types ────────────────────────────────────────────────────────────────────
export interface PeriodSummary {
      metric: string;
      value: number;
}

export interface RevenueByDow {
      day_of_week: string;
      dow_num: number;
      transactions: number;
      revenue: number;
      units_sold: number;
}

export interface RevenueByCategory {
      category: string;
      revenue: number;
      units_sold: number;
      transactions: number;
      avg_price: number;
}

export interface TopProduct {
      item_name: string;
      category: string;
      revenue: number;
      units_sold: number;
      transactions: number;
      avg_price: number;
      rev_per_txn: number;
      gross_profit: number;
      margin_pct: number;
}

export interface PriceSensitivity {
      price_bucket: string;
      sort_order: number;
      line_items: number;
      units_sold: number;
      revenue: number;
      pct_of_revenue: number;
}

export interface TimeIntelligence {
      time_bucket: string;
      sort_order: number;
      transactions: number;
      revenue: number;
}

export interface TopCustomer {
      customer_name: string;
      revenue: number;
      transactions: number;
      units: number;
      avg_basket: number;
      pct_of_total: number;
}

export interface DailyBreakdown {
      sale_date: string;
      day_of_week: string;
      revenue: number;
      transactions: number;
      units_sold: number;
}

export interface Comparison {
      metric: string;
      period_1: number;
      period_2: number;
      change: number;
      change_pct: number;
}

export interface DateRange {
      from: string;
      to: string;
}

export interface ChartDataPoint {
      label: string;
      value: number;
      color?: string;
}
