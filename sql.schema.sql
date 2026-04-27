-- ============================================================
-- TEXTILE ANALYTICS SCHEMA + VIEWS
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── 1. REPORT PERIODS table (for timeline-based reports) ────
create table if not exists public.report_periods (
  id          uuid not null default gen_random_uuid(),
  name        text not null,
  period_from date not null,
  period_to   date not null,
  notes       text null,
  created_at  timestamp with time zone null default now(),
  constraint report_periods_pkey primary key (id)
) tablespace pg_default;

-- ── 2. v_revenue_by_dow ──────────────────────────────────────
create or replace view public.v_revenue_by_dow as
select
  to_char(invoice_datetime, 'Day')            as day_of_week,
  extract(isodow from invoice_datetime)::int  as dow_num,
  count(distinct pos_sale_id)                 as transactions,
  sum(invoice_total)                          as revenue,
  sum(items_sold)                             as units_sold
from public.sales
group by 1, 2
order by 2;

-- ── 3. v_revenue_by_category ────────────────────────────────
create or replace view public.v_revenue_by_category as
select
  i.category,
  sum(si.total)                       as revenue,
  sum(si.quantity)                    as units_sold,
  count(distinct si.pos_sale_id)      as transactions,
  round(avg(si.unit_price), 2)        as avg_unit_price,
  round(sum(si.total) / nullif(sum(si.quantity), 0), 2) as avg_price_per_unit
from public.sale_items si
join public.items i on i.pos_item_id = si.pos_item_id
group by i.category
order by revenue desc;

-- ── 4. v_product_performance ────────────────────────────────
create or replace view public.v_product_performance as
select
  i.pos_item_id,
  i.item_name,
  i.category,
  i.selling_price,
  i.cost_price,
  sum(si.quantity)                    as total_qty_sold,
  sum(si.total)                       as total_revenue,
  count(distinct si.pos_sale_id)      as times_sold,
  round(avg(si.unit_price), 2)        as avg_selling_price,
  round(sum(si.total) / nullif(count(distinct si.pos_sale_id), 0), 2) as rev_per_transaction,
  round(sum(si.total) - sum(si.quantity * coalesce(i.cost_price, 0)), 2) as gross_profit,
  round(
    (sum(si.total) - sum(si.quantity * coalesce(i.cost_price, 0)))
    / nullif(sum(si.total), 0) * 100, 2
  ) as margin_pct
from public.sale_items si
join public.items i on i.pos_item_id = si.pos_item_id
group by i.pos_item_id, i.item_name, i.category, i.selling_price, i.cost_price
order by total_revenue desc;

-- ── 5. v_price_sensitivity ───────────────────────────────────
create or replace view public.v_price_sensitivity as
select
  case
    when si.unit_price < 5000   then '<5k'
    when si.unit_price < 10000  then '5-10k'
    when si.unit_price < 20000  then '10-20k'
    when si.unit_price < 30000  then '20-30k'
    when si.unit_price < 50000  then '30-50k'
    when si.unit_price < 100000 then '50-100k'
    else '>100k'
  end as price_bucket,
  case
    when si.unit_price < 5000   then 1
    when si.unit_price < 10000  then 2
    when si.unit_price < 20000  then 3
    when si.unit_price < 30000  then 4
    when si.unit_price < 50000  then 5
    when si.unit_price < 100000 then 6
    else 7
  end as sort_order,
  count(*) as line_items,
  sum(si.quantity) as units_sold,
  sum(si.total) as revenue,
  round(sum(si.total) / nullif(sum(sum(si.total)) over (), 0) * 100, 2) as pct_of_revenue
from public.sale_items si
group by 1, 2
order by 2;

-- ── 6. v_time_of_day_intelligence ───────────────────────────
create or replace view public.v_time_of_day_intelligence as
select
  case
    when extract(hour from s.invoice_datetime) < 11 then 'Morning(<11)'
    when extract(hour from s.invoice_datetime) < 13 then 'Midday(11-1)'
    when extract(hour from s.invoice_datetime) < 18 then 'Afternoon(1-6)'
    when extract(hour from s.invoice_datetime) < 21 then 'Evening(6-9)'
    else 'Night(9+)'
  end as time_bucket,
  case
    when extract(hour from s.invoice_datetime) < 11 then 1
    when extract(hour from s.invoice_datetime) < 13 then 2
    when extract(hour from s.invoice_datetime) < 18 then 3
    when extract(hour from s.invoice_datetime) < 21 then 4
    else 5
  end as sort_order,
  count(distinct s.pos_sale_id) as transactions,
  sum(s.invoice_total) as revenue
from public.sales s
group by 1, 2
order by 2;

-- ── 7. v_customer_intelligence ──────────────────────────────
create or replace view public.v_customer_intelligence as
select
  s.pos_customer_id,
  s.customer_name,
  c.phone_number,
  c.email,
  count(distinct s.pos_sale_id)       as total_purchases,
  sum(s.invoice_total)                as lifetime_value,
  round(avg(s.invoice_total), 2)      as avg_basket,
  sum(s.items_sold)                   as total_units,
  max(s.invoice_datetime)             as last_purchase_at,
  min(s.invoice_datetime)             as first_purchase_at,
  round(sum(s.invoice_total) / nullif(count(distinct s.pos_sale_id), 0), 2) as avg_purchase
from public.sales s
left join public.customers c on c.pos_customer_id = s.pos_customer_id
group by s.pos_customer_id, s.customer_name, c.phone_number, c.email
order by lifetime_value desc;

-- ── 8. v_category_best_day ───────────────────────────────────
create or replace view public.v_category_best_day as
with cat_dow as (
  select
    i.category,
    to_char(s.invoice_datetime, 'Day') as day_of_week,
    extract(isodow from s.invoice_datetime)::int as dow_num,
    sum(si.total) as revenue
  from public.sale_items si
  join public.items i on i.pos_item_id = si.pos_item_id
  join public.sales s on s.pos_sale_id = si.pos_sale_id
  group by i.category, 2, 3
),
ranked as (
  select *, rank() over (partition by category order by revenue desc) as rnk
  from cat_dow
)
select category, day_of_week, dow_num, revenue as revenue_on_best_day
from ranked where rnk = 1
order by revenue_on_best_day desc;

-- ═══════════════════════════════════════════════════════════
-- PARAMETERISED RPC FUNCTIONS (date-range aware)
-- ═══════════════════════════════════════════════════════════

create or replace function public.fn_period_executive_summary(from_date date, to_date date)
returns table (metric text, value numeric) language sql stable as $$
  select 'total_revenue'::text, coalesce(sum(invoice_total), 0)                                             from public.sales where invoice_datetime::date between from_date and to_date
  union all select 'total_transactions',   coalesce(count(distinct pos_sale_id), 0)                          from public.sales where invoice_datetime::date between from_date and to_date
  union all select 'total_units_sold',     coalesce(sum(items_sold), 0)                                      from public.sales where invoice_datetime::date between from_date and to_date
  union all select 'avg_basket_value',     coalesce(avg(invoice_total), 0)                                   from public.sales where invoice_datetime::date between from_date and to_date
  union all select 'avg_daily_revenue',    coalesce(sum(invoice_total)/nullif(to_date-from_date+1,0), 0)     from public.sales where invoice_datetime::date between from_date and to_date
  union all select 'trading_days',         (to_date - from_date + 1)::numeric
  union all select 'total_items_returned', coalesce(sum(items_returned), 0)                                  from public.sales where invoice_datetime::date between from_date and to_date;
$$;

create or replace function public.fn_period_revenue_by_dow(from_date date, to_date date)
returns table (day_of_week text, dow_num int, transactions bigint, revenue numeric, units_sold bigint)
language sql stable as $$
  select to_char(invoice_datetime,'Day'), extract(isodow from invoice_datetime)::int,
    count(distinct pos_sale_id), sum(invoice_total), sum(items_sold)
  from public.sales where invoice_datetime::date between from_date and to_date
  group by 1,2 order by 2;
$$;

create or replace function public.fn_period_revenue_by_category(from_date date, to_date date)
returns table (category text, revenue numeric, units_sold numeric, transactions bigint, avg_price numeric)
language sql stable as $$
  select i.category, sum(si.total), sum(si.quantity), count(distinct si.pos_sale_id), round(avg(si.unit_price),2)
  from public.sale_items si
  join public.items i on i.pos_item_id = si.pos_item_id
  join public.sales s on s.pos_sale_id = si.pos_sale_id
  where s.invoice_datetime::date between from_date and to_date
  group by i.category order by 2 desc;
$$;

create or replace function public.fn_period_top_products(from_date date, to_date date, top_n int default 25)
returns table (item_name text, category text, revenue numeric, units_sold numeric, transactions bigint, avg_price numeric, rev_per_txn numeric, gross_profit numeric, margin_pct numeric)
language sql stable as $$
  select si.name, i.category, sum(si.total), sum(si.quantity), count(distinct si.pos_sale_id),
    round(avg(si.unit_price),2),
    round(sum(si.total)/nullif(count(distinct si.pos_sale_id),0),2),
    round(sum(si.total)-sum(si.quantity*coalesce(i.cost_price,0)),2),
    round((sum(si.total)-sum(si.quantity*coalesce(i.cost_price,0)))/nullif(sum(si.total),0)*100,2)
  from public.sale_items si
  join public.items i on i.pos_item_id=si.pos_item_id
  join public.sales s on s.pos_sale_id=si.pos_sale_id
  where s.invoice_datetime::date between from_date and to_date
  group by si.name, i.category order by 3 desc limit top_n;
$$;

create or replace function public.fn_period_price_sensitivity(from_date date, to_date date)
returns table (price_bucket text, sort_order int, line_items bigint, units_sold numeric, revenue numeric, pct_of_revenue numeric)
language sql stable as $$
  with base as (
    select case when si.unit_price<5000 then '<5k' when si.unit_price<10000 then '5-10k'
      when si.unit_price<20000 then '10-20k' when si.unit_price<30000 then '20-30k'
      when si.unit_price<50000 then '30-50k' when si.unit_price<100000 then '50-100k' else '>100k' end as pb,
      case when si.unit_price<5000 then 1 when si.unit_price<10000 then 2 when si.unit_price<20000 then 3
      when si.unit_price<30000 then 4 when si.unit_price<50000 then 5 when si.unit_price<100000 then 6 else 7 end as so,
      si.quantity, si.total
    from public.sale_items si join public.sales s on s.pos_sale_id=si.pos_sale_id
    where s.invoice_datetime::date between from_date and to_date
  )
  select pb, so, count(*), sum(quantity), sum(total),
    round(sum(total)/nullif(sum(sum(total)) over(),0)*100,2)
  from base group by pb,so order by so;
$$;

create or replace function public.fn_period_time_intelligence(from_date date, to_date date)
returns table (time_bucket text, sort_order int, transactions bigint, revenue numeric)
language sql stable as $$
  select case when extract(hour from invoice_datetime)<11 then 'Morning(<11)'
    when extract(hour from invoice_datetime)<13 then 'Midday(11-1)'
    when extract(hour from invoice_datetime)<18 then 'Afternoon(1-6)'
    when extract(hour from invoice_datetime)<21 then 'Evening(6-9)' else 'Night(9+)' end,
    case when extract(hour from invoice_datetime)<11 then 1 when extract(hour from invoice_datetime)<13 then 2
    when extract(hour from invoice_datetime)<18 then 3 when extract(hour from invoice_datetime)<21 then 4 else 5 end,
    count(distinct pos_sale_id), sum(invoice_total)
  from public.sales where invoice_datetime::date between from_date and to_date
  group by 1,2 order by 2;
$$;

create or replace function public.fn_period_top_customers(from_date date, to_date date, top_n int default 15)
returns table (customer_name text, revenue numeric, transactions bigint, units bigint, avg_basket numeric, pct_of_total numeric)
language sql stable as $$
  with total as (select sum(invoice_total) as t from public.sales where invoice_datetime::date between from_date and to_date)
  select s.customer_name, sum(s.invoice_total), count(distinct s.pos_sale_id), sum(s.items_sold),
    round(avg(s.invoice_total),2), round(sum(s.invoice_total)/nullif((select t from total),0)*100,2)
  from public.sales s where s.invoice_datetime::date between from_date and to_date
  group by s.customer_name order by 2 desc limit top_n;
$$;

create or replace function public.fn_period_daily_breakdown(from_date date, to_date date)
returns table (sale_date date, day_of_week text, revenue numeric, transactions bigint, units_sold bigint)
language sql stable as $$
  select invoice_datetime::date, to_char(invoice_datetime,'Day'),
    sum(invoice_total), count(distinct pos_sale_id), sum(items_sold)
  from public.sales where invoice_datetime::date between from_date and to_date
  group by 1,2 order by 1;
$$;

create or replace function public.fn_period_comparison(p1_from date, p1_to date, p2_from date, p2_to date)
returns table (metric text, period_1 numeric, period_2 numeric, change numeric, change_pct numeric)
language sql stable as $$
  with p1 as (select sum(invoice_total) as rev, count(distinct pos_sale_id) as txn,
    avg(invoice_total) as basket, sum(items_sold) as units,
    sum(invoice_total)/nullif(p1_to-p1_from+1,0) as daily
    from public.sales where invoice_datetime::date between p1_from and p1_to),
  p2 as (select sum(invoice_total) as rev, count(distinct pos_sale_id) as txn,
    avg(invoice_total) as basket, sum(items_sold) as units,
    sum(invoice_total)/nullif(p2_to-p2_from+1,0) as daily
    from public.sales where invoice_datetime::date between p2_from and p2_to)
  select 'Total Revenue', p1.rev, p2.rev, p2.rev-p1.rev, round((p2.rev-p1.rev)/nullif(p1.rev,0)*100,2) from p1,p2
  union all select 'Transactions', p1.txn, p2.txn, p2.txn-p1.txn, round((p2.txn-p1.txn)/nullif(p1.txn,0)*100,2) from p1,p2
  union all select 'Avg Basket', p1.basket, p2.basket, p2.basket-p1.basket, round((p2.basket-p1.basket)/nullif(p1.basket,0)*100,2) from p1,p2
  union all select 'Avg Daily Revenue', p1.daily, p2.daily, p2.daily-p1.daily, round((p2.daily-p1.daily)/nullif(p1.daily,0)*100,2) from p1,p2
  union all select 'Units Sold', p1.units, p2.units, p2.units-p1.units, round((p2.units-p1.units)/nullif(p1.units,0)*100,2) from p1,p2;
$$;

-- ── Grant permissions ────────────────────────────────────────
grant select on public.v_revenue_by_dow              to anon, authenticated;
grant select on public.v_revenue_by_category         to anon, authenticated;
grant select on public.v_product_performance         to anon, authenticated;
grant select on public.v_price_sensitivity           to anon, authenticated;
grant select on public.v_time_of_day_intelligence    to anon, authenticated;
grant select on public.v_customer_intelligence       to anon, authenticated;
grant select on public.v_category_best_day           to anon, authenticated;
grant execute on function public.fn_period_executive_summary(date,date)        to anon, authenticated;
grant execute on function public.fn_period_revenue_by_dow(date,date)           to anon, authenticated;
grant execute on function public.fn_period_revenue_by_category(date,date)      to anon, authenticated;
grant execute on function public.fn_period_top_products(date,date,int)         to anon, authenticated;
grant execute on function public.fn_period_price_sensitivity(date,date)        to anon, authenticated;
grant execute on function public.fn_period_time_intelligence(date,date)        to anon, authenticated;
grant execute on function public.fn_period_top_customers(date,date,int)        to anon, authenticated;
grant execute on function public.fn_period_daily_breakdown(date,date)          to anon, authenticated;
grant execute on function public.fn_period_comparison(date,date,date,date)     to anon, authenticated;