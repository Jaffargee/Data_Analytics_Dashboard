-- Product price analysis + missing product deep-dive view.
-- Already applied to the "Tahir General POS" Supabase project; kept here so the definitions are tracked.

-- 1) One row per sold line item, with price, quantity and Lagos-local sale date.
create or replace view public.item_price_points
with (security_invoker = true) as
select
  si.id                as sale_item_id,
  si.pos_item_id,
  si.pos_sale_id,
  s.invoice_datetime   as sold_at,
  (s.invoice_datetime at time zone 'Africa/Lagos')::date as sold_date,
  si.quantity,
  si.unit_price,
  si.total,
  (si.quantity < 0)    as is_return
from public.sale_items si
join public.sales s on s.pos_sale_id = si.pos_sale_id
where si.pos_item_id is not null;

-- 2) Full price analysis for one item as a single jsonb document:
--    summary, price_distribution, timeline, price_points.
create or replace function public.get_item_price_analysis(
  p_pos_item_id     integer,
  p_from            date    default null,
  p_to              date    default null,
  p_bucket          text    default 'day',   -- 'day' | 'week' | 'month'
  p_include_returns boolean default false
)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
with params as (
  select case when p_bucket in ('day','week','month') then p_bucket else 'day' end as bucket
),
base as (
  select p.*
  from public.item_price_points p
  where p.pos_item_id = p_pos_item_id
    and (p_from is null or p.sold_date >= p_from)
    and (p_to   is null or p.sold_date <= p_to)
),
sold as (
  select * from base where p_include_returns or not is_return
),
summary as (
  select
    count(*)                                                        as sale_lines,
    coalesce(sum(quantity) filter (where not is_return), 0)         as units_sold,
    coalesce(-sum(quantity) filter (where is_return), 0)            as units_returned,
    coalesce(sum(quantity), 0)                                      as net_units,
    round(avg(unit_price), 2)                                       as avg_price,
    round(sum(unit_price * quantity) / nullif(sum(quantity), 0), 2) as weighted_avg_price,
    min(unit_price)                                                 as min_price,
    max(unit_price)                                                 as max_price,
    percentile_cont(0.5) within group (order by unit_price)         as median_price,
    mode() within group (order by unit_price)                       as most_common_price,
    round(stddev_pop(unit_price), 2)                                as price_stddev,
    min(sold_date)                                                  as first_sale_date,
    max(sold_date)                                                  as last_sale_date
  from sold
),
dist as (
  select
    unit_price                                    as price,
    sum(quantity)                                 as units,
    count(*)                                      as sale_lines,
    round(100.0 * sum(quantity) / nullif(sum(sum(quantity)) over (), 0), 2) as pct_of_units
  from sold
  group by unit_price
),
timeline as (
  select
    date_trunc((select bucket from params), sold_date::timestamp)::date as period,
    sum(quantity)                                                      as units,
    count(*)                                                           as sale_lines,
    round(sum(unit_price * quantity) / nullif(sum(quantity), 0), 2)    as avg_price,
    min(unit_price)                                                    as min_price,
    max(unit_price)                                                    as max_price
  from sold
  group by 1
)
select jsonb_build_object(
  'item', (select to_jsonb(i) from (
            select pos_item_id, item_name, category, cost_price, selling_price as list_price
            from public.items where pos_item_id = p_pos_item_id) i),
  'filters', jsonb_build_object('from', p_from, 'to', p_to, 'bucket', (select bucket from params), 'include_returns', p_include_returns),
  'summary', (select to_jsonb(s) from summary s),
  'price_distribution', coalesce((select jsonb_agg(to_jsonb(d) order by d.price) from dist d), '[]'::jsonb),
  'timeline', coalesce((select jsonb_agg(to_jsonb(t) order by t.period) from timeline t), '[]'::jsonb),
  'price_points', coalesce((select jsonb_agg(jsonb_build_object(
        'sold_at', sold_at, 'sale_id', pos_sale_id, 'unit_price', unit_price, 'quantity', quantity)
        order by sold_at) from sold), '[]'::jsonb)
);
$$;

revoke all on function public.get_item_price_analysis(integer, date, date, text, boolean) from public, anon;
grant execute on function public.get_item_price_analysis(integer, date, date, text, boolean) to authenticated, service_role;

create index if not exists sale_items_pos_item_id_idx on public.sale_items (pos_item_id);
create index if not exists sale_items_pos_sale_id_idx on public.sale_items (pos_sale_id);

-- 3) The view the product page (src/pages/Products/hooks.ts) queries. It was missing from the
--    database, which made every product page show "No product was found for this ID".
create or replace view public.v_product_deep_dive
with (security_invoker = on) as
with sales_agg as (
  select
    si.pos_item_id,
    sum(si.quantity)                         as total_quantity,
    sum(si.total)                            as revenue,
    sum(si.quantity * si.unit_price)         as gross_revenue,
    count(distinct si.pos_sale_id)           as total_orders,
    count(distinct s.pos_customer_id)        as distinct_customers
  from public.sale_items si
  left join public.sales s on s.pos_sale_id = si.pos_sale_id
  where si.pos_item_id is not null
  group by si.pos_item_id
),
top_customer as (
  select distinct on (pos_item_id)
    pos_item_id,
    customer_name     as top_customer_name,
    pos_customer_id   as top_customer_id,
    total_quantity    as top_customer_quantity,
    total_revenue     as top_customer_revenue
  from public.v_product_top_customers
  order by pos_item_id, qty_rank, total_revenue desc
)
select
  i.pos_item_id,
  i.item_name,
  i.category                                                         as item_category,
  coalesce(a.total_quantity, 0)                                      as total_quantity,
  coalesce(i.cost_price, 0)                                          as cost_price,
  coalesce(i.selling_price, 0)                                       as selling_price,
  coalesce(a.total_quantity, 0) * coalesce(i.cost_price, 0)          as cogs,
  coalesce(a.gross_revenue, 0)                                       as gross_revenue,
  coalesce(a.revenue, 0)                                             as revenue,
  coalesce(a.gross_revenue, 0) - coalesce(a.revenue, 0)              as discount_impact,
  coalesce(a.revenue, 0) - coalesce(a.total_quantity, 0) * coalesce(i.cost_price, 0) as profit,
  round(100.0 * (coalesce(a.revenue, 0) - coalesce(a.total_quantity, 0) * coalesce(i.cost_price, 0))
        / nullif(a.revenue, 0), 2)                                   as margin_pct,
  round(100.0 * (coalesce(a.gross_revenue, 0) - coalesce(a.revenue, 0))
        / nullif(a.gross_revenue, 0), 2)                             as discount_pct,
  coalesce(a.total_orders, 0)                                        as total_orders,
  coalesce(a.distinct_customers, 0)                                  as distinct_customers,
  pp.peak_week,
  pp.peak_week_quantity,
  coalesce(vt.qty_last_7d, 0)                                        as qty_last_7d,
  coalesce(vt.qty_prior_7d, 0)                                       as qty_prior_7d,
  coalesce(vt.avg_daily_velocity_30d, 0)                             as avg_daily_velocity_30d,
  coalesce(vt.trend_status, 'DORMANT')                               as trend_status,
  tc.top_customer_name,
  tc.top_customer_id,
  tc.top_customer_quantity,
  tc.top_customer_revenue
from public.items i
left join sales_agg a                          on a.pos_item_id  = i.pos_item_id
left join public.v_product_peak_period pp      on pp.pos_item_id = i.pos_item_id
left join public.v_product_velocity_trend vt   on vt.pos_item_id = i.pos_item_id
left join top_customer tc                      on tc.pos_item_id = i.pos_item_id;

grant select on public.v_product_deep_dive to anon, authenticated, service_role;
