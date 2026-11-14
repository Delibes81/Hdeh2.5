-- Promociones por modelo: una promoción puede aplicar a toda la tienda o solo a
-- algunos productos. Ejecutar en Supabase → SQL Editor (después de promotions.sql).
-- Las promociones que ya existen quedan como "toda la tienda".

-- 1. A qué aplica cada promoción: 'all' = toda la tienda, 'selected' = modelos elegidos
alter table public.promotions
    add column if not exists applies_to text not null default 'all';

do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'promotions_applies_to_check'
    ) then
        alter table public.promotions
            add constraint promotions_applies_to_check check (applies_to in ('all', 'selected'));
    end if;
end $$;

-- 2. Modelos de cada promoción. Se crea con el mismo tipo de ID que la tabla products.
do $$
declare
    product_id_type text;
begin
    select format_type(a.atttypid, a.atttypmod)
      into product_id_type
      from pg_attribute a
     where a.attrelid = 'public.products'::regclass
       and a.attname = 'id';

    execute format(
        'create table if not exists public.promotion_products (
            promotion_id uuid not null references public.promotions(id) on delete cascade,
            product_id %s not null references public.products(id) on delete cascade,
            primary key (promotion_id, product_id)
        )',
        product_id_type
    );
end $$;

alter table public.promotion_products enable row level security;

-- Cualquiera puede leer qué modelos tienen descuento (los precios son públicos)
drop policy if exists "Public can read promotion products" on public.promotion_products;
create policy "Public can read promotion products" on public.promotion_products
    for select using (true);

-- Solo usuarios con sesión (admin) pueden cambiarlo
drop policy if exists "Admins can manage promotion products" on public.promotion_products;
create policy "Admins can manage promotion products" on public.promotion_products
    for all to authenticated using (true) with check (true);
