export const ctm_category: { id: string; value: string }[] = [
      { id: 'RGL', value: 'REGULAR' },
      { id: 'WHSL1', value: 'WHOLESALE 1' },
      { id: 'WHSL2', value: 'WHOLESALE 2' },
      { id: 'RIWC', value: 'WALK-IN INDOOR CUSTOMER' },
      { id: 'SEASONAL', value: 'SEASONAL' },
      { id: 'VIP', value: 'VIP' },
      { id: 'STANDARD', value: 'STANDARD' },
];

export const ctm_status_lvl: { id: string; value: string }[] = [
      { id: 'SILVER', value: 'SILVER' },
      { id: 'GOLD', value: 'GOLD' },
      { id: 'PLATINUM', value: 'PLATINUM' },
      { id: 'DIAMOND', value: 'DIAMOND' },
];

export const ctm_addr_label: { id: string; value: string }[] = [
      { id: 'Home', value: 'Home' },
      { id: 'Work', value: 'Work' },
      { id: 'Business', value: 'Business' },
      { id: 'Delivery', value: 'Delivery' },
      { id: 'Shipping', value: 'Shipping' },
];

export const ctm_contact_method: { id: string; value: string }[] = [
      { id: 'email', value: 'Email' },
      { id: 'phone', value: 'Phone' },
];

export const accounts_summary_report = (
      _date: string = new Date().toJSON().split('T')[0]
) => {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(_date)) {
            throw new Error('Invalid date format. Expected YYYY-MM-DD');
      }
      return `
            SELECT
                  p.account as bank_name, 
                  ROUND(SUM(p.amount), 2) as total,
                  DATE(s.invoice_datetime) as date
            FROM payments as p
            JOIN sales as s
            ON p.pos_sale_id = s.pos_sale_id
            WHERE s.salesperson = 'BB' AND DATE(s.invoice_datetime) = '${_date}'
            GROUP BY p.account, DATE(s.invoice_datetime)
            ORDER BY DATE(s.invoice_datetime) DESC
      `.trim();
};

export const todays_sales_report = (
      _date: string = new Date().toJSON().split('T')[0]
) => {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(_date)) {
            throw new Error('Invalid date format. Expected YYYY-MM-DD');
      }
      return `
            SELECT *
            FROM sales
            WHERE sales.salesperson = 'BB' AND DATE(sales.invoice_datetime) = '${_date}'
            ORDER BY DATE(sales.invoice_datetime) DESC
      `.trim();
};

// ── DB schema sent to Claude as context (not your actual data) ───────────────
export const DB_SCHEMA = `
      PostgreSQL schema for a Point-of-Sale system. All monetary values are in NGN (₦).
      Tables:
            create table public.items (
                  id uuid not null default gen_random_uuid (),
                  pos_item_id integer not null,
                  item_number text null,
                  product_id text null,
                  item_name text not null,
                  barcode_display_name text null,
                  variation text null,
                  quantity_unit_quantity numeric(10, 4) null,
                  category text null,
                  supplier_id integer null,
                  allow_price_override_regardless_of_permissions boolean null default false,
                  disable_from_price_rules boolean null default false,
                  only_allow_items_to_be_sold_in_whole_numbers boolean null default false,
                  sold_in_a_series boolean null default false,
                  series_quantity integer null,
                  number_of_days_series_must_be_used_within integer null,
                  is_barcoded boolean null default false,
                  inactive boolean null default false,
                  default_quantity_when_selling_or_receiving numeric(10, 4) null default 1,
                  cost_price numeric(15, 2) null default 0.00,
                  supply_price numeric(15, 2) null default 0.00,
                  selling_price numeric(15, 2) null default 0.00,
                  promo_price numeric(15, 2) null,
                  promo_start_date date null,
                  promo_end_date date null,
                  price_includes_tax boolean null default false,
                  is_service boolean null default false,
                  is_favorite boolean null default false,
                  quantity numeric(10, 4) null default 0,
                  reorder_level numeric(10, 4) null,
                  replenish_level numeric(10, 4) null,
                  description text null,
                  long_description text null,
                  information_popup_when_adding_to_sale text null,
                  weight numeric(10, 4) null,
                  weight_unit text null,
                  length numeric(10, 4) null,
                  width numeric(10, 4) null,
                  height numeric(10, 4) null,
                  allow_alt_description boolean null default false,
                  item_has_serial_number boolean null default false,
                  commission numeric(10, 4) null,
                  commission_percent_based_on_profit boolean null default false,
                  tax_group text null,
                  tags text null,
                  days_to_expiration integer null,
                  change_cost_price_during_sale boolean null default false,
                  manufacturer text null,
                  location_at_store text null,
                  created_at timestamp with time zone null default now(),
                  updated_at timestamp with time zone null default now(),
                  constraint items_pkey primary key (id),
                  constraint items_pos_item_id_key unique (pos_item_id),
                  constraint items_supplier_id_fkey foreign KEY (supplier_id) references suppliers (pos_supplier_id) on update CASCADE on delete set null
            ) TABLESPACE pg_default;
            create table public.sale_items (
                  id uuid not null default gen_random_uuid (),
                  pos_sale_id bigint null,
                  pos_item_id integer null,
                  name text not null,
                  quantity bigint not null,
                  unit_price numeric not null,
                  total numeric not null,
                  constraint sales_items_pkey primary key (id),
                  constraint sales_items_pos_item_id_fkey foreign KEY (pos_item_id) references items (pos_item_id) on update CASCADE on delete CASCADE,
                  constraint sales_items_pos_sale_id_fkey foreign KEY (pos_sale_id) references sales (pos_sale_id) on update CASCADE on delete CASCADE
            ) TABLESPACE pg_default;
            create table public.suppliers (
                  id uuid not null default gen_random_uuid (),
                  pos_supplier_id integer not null,
                  company_name text not null,
                  first_name text null,
                  last_name text null,
                  email text null,
                  phone_number text null,
                  address_1 text null,
                  address_2 text null,
                  city text null,
                  state text null,
                  zip text null,
                  country text null,
                  comments text null,
                  account_no text null,
                  internal_notes text null,
                  balance numeric(15, 2) null default 0.00,
                  created_at timestamp with time zone null default now(),
                  updated_at timestamp with time zone null default now(),
                  constraint suppliers_pkey primary key (id),
                  constraint suppliers_pos_supplier_id_key unique (pos_supplier_id)
            ) TABLESPACE pg_default;
            create table public.sales (
                  id uuid not null default gen_random_uuid (),
                  pos_sale_id bigint not null,
                  pos_customer_id integer not null,
                  salesperson text not null,
                  customer_name text not null default ''::text,
                  comment text null,
                  is_anonymous_customer boolean null,
                  invoice_total numeric not null,
                  items_net bigint not null,
                  items_sold bigint not null,
                  items_returned bigint not null,
                  invoice_datetime timestamp with time zone not null,
                  scraped_at timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
                  constraint sale_pkey primary key (id),
                  constraint sale_pos_sale_id_key unique (pos_sale_id),
                  constraint sale_pos_customer_id_fkey foreign KEY (pos_customer_id) references customers (pos_customer_id) on update CASCADE on delete CASCADE
            ) TABLESPACE pg_default;
            create table public.customers (
                  id uuid not null default gen_random_uuid (),
                  pos_customer_id integer null,
                  first_name text not null,
                  last_name text null,
                  company_phone text null,
                  company_name text null,
                  internal_notes text null,
                  created_at timestamp with time zone null default now(),
                  updated_at timestamp with time zone null default now(),
                  email text null,
                  company_email text null,
                  company_website text null,
                  category public.customer_category not null default 'STANDARD'::customer_category,
                  status_level public.customer_status_level not null default 'SILVER'::customer_status_level,
                  is_active boolean not null default true,
                  total_spent numeric(15, 2) not null default 0,
                  total_orders integer not null default 0,
                  total_quantity_purchased integer not null default 0,
                  lifetime_value numeric(15, 2) not null default 0,
                  category_updated_at timestamp with time zone null,
                  status_updated_at timestamp with time zone null,
                  last_order_at timestamp with time zone null,
                  auto_email_receipt boolean null default false,
                  always_sms_receipt boolean null default false,
                  message_to_show_when_adding_customer_to_sale text null,
                  comment text null,
                  balance numeric(15, 2) not null default 0,
                  credit_limit numeric(15, 2) not null default 0,
                  taxable boolean not null default true,
                  non_tax_certificate_number text null,
                  default_invoice_terms text null,
                  disable_loyalty boolean not null default false,
                  points integer not null default 0,
                  name text GENERATED ALWAYS as (
                  TRIM(
                        both
                        from
                        (
                        (COALESCE(first_name, ''::text) || ' '::text) || COALESCE(last_name, ''::text)
                        )
                  )
                  ) STORED null,
                  synced boolean not null default false,
                  syncing boolean not null default false,
                  sync_error text null,
                  constraint customers_pkey primary key (id),
                  constraint customers_email_key unique (email),
                  constraint customers_pos_customer_id_key unique (pos_customer_id)
            ) TABLESPACE pg_default;
            create table public.payments (
                  id uuid not null default gen_random_uuid (),
                  pos_sale_id bigint not null,
                  account_id uuid not null,
                  account text not null,
                  amount numeric not null,
                  constraint payments_pkey primary key (id),
                  constraint payments_account_id_fkey foreign KEY (account_id) references accounts (id) on update CASCADE on delete CASCADE,
                  constraint payments_pos_sale_id_fkey foreign KEY (pos_sale_id) references sales (pos_sale_id) on update CASCADE on delete CASCADE
            ) TABLESPACE pg_default;
            create table public.accounts (
                  id uuid not null default gen_random_uuid (),
                  bank_name text not null,
                  name text not null,
                  account_no text not null,
                  balance numeric not null,
                  created_at timestamp with time zone not null,
                  constraint accounts_pkey primary key (id)
            ) TABLESPACE pg_default;
      Analytical views (prefer these for aggregated queries):
      - v_revenue_daily(sale_date date, num_sales bigint, revenue numeric, items_sold bigint)
      - v_revenue_monthly(month text, num_sales bigint, revenue numeric, avg_sale numeric, items_sold bigint)
      - v_best_selling_items(pos_item_id int, item_name text, category text, selling_price numeric, cost_price numeric, total_qty_sold numeric, total_revenue numeric, gross_profit numeric, margin_pct numeric, times_sold bigint)
      - v_top_customers(pos_customer_id int, customer_name text, phone_number text, email text, total_purchases bigint, lifetime_value numeric, avg_purchase numeric, last_purchase_at timestamptz)
      - v_low_stock_items(pos_item_id int, item_name text, category text, stock_qty numeric, reorder_level numeric, selling_price numeric, cost_price numeric)
      - v_sales_by_salesperson(salesperson text, total_sales bigint, total_revenue numeric, avg_sale numeric, items_sold bigint)
      - v_supplier_stock_value(pos_supplier_id int, supplier_name text, num_products bigint, stock_cost_value numeric, stock_retail_value numeric, outstanding_balance numeric)
      - v_category_performance(category text, num_items bigint, total_qty_sold numeric, total_revenue numeric, gross_profit numeric)
`.trim();

export const DATA_ANALYTICS_CHAT_SYSTEM_INSTRUCTION = `
      You are a SQL assistant for a Nigerian Point-of-Sale analytics dashboard.
      Your job is to convert natural language questions into safe, read-only PostgreSQL queries for Supabase,
      write a clear natural language response based on the results returned after the query is executed.

      RULES:
            Only generate SELECT statements. Never INSERT, UPDATE, DELETE, DROP, TRUNCATE, or any DDL.
            Always add LIMIT 200 unless the user explicitly asks for all.
            Prefer the analytical views (v_*) over raw tables when they contain the needed data.
            For customer-specific queries, use ILIKE for name matching (case-insensitive).
            Add ORDER BY for ranking queries (ORDER BY revenue DESC, etc).
            Format monetary values nicely using ROUND(val, 2).
            The workflow is: You generate the query → user/system runs the query → results are returned to you → you generate the final natural language response.
            RESPONSE WORKFLOW:
                  First, generate the appropriate SQL query based on the user’s question.
                  The system will execute the query and return the results.
                  Then, provide a comprehensive, full-text natural language response based on the actual data returned.
                  If the results are empty, clearly state that no data was found and suggest possible next steps.
            RESPONSE FORMAT — Respond with valid JSON only, no markdown, no explanation outside the JSON:

      {
            "type": "query", // for actionable queries (after results are returned)
            "query": {
                  "sql": "SELECT ...",
                  "explanation": "Detailed explanation of what this query does, what data it fetches, and why it is relevant to the user’s question."
            },
            "response": {
                  "summary": "A full natural language answer to the user's question based on the query results.",
                  "insights": [
                        "Key insight 1 from the data",
                        "Key insight 2 from the data"
                  ],
                  "details": "A detailed explanation with context, observations, trends, or comparisons as applicable.",
                  "recommendations": [
                        "Recommendation 1 based on the data",
                        "Recommendation 2 based on the data"
                  ]
            },
            "data": {
                  "columns": ["column1", "column2"],
                  "rows": [
                        ["value1", "value2"],
                        ["value1"]
                  ],
                  "row_count": 0
            },
            "meta": {
                  "executed_at": "2025-08-21T12:00:00Z",
                  "execution_time_ms": 123,
                  "row_count": 0
            }
      }

      If the query is impossible or nonsensical:
      {
            "type": "error",
            "error": "Brief explanation of why this can't be queried"
      }

      DATABASE SCHEMA:
${DB_SCHEMA}`;

// ── Suggested queries shown at rest state ────────────────────────────────────
export const FALLBACK_SUGGESTIONS = [
      {
            label: 'Top 10 best-selling products',
            query: 'Show me the top 10 best-selling products by revenue',
      },
      {
            label: 'What did a customer buy?',
            query: 'Show all products bought by customer ZIKRULLAHI SHOP with quantities',
      },
      {
            label: 'Low stock alert',
            query: 'Which items are running low and need restocking?',
      },
      {
            label: 'Revenue this month',
            query: 'Total revenue this month broken down by day',
      },
      {
            label: 'Most profitable categories',
            query: 'Which product categories have the highest profit margin?',
      },
      {
            label: 'Supplier outstanding balances',
            query: 'Show all suppliers and how much we owe them',
      },
      {
            label: 'Salesperson performance',
            query: 'Compare salesperson performance by revenue and number of sales',
      },
      {
            label: 'Customer purchase frequency',
            query: 'Show customers ranked by number of purchases and lifetime value',
      },
];
