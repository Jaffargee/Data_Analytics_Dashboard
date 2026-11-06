export type TrendGranularity = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type SortKey = 'total_revenue' | 'total_qty_sold' | 'gross_profit' | 'margin_pct' | 'times_sold';
export type SortDir = 'asc' | 'desc';

export interface ProductDeepDive { pos_item_id: number; item_name: string; item_category: string | null; total_quantity: number; cost_price: number; selling_price: number; cogs: number; gross_revenue: number; revenue: number; discount_impact: number; profit: number; margin_pct: number; discount_pct: number; total_orders: number; distinct_customers: number; peak_week: string | null; peak_week_quantity: number | null; qty_last_7d: number; qty_prior_7d: number; avg_daily_velocity_30d: number; trend_status: string; top_customer_name: string | null; top_customer_id: number | null; top_customer_quantity: number | null; top_customer_revenue: number | null; }
export interface ProductTopCustomer { pos_customer_id: number; customer_name: string; customer_category: string | null; total_quantity: number; total_revenue: number; total_orders: number; qty_rank: number; }
export interface SalesTrend { period_start: string; quantity_sold: number; revenue: number; orders: number; }

// ── Price analysis (get_item_price_analysis RPC) ─────────────────────────────
export type PriceBucket = 'day' | 'week' | 'month';

export interface PriceSummary {
      sale_lines: number;
      units_sold: number;
      units_returned: number;
      net_units: number;
      avg_price: number | null;
      weighted_avg_price: number | null;
      min_price: number | null;
      max_price: number | null;
      median_price: number | null;
      most_common_price: number | null;
      price_stddev: number | null;
      first_sale_date: string | null;
      last_sale_date: string | null;
}
export interface PriceDistributionRow { price: number; units: number; sale_lines: number; pct_of_units: number; }
export interface PriceTimelineRow { period: string; units: number; sale_lines: number; avg_price: number; min_price: number; max_price: number; }
export interface PricePoint { sold_at: string; sale_id: number; unit_price: number; quantity: number; }
export interface PriceAnalysis {
      item: { pos_item_id: number; item_name: string; category: string | null; cost_price: number | null; list_price: number | null } | null;
      filters: { from: string | null; to: string | null; bucket: PriceBucket; include_returns: boolean };
      summary: PriceSummary;
      price_distribution: PriceDistributionRow[];
      timeline: PriceTimelineRow[];
      price_points: PricePoint[];
}
