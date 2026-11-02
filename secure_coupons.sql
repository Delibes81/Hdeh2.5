-- Cupones: validar sin exponer la tabla y contar usos de forma atómica.
-- Ejecutar en Supabase → SQL Editor ANTES de publicar el código que usa estas funciones.

-- 1. Validar un cupón por código (devuelve solo ese cupón si está activo)
create or replace function public.validate_coupon(p_code text)
returns table (
    id uuid,
    code text,
    discount_type text,
    discount_value numeric,
    is_active boolean,
    usage_limit integer,
    used_count integer
)
language sql
stable
security definer
set search_path = public
as $$
    select c.id, c.code, c.discount_type, c.discount_value, c.is_active, c.usage_limit, c.used_count
    from public.coupons c
    where c.code = upper(trim(p_code))
      and c.is_active = true
    limit 1;
$$;

revoke all on function public.validate_coupon(text) from public;
grant execute on function public.validate_coupon(text) to anon, authenticated;

-- 2. Sumar un uso al cupón (solo lo puede llamar el webhook con la service role key)
create or replace function public.increment_coupon_usage(p_code text)
returns void
language sql
security definer
set search_path = public
as $$
    update public.coupons
    set used_count = coalesce(used_count, 0) + 1
    where code = upper(trim(p_code));
$$;

revoke all on function public.increment_coupon_usage(text) from public, anon, authenticated;
grant execute on function public.increment_coupon_usage(text) to service_role;

-- 3. Quitar la lectura pública de la tabla de cupones
drop policy if exists "Public can read active coupons" on public.coupons;
