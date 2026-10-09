-- Server-side order creation. Clients have no INSERT policy on orders/order_items, so this is the only
-- client path to create an order. Prices come from craft_items, never from the client; only published
-- items of verified artisans are orderable; orders always start as 'pending'.
-- p_items: [{"craft_item_id": "<uuid>", "quantity": <int 1..99>}, ...] (1..50 entries, duplicates merged).
-- p_idempotency_key: replaying the same key returns the caller's existing order instead of creating another.
create or replace function public.create_order(p_items jsonb, p_idempotency_key text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  caller uuid := auth.uid();
  existing_order uuid;
  existing_customer uuid;
  new_order uuid;
  line_count integer;
  orderable_count integer;
begin
  if caller is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_idempotency_key is null or length(p_idempotency_key) not between 8 and 128 then
    raise exception 'idempotency key must be 8-128 characters' using errcode = '22023';
  end if;

  select id, customer_id into existing_order, existing_customer from public.orders where idempotency_key = p_idempotency_key;
  if existing_order is not null then
    if existing_customer <> caller then
      raise exception 'idempotency key already used' using errcode = '23505';
    end if;
    return existing_order;
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'items must be an array of 1-50 entries' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_items) e
    where jsonb_typeof(e) <> 'object'
      or coalesce(e->>'craft_item_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or jsonb_typeof(e->'quantity') is distinct from 'number'
      or not (case when (e->>'quantity') ~ '^[0-9]{1,2}$' then (e->>'quantity')::integer between 1 and 99 else false end)
  ) then
    raise exception 'each item needs a craft_item_id uuid and an integer quantity 1-99' using errcode = '22023';
  end if;

  select count(*), count(ci.id) into line_count, orderable_count
  from (
    select (e->>'craft_item_id')::uuid as craft_item_id, sum((e->>'quantity')::integer) as quantity
    from jsonb_array_elements(p_items) e group by 1
  ) l
  left join (public.craft_items ci join public.artisans a on a.id = ci.artisan_id and a.is_verified = true)
    on ci.id = l.craft_item_id and ci.is_published = true;
  if orderable_count <> line_count then
    raise exception 'one or more items are not available' using errcode = '22023';
  end if;

  begin
    insert into public.orders (customer_id, status, total_myr, idempotency_key)
    values (caller, 'pending', 0, p_idempotency_key) returning id into new_order;
  exception when unique_violation then
    -- A concurrent request with the same key won the race.
    select id, customer_id into existing_order, existing_customer from public.orders where idempotency_key = p_idempotency_key;
    if existing_customer is distinct from caller then
      raise exception 'idempotency key already used' using errcode = '23505';
    end if;
    return existing_order;
  end;

  insert into public.order_items (order_id, craft_item_id, quantity, unit_price_myr)
  select new_order, l.craft_item_id, l.quantity, ci.price_myr
  from (
    select (e->>'craft_item_id')::uuid as craft_item_id, sum((e->>'quantity')::integer) as quantity
    from jsonb_array_elements(p_items) e group by 1
  ) l
  join public.craft_items ci on ci.id = l.craft_item_id;

  -- Total is derived from the stored line prices so the two can never disagree.
  update public.orders set total_myr = (select sum(quantity * unit_price_myr) from public.order_items where order_id = new_order)
  where id = new_order;

  return new_order;
end;
$$;

revoke all on function public.create_order(jsonb, text) from public, anon;
grant execute on function public.create_order(jsonb, text) to authenticated;
