-- Promociones de toda la tienda (descuento por porcentaje con fecha de inicio y fin).
-- La página y la función de pago de Stripe (create-checkout-session) leen esta tabla,
-- así el precio mostrado y el cobrado salen del mismo lugar.
-- Ejecutar en Supabase → SQL Editor.

create table if not exists public.promotions (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    discount_percent numeric not null check (discount_percent > 0 and discount_percent < 100),
    banner_text text,
    starts_at timestamptz not null default now(),
    ends_at timestamptz,
    is_active boolean not null default true,
    allow_coupons boolean not null default false,
    created_at timestamptz not null default now()
);

alter table public.promotions enable row level security;

-- Cualquiera puede leer las promociones (los precios rebajados son públicos)
drop policy if exists "Public can read promotions" on public.promotions;
create policy "Public can read promotions" on public.promotions
    for select using (true);

-- Solo usuarios con sesión (admin) pueden crear o cambiar promociones
drop policy if exists "Admins can manage promotions" on public.promotions;
create policy "Admins can manage promotions" on public.promotions
    for all to authenticated using (true) with check (true);

-- Promoción de noviembre 2026: 20% en toda la tienda, sin cupones,
-- hasta el miércoles 18 de noviembre a las 23:59 (hora de CDMX, UTC-6)
insert into public.promotions (name, discount_percent, banner_text, starts_at, ends_at, allow_coupons)
values (
    'Descuento noviembre 2026',
    20,
    '20% de descuento en toda la tienda · Hasta el miércoles 18 de noviembre',
    now(),
    '2026-11-18 23:59:59-06',
    false
);

-- Para apagarla antes de tiempo:
--   update public.promotions set is_active = false where name = 'Descuento noviembre 2026';
