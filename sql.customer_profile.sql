-- ─────────────────────────────────────────────────────────────────────────────
-- Customer profile: editable profile + create-customer support
-- Applied to the "Tahir General POS" Supabase project.
--
-- Design notes
--  * The dashboard has no login, so it talks to Supabase with the anon key.
--    All customer tables have RLS enabled with no policies, so direct writes
--    from the browser are blocked. Instead of opening the tables up, the app
--    goes through two narrow SECURITY DEFINER functions:
--        get_customer_profile(...)  -> one jsonb document
--        save_customer(...)         -> create/update in a single transaction
--  * Customers created in the dashboard have no pos_customer_id yet (it is
--    nullable + unique), so child tables are keyed by customers.id (uuid).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. New profile fields on customers -----------------------------------------
alter table public.customers
  add column if not exists company_name   text,
  add column if not exists internal_notes text;

-- 2. customer_addresses: key by uuid (pos_customer_id becomes optional) --------
alter table public.customer_addresses
  add column if not exists customer_id uuid
    references public.customers(id) on delete cascade;

update public.customer_addresses a
   set customer_id = c.id
  from public.customers c
 where c.pos_customer_id = a.pos_customer_id
   and a.customer_id is null;

alter table public.customer_addresses
  alter column pos_customer_id drop not null;

alter table public.customer_addresses
  add constraint customer_addresses_owner_chk check (customer_id is not null);

create index if not exists customer_addresses_customer_id_idx
  on public.customer_addresses (customer_id);
create index if not exists customer_accounts_customer_id_idx
  on public.customer_accounts (customer_id);
create index if not exists customer_contact_methods_customer_id_idx
  on public.customer_contact_methods (customer_id);

-- 3. Contact-method integrity --------------------------------------------------
alter table public.customer_contact_methods
  add constraint customer_contact_email_chk
    check (type <> 'email' or value ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add constraint customer_contact_phone_chk
    check (type <> 'phone' or length(regexp_replace(value, '\D', '', 'g')) >= 7);

create unique index if not exists customer_contact_unique_value
  on public.customer_contact_methods (customer_id, type, lower(value));

-- at most one primary phone and one primary email per customer
create unique index if not exists customer_contact_one_primary
  on public.customer_contact_methods (customer_id, type) where is_primary;

create unique index if not exists customer_address_one_primary
  on public.customer_addresses (customer_id) where is_primary;

-- 4. Read: whole profile as one document ---------------------------------------
create or replace function public.get_customer_profile(
  p_id uuid default null,
  p_pos_customer_id integer default null
) returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id',              c.id,
    'pos_customer_id', c.pos_customer_id,
    'first_name',      c.first_name,
    'last_name',       c.last_name,
    'customer_name',   c.customer_name,
    'category',        c.category,
    'status_level',    c.status_level,
    'is_active',       c.is_active,
    'company_name',    c.company_name,
    'internal_notes',  c.internal_notes,
    'created_at',      c.created_at,
    'contacts', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', m.id, 'type', m.type, 'value', m.value, 'is_primary', m.is_primary)
             order by m.type, m.is_primary desc, m.value)
        from public.customer_contact_methods m where m.customer_id = c.id
    ), '[]'::jsonb),
    'addresses', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', a.id, 'label', a.label, 'is_primary', a.is_primary,
               'line_1', a.line_1, 'line_2', a.line_2, 'city', a.city,
               'state', a.state, 'postal_code', a.postal_code, 'country', a.country)
             order by a.is_primary desc, a.label, a.line_1)
        from public.customer_addresses a where a.customer_id = c.id
    ), '[]'::jsonb),
    'accounts', coalesce((
      select jsonb_agg(jsonb_build_object(
               'id', k.id, 'bank_name', k.bank_name,
               'account_no', k.account_no, 'account_name', k.account_name)
             order by k.bank_name, k.account_no)
        from public.customer_accounts k where k.customer_id = c.id
    ), '[]'::jsonb)
  )
  from public.customers c
  where (p_id is not null and c.id = p_id)
     or (p_id is null and p_pos_customer_id is not null
         and c.pos_customer_id = p_pos_customer_id)
  limit 1;
$$;

-- 5. Write: create (p_id null) or update, atomically ---------------------------
-- Contacts / addresses / accounts in p_data are the COMPLETE new set; the
-- existing rows are replaced inside the same transaction.
create or replace function public.save_customer(p_id uuid, p_data jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id     uuid := p_id;
  v_first  text := nullif(btrim(p_data->>'first_name'), '');
  v_last   text := nullif(btrim(p_data->>'last_name'), '');
  v_cat    customer_category     := nullif(p_data->>'category', '')::customer_category;
  v_status customer_status_level := nullif(p_data->>'status_level', '')::customer_status_level;
  v_pos    integer;
begin
  if v_first is null then
    raise exception 'First name is required' using errcode = '22023';
  end if;

  if exists (
    select 1 from jsonb_array_elements(coalesce(p_data->'contacts', '[]')) e
     where e->>'type' = 'email'
       and nullif(btrim(e->>'value'), '') is not null
       and btrim(e->>'value') !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ) then
    raise exception 'Invalid email address' using errcode = '22023';
  end if;

  if exists (
    select 1 from jsonb_array_elements(coalesce(p_data->'contacts', '[]')) e
     where e->>'type' = 'phone'
       and nullif(btrim(e->>'value'), '') is not null
       and length(regexp_replace(e->>'value', '\D', '', 'g')) < 7
  ) then
    raise exception 'Invalid phone number' using errcode = '22023';
  end if;

  if exists (
    select 1 from jsonb_array_elements(coalesce(p_data->'accounts', '[]')) e
     where (nullif(btrim(e->>'bank_name'), '')    is not null
         or nullif(btrim(e->>'account_no'), '')   is not null
         or nullif(btrim(e->>'account_name'), '') is not null)
       and (nullif(btrim(e->>'bank_name'), '')    is null
         or nullif(btrim(e->>'account_no'), '')   is null
         or nullif(btrim(e->>'account_name'), '') is null)
  ) then
    raise exception 'Bank accounts need a bank name, account number and account name'
      using errcode = '22023';
  end if;

  if v_id is null then
    insert into customers
      (first_name, last_name, category, status_level, is_active, company_name, internal_notes)
    values
      (v_first, v_last,
       coalesce(v_cat, 'END_USER'), coalesce(v_status, 'SILVER'),
       coalesce((p_data->>'is_active')::boolean, true),
       nullif(btrim(p_data->>'company_name'), ''),
       nullif(btrim(p_data->>'internal_notes'), ''))
    returning id, pos_customer_id into v_id, v_pos;
  else
    update customers set
      first_name          = v_first,
      last_name           = v_last,
      category            = coalesce(v_cat, category),
      category_updated_at = case when v_cat is not null and v_cat is distinct from category
                                 then now() else category_updated_at end,
      status_level        = coalesce(v_status, status_level),
      status_updated_at   = case when v_status is not null and v_status is distinct from status_level
                                 then now() else status_updated_at end,
      is_active           = coalesce((p_data->>'is_active')::boolean, is_active),
      company_name        = nullif(btrim(p_data->>'company_name'), ''),
      internal_notes      = nullif(btrim(p_data->>'internal_notes'), '')
    where id = v_id
    returning pos_customer_id into v_pos;

    if not found then
      raise exception 'Customer not found' using errcode = 'P0002';
    end if;
  end if;

  -- contacts (phones + emails): dedupe, first flagged (else first) is primary per type
  delete from customer_contact_methods where customer_id = v_id;
  insert into customer_contact_methods (customer_id, type, value, is_primary)
  with src as (
    select (e->>'type')::contact_method_type            as type,
           btrim(e->>'value')                           as value,
           coalesce((e->>'is_primary')::boolean, false) as flag,
           ord
      from jsonb_array_elements(coalesce(p_data->'contacts', '[]'))
           with ordinality as t(e, ord)
     where nullif(btrim(e->>'value'), '') is not null
  ), dedup as (
    select distinct on (type, lower(value)) type, value, flag, ord
      from src order by type, lower(value), ord
  )
  select v_id, type, value,
         row_number() over (partition by type order by flag desc, ord) = 1
    from dedup;

  -- addresses
  delete from customer_addresses where customer_id = v_id;
  insert into customer_addresses
    (customer_id, pos_customer_id, label, is_primary, line_1, line_2, city, state, postal_code, country)
  with src as (
    select coalesce(nullif(e->>'label', ''), 'Home')::address_label as label,
           coalesce((e->>'is_primary')::boolean, false)             as flag,
           btrim(e->>'line_1')                                      as line_1,
           nullif(btrim(e->>'line_2'), '')                          as line_2,
           coalesce(btrim(e->>'city'), '')                          as city,
           coalesce(btrim(e->>'state'), '')                         as state,
           nullif(btrim(e->>'postal_code'), '')                     as postal_code,
           coalesce(nullif(btrim(e->>'country'), ''), 'Nigeria')    as country,
           ord
      from jsonb_array_elements(coalesce(p_data->'addresses', '[]'))
           with ordinality as t(e, ord)
     where nullif(btrim(e->>'line_1'), '') is not null
  )
  select v_id, v_pos, label, row_number() over (order by flag desc, ord) = 1,
         line_1, line_2, city, state, postal_code, country
    from src;

  -- bank accounts
  delete from customer_accounts where customer_id = v_id;
  insert into customer_accounts (customer_id, bank_name, account_no, account_name)
  select v_id, btrim(e->>'bank_name'), btrim(e->>'account_no'), btrim(e->>'account_name')
    from jsonb_array_elements(coalesce(p_data->'accounts', '[]')) e
   where nullif(btrim(e->>'bank_name'), '') is not null;

  return v_id;
end;
$$;

-- 6. Expose only the two functions to the browser roles ------------------------
revoke all on function public.get_customer_profile(uuid, integer) from public;
revoke all on function public.save_customer(uuid, jsonb)          from public;
grant execute on function public.get_customer_profile(uuid, integer) to anon, authenticated;
grant execute on function public.save_customer(uuid, jsonb)          to anon, authenticated;

-- 7. customer_directory view (read by the Customers > Directory tab) ----------
-- The tab already expected this view but it did not exist in the database.
-- email / phone come from each customer's primary contact methods.
create or replace view public.customer_directory as
with s as (
  select pos_customer_id,
         sum(invoice_total)            as total_spent,
         count(distinct pos_sale_id)   as total_orders,
         sum(items_sold)               as total_quantity,
         max(invoice_datetime)         as last_order_at
    from public.sales
   where pos_customer_id is not null
   group by pos_customer_id
)
select c.id,
       c.pos_customer_id,
       c.customer_name                         as display_name,
       c.company_name,
       (select m.value from public.customer_contact_methods m
         where m.customer_id = c.id and m.type = 'email'
         order by m.is_primary desc, m.created_at limit 1) as email,
       (select m.value from public.customer_contact_methods m
         where m.customer_id = c.id and m.type = 'phone'
         order by m.is_primary desc, m.created_at limit 1) as phone,
       c.category::text                        as category,
       c.status_level::text                    as status_level,
       c.is_active,
       coalesce(s.total_spent, 0)::numeric     as total_spent,
       coalesce(s.total_orders, 0)::integer    as total_orders,
       coalesce(s.total_quantity, 0)::integer  as total_quantity_purchased,
       coalesce(s.total_spent, 0)::numeric     as lifetime_value,
       coalesce(p.profit, 0)::numeric          as profit_contribution,
       0::numeric                              as balance,       -- no balance column yet
       0::numeric                              as credit_limit,  -- no credit limit column yet
       s.last_order_at,
       case when s.last_order_at is null then null
            else (current_date - s.last_order_at::date) end as days_since_last_order
  from public.customers c
  left join s on s.pos_customer_id = c.pos_customer_id
  left join public.customer_profit p on p.pos_customer_id = c.pos_customer_id;

grant select on public.customer_directory to anon, authenticated;

-- same access model as the other customer views (v_top_customers, customer_profit, ...)
alter view public.customer_directory set (security_invoker = on);
