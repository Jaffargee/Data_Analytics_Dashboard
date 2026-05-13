export type Report = Record<any, any>

// ── Enums ─────────────────────────────────────────────────────────────────────
export type CustomerCategory =
      | 'WHSL1'
      | 'WHSL2'
      | 'RGL'
      | 'RIWC'
      | 'SEASONAL'
      | 'VIP'
      | 'STANDARD';

export type CustomerStatusLevel = 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';

export type AddressLabel =
      | 'Home'
      | 'Work'
      | 'Business'
      | 'Delivery'
      | 'Shipping';

export type ContactType = 'email' | 'phone';

// ── Sub-entities ──────────────────────────────────────────────────────────────

/**
 * A bank account belonging to a customer.
 * Stored in customer_accounts table.
 * customer_id is injected server-side on create.
 */
export interface CustomerAccount {
      id?: string; // uuid — present after save
      customer_id?: string; // uuid FK → customers.id
      account_no: string;
      account_name: string;
      bank_name: string;
      created_at?: string;
}

/**
 * A physical address belonging to a customer.
 * Stored in customer_addresses table.
 */
export interface Address {
      id?: string; // uuid — present after save
      customer_id?: string; // uuid FK → customers.id
      label: AddressLabel;
      is_primary: boolean;
      line_1: string;
      line_2: string; // empty string, not null, for controlled input
      city: string;
      state: string;
      postal_code: string; // empty string if not provided
      country: string;
      created_at?: string;
}

/**
 * A contact method (email or phone) for a customer.
 * Stored in customer_contacts table (future table — not in MVP schema yet).
 */
export interface ContactMethod {
      id?: string;
      customer_id?: string;
      type: ContactType;
      value: string;
      is_primary: boolean;
}

// ── CustomerForm ──────────────────────────────────────────────────────────────
/**
 * What the create/edit form manages.
 * This is the source of truth for UI state.
 * Customer extends this — server-side fields are added there.
 *
 * Rules:
 * - All string fields default to '' (never null) for controlled inputs
 * - Boolean fields are actual booleans
 * - addresses and accounts are arrays (at least 1 address on create)
 * - No id, created_at, updated_at — those live on Customer
 */
export interface CustomerForm {
      // ── Identity ─────────────────────────────────────────────
      first_name: string;
      last_name: string;
      email: string; // personal email (unique constraint)

      // ── Company (optional block) ──────────────────────────────
      company_name?: string;
      company_email?: string;
      company_phone?: string;
      company_website?: string;

      // ── Classification ────────────────────────────────────────
      category: CustomerCategory;
      status_level: CustomerStatusLevel;
      is_active: boolean;

      // ── Financial / POS ──────────────────────────────────────
      balance: string; // kept as string for <input type="number"> binding
      credit_limit: string;
      taxable: boolean;
      non_tax_certificate_number: string;
      default_invoice_terms: string;

      // ── Loyalty ──────────────────────────────────────────────
      disable_loyalty: boolean;
      points: string;
      auto_email_receipt: boolean;
      always_sms_receipt: boolean;
      message_to_show_when_adding_customer_to_sale: string;

      // ── Notes ────────────────────────────────────────────────
      comment: string;
      internal_notes: string;

      // ── Related records (one-to-many) ─────────────────────────
      addresses: Address[];
      accounts: CustomerAccount[];
      contacts: ContactMethod[];
}

// ── Customer (full DB record) ─────────────────────────────────────────────────
/**
 * The full customer record as returned from Supabase.
 * Extends CustomerForm and adds:
 * - Server-generated fields (id, pos_customer_id, timestamps)
 * - Computed fields (name — GENERATED ALWAYS in DB)
 * - Aggregated metrics (total_spent, total_orders, etc.)
 * - Related records joined from sub-tables
 */
export interface Customer extends CustomerForm {
      // ── Server identity ───────────────────────────────────────
      id: string; // uuid PK
      pos_customer_id: number; // integer unique, from POS system

      // ── Generated / computed ─────────────────────────────────
      name: string; // GENERATED ALWAYS AS (TRIM(first_name || ' ' || last_name)) STORED

      // ── Lifecycle timestamps ──────────────────────────────────
      created_at: string; // timestamptz
      updated_at: string; // timestamptz
      last_order_at: string | null;

      // ── Classification audit ──────────────────────────────────
      category_updated_at: string | null;
      status_updated_at: string | null;

      // ── Aggregated metrics (computed by triggers/functions) ───
      total_spent: number;
      total_orders: number;
      total_quantity_purchased: number;
      lifetime_value: number;

      // ── Joined related records ────────────────────────────────
      contacts: ContactMethod[]; // from customer_contacts (future)
}

// ── Metrics snapshot ──────────────────────────────────────────────────────────
export interface CustomerMetrics {
      customer_id: string;
      total_orders: number;
      total_successful_transactions: number;
      total_spent: number;
      total_quantity_purchased: number;
      average_order_value: number;
      largest_single_order: number;
      purchase_frequency_score: number;
      loyalty_score: number;
      returned_orders: number;
      cancelled_orders: number;
      last_purchase_at?: Date;
      updated_at: Date;
}

// ── Rules tables ──────────────────────────────────────────────────────────────
export interface CustomerCategoryRule {
      id: string;
      category: CustomerCategory;
      min_total_spent: number;
      min_total_quantity: number;
      min_orders: number;
      benefits: string[]; // jsonb array
      created_at: Date;
}

export interface StatusLevelRule {
      id: string;
      level: CustomerStatusLevel;
      min_total_spent: number;
      min_orders: number;
      min_loyalty_score: number;
      created_at: Date;
}

// ── Query response ────────────────────────────────────────────────────────────
export interface QueryResponse {
      type: 'query' | 'suggestions' | 'error';
      query?: {
            sql: string;
            explanation: string;
      };
      response?: {
            summary: string;
            insights: string[];
            details: string;
            recommendations: string[];
      };
      data?: {
            columns: string[];
            rows: unknown[][];
            row_count: number;
      };
      meta?: {
            executed_at: string;
            execution_time_ms: number;
            row_count: number;
      };
      suggestions?: {
            label: string;
            query: string;
      }[];
      error?: string;
}

export interface QueryResult {
      columns: string[];
      rows: Record<string, unknown>[];
      rowCount: number;
      executionMs: number;
}
