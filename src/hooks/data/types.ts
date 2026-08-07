// src/hooks/data/types.ts
/**
 * Core data types for Supabase queries
 */

// ── Revenue ────────────────────────────────────
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

// ── Products ────────────────────────────────────
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

// ── Customers ────────────────────────────────────
export interface TopCustomer {
      id: string;
      pos_customer_id: number;
      customer_name: string;
      total_purchases: number;
      lifetime_value: number;
      avg_purchase: number;
      last_purchase_at: string;
}

// ── Sales ────────────────────────────────────
export interface SalesBySalesperson {
      salesperson: string;
      total_sales: number;
      total_revenue: number;
      avg_sale: number;
      items_sold: number;
}

// ── Suppliers ────────────────────────────────────
export interface SupplierStockValue {
      pos_supplier_id: number;
      supplier_name: string;
      num_products: number;
      stock_cost_value: number;
      stock_retail_value: number;
      outstanding_balance: number;
}

// ── Category ────────────────────────────────────
export interface CategoryPerformance {
      category: string;
      num_items: number;
      total_qty_sold: number;
      total_revenue: number;
      gross_profit: number;
}

// ── Snapshots ────────────────────────────────────
export interface DailySnapshot {
      metric: string;
      value: number;
}


// Enums based on DEFAULT values and naming conventions in the schema
export type CustomerCategory = 'STANDARD' | 'RGL' |string; // Replace string with other enum values if available
export type CustomerStatusLevel = 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | string; // Replace with your exact enum values

export interface Customer {
      // Primary Keys & Identifiers
      id: string; // uuid
      pos_customer_id: number; // integer

      // Personal & Company Info
      first_name: string; // text (not null)
      last_name: string | null; // text
      email: string | null; // text (unique)
      company_name: string | null; // text
      company_phone: string | null; // text
      company_email: string | null; // text
      company_website: string | null; // text

      // Categorization & Status
      category: CustomerCategory; // public.customer_category (default 'STANDARD')
      status_level: CustomerStatusLevel; // public.customer_status_level (default 'SILVER')
      is_active: boolean; // boolean (default true)

      // Metrics & Financials
      total_spent: number; // numeric(15, 2)
      total_orders: number; // integer
      total_quantity_purchased: number; // integer
      lifetime_value: number; // numeric(15, 2)
      profit_contribution: number; // numeric
      balance: number; // numeric(15, 2)
      credit_limit: number; // numeric(15, 2)

      // Billing & Tax Settings
      taxable: boolean; // boolean (default true)
      non_tax_certificate_number: string | null; // text
      default_invoice_terms: string | null; // text
      disable_loyalty: boolean; // boolean (default false)

      // Notifications & Communications
      auto_email_receipt: boolean | null; // boolean
      always_sms_receipt: boolean | null; // boolean
      message_to_show_when_adding_customer_to_sale: string | null; // text
      comment: string | null; // text
      internal_notes: string | null; // text

      // Timestamps (ISO 8601 strings in JS/TS)
      created_at: string | null; // timestamp with time zone
      updated_at: string | null; // timestamp with time zone
      category_updated_at: string | null; // timestamp with time zone
      status_updated_at: string | null; // timestamp with time zone
      last_order_at: string | null; // timestamp with time zone
}

// Utility Types for Database Operations
export type CustomerInsert = Omit<
      Customer,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'category'
      | 'status_level'
      | 'is_active'
      | 'total_spent'
      | 'total_orders'
      | 'total_quantity_purchased'
      | 'lifetime_value'
      | 'profit_contribution'
      | 'balance'
      | 'credit_limit'
      | 'taxable'
      | 'disable_loyalty'
> & {
      id?: string;
      category?: CustomerCategory;
      status_level?: CustomerStatusLevel;
      is_active?: boolean;
      total_spent?: number;
      total_orders?: number;
      total_quantity_purchased?: number;
      lifetime_value?: number;
      profit_contribution?: number;
      balance?: number;
      credit_limit?: number;
      taxable?: boolean;
      disable_loyalty?: boolean;
      created_at?: string;
      updated_at?: string;
};

export type CustomerUpdate = Partial<CustomerInsert>;