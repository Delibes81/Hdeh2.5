-- Reserve limited coupon uses while Stripe Checkout is open. A successful paid
-- order redeems the reservation in the same database transaction that creates
-- the order and allocates inventory. Public coupon reads are removed only after
-- the new validation API is live, avoiding downtime during deployment.

alter table public.orders
    add column if not exists coupon_code text;

create table if not exists public.coupon_reservations (
    id uuid primary key default gen_random_uuid(),
    reservation_token uuid not null unique,
    coupon_id uuid not null references public.coupons(id),
    status text not null default 'reserved'
        check (status in ('reserved', 'redeemed', 'released')),
    expires_at timestamptz not null,
    redeemed_at timestamptz,
    created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists coupon_reservations_active_lookup
    on public.coupon_reservations (coupon_id, expires_at)
    where status = 'reserved';

alter table public.coupon_reservations enable row level security;
revoke all on table public.coupon_reservations from anon, authenticated;
grant all on table public.coupon_reservations to service_role;

create or replace function public.reserve_coupon_for_checkout(
    p_code text,
    p_reservation_token uuid,
    p_expires_at timestamptz
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_coupon public.coupons%rowtype;
    v_active_reservations integer;
begin
    if p_reservation_token is null then
        raise exception 'reservation token is required';
    end if;

    if p_expires_at <= now()
       or p_expires_at > now() + interval '1 hour' then
        raise exception 'invalid reservation expiration';
    end if;

    select *
    into v_coupon
    from public.coupons
    where code = upper(trim(p_code))
      and is_active = true
    for update;

    if not found then
        return jsonb_build_object('valid', false, 'reason', 'invalid');
    end if;

    select count(*)
    into v_active_reservations
    from public.coupon_reservations
    where coupon_id = v_coupon.id
      and status = 'reserved'
      and expires_at > now();

    if v_coupon.usage_limit is not null
       and coalesce(v_coupon.used_count, 0) + v_active_reservations >= v_coupon.usage_limit then
        return jsonb_build_object('valid', false, 'reason', 'usage_limit');
    end if;

    insert into public.coupon_reservations (
        reservation_token,
        coupon_id,
        expires_at
    ) values (
        p_reservation_token,
        v_coupon.id,
        p_expires_at
    );

    return jsonb_build_object(
        'valid', true,
        'code', v_coupon.code,
        'discount_type', v_coupon.discount_type,
        'discount_value', v_coupon.discount_value
    );
end;
$$;

create or replace function public.release_coupon_reservation(
    p_reservation_token uuid
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_released_id uuid;
begin
    update public.coupon_reservations
    set status = 'released'
    where reservation_token = p_reservation_token
      and status = 'reserved'
    returning id into v_released_id;

    return v_released_id is not null;
end;
$$;

revoke all on function public.reserve_coupon_for_checkout(text, uuid, timestamptz) from public, anon, authenticated;
grant execute on function public.reserve_coupon_for_checkout(text, uuid, timestamptz) to service_role;

revoke all on function public.release_coupon_reservation(uuid) from public, anon, authenticated;
grant execute on function public.release_coupon_reservation(uuid) to service_role;

-- The service role already bypasses RLS, so the original helper does not need
-- creator privileges. Keep it available temporarily for sessions created by
-- the previously deployed webhook.
alter function public.create_paid_order_atomic(text, numeric, text, text, jsonb, jsonb)
    security invoker;

create or replace function public.create_paid_order_atomic_v2(
    p_payment_intent_id text,
    p_total_amount numeric,
    p_contact_email text,
    p_contact_phone text,
    p_shipping_address jsonb,
    p_items jsonb,
    p_coupon_code text,
    p_coupon_reservation_token uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_order_id uuid;
    v_item jsonb;
    v_product_id uuid;
    v_variant_id uuid;
    v_size text;
    v_quantity integer;
    v_price_at_purchase numeric;
    v_stock integer;
    v_is_made_to_order boolean;
    v_inventory_quantity integer;
    v_production_quantity integer;
    v_requires_production boolean := false;
    v_normalized_coupon_code text;
    v_coupon_id uuid;
    v_reservation_id uuid;
begin
    if nullif(trim(p_payment_intent_id), '') is null then
        raise exception 'payment reference is required';
    end if;

    if nullif(trim(p_contact_email), '') is null then
        raise exception 'contact email is required';
    end if;

    if p_total_amount is null or p_total_amount < 0 then
        raise exception 'total amount must be non-negative';
    end if;

    if p_items is null
       or jsonb_typeof(p_items) <> 'array'
       or jsonb_array_length(p_items) = 0 then
        raise exception 'at least one order item is required';
    end if;

    select id
    into v_order_id
    from public.orders
    where payment_intent_id = p_payment_intent_id;

    if found then
        return jsonb_build_object(
            'order_id', v_order_id,
            'created', false,
            'requires_production', exists (
                select 1
                from public.order_items
                where order_id = v_order_id
                  and production_quantity > 0
            )
        );
    end if;

    v_normalized_coupon_code := nullif(upper(trim(p_coupon_code)), '');

    begin
        insert into public.orders (
            status,
            total_amount,
            contact_email,
            contact_phone,
            shipping_address,
            payment_intent_id,
            coupon_code
        ) values (
            'paid',
            p_total_amount,
            p_contact_email,
            p_contact_phone,
            p_shipping_address,
            p_payment_intent_id,
            v_normalized_coupon_code
        )
        returning id into v_order_id;
    exception
        when unique_violation then
            select id
            into v_order_id
            from public.orders
            where payment_intent_id = p_payment_intent_id;

            if v_order_id is null then
                raise;
            end if;

            return jsonb_build_object(
                'order_id', v_order_id,
                'created', false,
                'requires_production', exists (
                    select 1
                    from public.order_items
                    where order_id = v_order_id
                      and production_quantity > 0
                )
            );
    end;

    for v_item in
        select value from jsonb_array_elements(p_items)
    loop
        v_product_id := (v_item ->> 'product_id')::uuid;
        v_size := nullif(trim(v_item ->> 'size'), '');
        v_quantity := (v_item ->> 'quantity')::integer;
        v_price_at_purchase := (v_item ->> 'price_at_purchase')::numeric;

        if v_size is null then
            raise exception 'item size is required';
        end if;

        if v_quantity is null or v_quantity <= 0 then
            raise exception 'item quantity must be positive';
        end if;

        if v_price_at_purchase is null or v_price_at_purchase < 0 then
            raise exception 'item price must be non-negative';
        end if;

        select
            variants.id,
            variants.stock,
            coalesce(products.is_made_to_order, false)
        into
            v_variant_id,
            v_stock,
            v_is_made_to_order
        from public.products
        join public.product_variants as variants
          on variants.product_id = products.id
        where products.id = v_product_id
          and variants.size = v_size
        for update of variants;

        if not found then
            raise exception 'product variant not found for product % and size %', v_product_id, v_size;
        end if;

        if v_is_made_to_order then
            v_inventory_quantity := 0;
            v_production_quantity := v_quantity;
        else
            v_inventory_quantity := least(greatest(v_stock, 0), v_quantity);
            v_production_quantity := v_quantity - v_inventory_quantity;

            update public.product_variants
            set stock = greatest(v_stock - v_inventory_quantity, 0)
            where id = v_variant_id;
        end if;

        v_requires_production := v_requires_production or v_production_quantity > 0;

        insert into public.order_items (
            order_id,
            product_id,
            quantity,
            size,
            price_at_purchase,
            inventory_quantity,
            production_quantity
        ) values (
            v_order_id,
            v_product_id,
            v_quantity,
            v_size,
            v_price_at_purchase,
            v_inventory_quantity,
            v_production_quantity
        );
    end loop;

    if v_normalized_coupon_code is not null then
        select id
        into v_coupon_id
        from public.coupons
        where code = v_normalized_coupon_code
        for update;

        if not found then
            raise exception 'coupon not found for paid order';
        end if;

        if p_coupon_reservation_token is not null then
            update public.coupon_reservations
            set status = 'redeemed',
                redeemed_at = now()
            where reservation_token = p_coupon_reservation_token
              and coupon_id = v_coupon_id
              and status = 'reserved'
            returning id into v_reservation_id;

            if v_reservation_id is null then
                raise exception 'coupon reservation not found for paid order';
            end if;
        end if;

        update public.coupons
        set used_count = coalesce(used_count, 0) + 1
        where id = v_coupon_id;
    elsif p_coupon_reservation_token is not null then
        raise exception 'coupon reservation provided without coupon code';
    end if;

    return jsonb_build_object(
        'order_id', v_order_id,
        'created', true,
        'requires_production', v_requires_production
    );
end;
$$;

revoke all on function public.create_paid_order_atomic_v2(text, numeric, text, text, jsonb, jsonb, text, uuid) from public, anon, authenticated;
grant execute on function public.create_paid_order_atomic_v2(text, numeric, text, text, jsonb, jsonb, text, uuid) to service_role;
