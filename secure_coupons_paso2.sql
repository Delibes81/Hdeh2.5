-- PASO 2. Ejecutar en Supabase → SQL Editor DESPUÉS de que Vercel publique el código nuevo
-- (el carrito ya valida con validate_coupon). Quita la lectura pública de la tabla de cupones.
drop policy if exists "Public can read active coupons" on public.coupons;
