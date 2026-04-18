import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Types matching your Supabase schema ──────────────────────

export interface RevenueDaily {
  sale_date: string;
  num_sales: number;
  revenue: number;
  items_sold: number;
}

export interface RevenueMonthly {
  month: string;
  num_sales: number;
  revenue: number;
  avg_sale: number;
  items_sold: number;
}

export interface BestSellingItem {
  pos_item_id: number;
  item_name: string;
  category: string;
  selling_price: number;
  cost_price: number;
  total_qty_sold: number;
  total_revenue: number;
  gross_profit: number;
  margin_pct: number;
  times_sold: number;
}

export interface TopCustomer {
  pos_customer_id: number;
  customer_name: string;
  phone_number: string;
  email: string;
  total_purchases: number;
  lifetime_value: number;
  avg_purchase: number;
  last_purchase_at: string;
}

export interface LowStockItem {
  pos_item_id: number;
  item_name: string;
  category: string;
  stock_qty: number;
  reorder_level: number;
  replenish_level: number;
  selling_price: number;
  cost_price: number;
  supplier_id: number;
}

export interface SalesBySalesperson {
  salesperson: string;
  total_sales: number;
  total_revenue: number;
  avg_sale: number;
  items_sold: number;
}

export interface SupplierStockValue {
  pos_supplier_id: number;
  supplier_name: string;
  num_products: number;
  stock_cost_value: number;
  stock_retail_value: number;
  outstanding_balance: number;
}

export interface CategoryPerformance {
  category: string;
  num_items: number;
  total_qty_sold: number;
  total_revenue: number;
  gross_profit: number;
}

export interface DailySnapshot {
  metric: string;
  value: number;
}
