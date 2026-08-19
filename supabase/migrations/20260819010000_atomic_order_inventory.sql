-- Keep physical inventory non-negative and record how much of each paid item
-- must be manufactured. The webhook calls the function below once per payment,
-- so the order, its items, and all stock changes commit or roll back together.

alter table public.order_items
    add column if not exists inventory_quantity integer not null default 0,
    add column if not exists production_quantity integer not null default 0;

do $$
begin
    alter table public.order_items
        add constraint order_items_inventory_quantity_nonnegative
        check (inventory_quantity >= 0);
exception
    when duplicate_object then null;
end
$$;

do $$
begin
    alter table public.order_items
        add constraint order_items_production_quantity_nonnegative
        check (production_quantity >= 0);
exception
    when duplicate_object then null;
end
$$;

-- Existing orders predate production tracking. Treat their full quantity as
-- inventory fulfillment so the new consistency constraint remains truthful.
update public.order_items
set inventory_quantity = quantity
where inventory_quantity = 0
  and production_quantity = 0
  and quantity > 0;

do $$
begin
    alter table public.order_items
        add constraint order_items_fulfillment_quantity_matches
        check (inventory_quantity + production_quantity = quantity);
exception
    when duplicate_object then null;
end
$$;

do $$
begin
    alter table public.product_variants
        add constraint product_variants_stock_nonnegative
        check (stock >= 0);
exception
    when duplicate_object then null;
end
$$;

create unique index if not exists orders_payment_intent_id_unique
    on public.orders (payment_intent_id)
    where payment_intent_id is not null;

create or replace function public.create_paid_order_atomic(
    p_payment_intent_id text,
    p_total_amount numeric,
    p_contact_email text,
    p_contact_phone text,
    p_shipping_address jsonb,
    p_items jsonb
)
returns jsonb
language plpgsql
security definer
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

    begin
        insert into public.orders (
            status,
            total_amount,
            contact_email,
            contact_phone,
            shipping_address,
            payment_intent_id
        ) values (
            'paid',
            p_total_amount,
            p_contact_email,
            p_contact_phone,
            p_shipping_address,
            p_payment_intent_id
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

    return jsonb_build_object(
        'order_id', v_order_id,
        'created', true,
        'requires_production', v_requires_production
    );
end;
$$;

revoke all on function public.create_paid_order_atomic(text, numeric, text, text, jsonb, jsonb) from public;
revoke all on function public.create_paid_order_atomic(text, numeric, text, text, jsonb, jsonb) from anon;
revoke all on function public.create_paid_order_atomic(text, numeric, text, text, jsonb, jsonb) from authenticated;
grant execute on function public.create_paid_order_atomic(text, numeric, text, text, jsonb, jsonb) to service_role;
