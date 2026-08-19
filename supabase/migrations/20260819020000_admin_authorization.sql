-- Explicit administrator allowlist and RLS policies.
-- Customers remain anonymous and can only read the public catalog and active
-- coupons. The Stripe webhook continues to use service_role, which bypasses RLS.

create table if not exists public.admin_users (
    user_id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.admin_users enable row level security;

revoke all on table public.admin_users from anon;
revoke all on table public.admin_users from authenticated;
grant select on table public.admin_users to authenticated;

-- This project currently has exactly one Auth user. Seed it safely, and fail
-- closed instead of guessing if that assumption changes before deployment.
do $$
declare
    v_auth_user_count integer;
begin
    if not exists (select 1 from public.admin_users) then
        select count(*) into v_auth_user_count from auth.users;

        if v_auth_user_count <> 1 then
            raise exception 'Expected exactly one Auth user when seeding admin_users, found %', v_auth_user_count;
        end if;

        insert into public.admin_users (user_id)
        select id from auth.users;
    end if;
end
$$;

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from public.admin_users
        where user_id = (select auth.uid())
    );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

create policy "Users can read own admin membership"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

-- Replace legacy policies that treated every authenticated account as admin.
do $$
declare
    v_policy record;
begin
    for v_policy in
        select schemaname, tablename, policyname
        from pg_policies
        where schemaname = 'public'
          and tablename = any (array[
              'products',
              'product_variants',
              'orders',
              'order_items',
              'coupons'
          ])
    loop
        execute format(
            'drop policy if exists %I on %I.%I',
            v_policy.policyname,
            v_policy.schemaname,
            v_policy.tablename
        );
    end loop;
end
$$;

alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupons enable row level security;

create policy "Public can read products"
on public.products
for select
to anon, authenticated
using (true);

create policy "Admins can manage products"
on public.products
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Public can read product variants"
on public.product_variants
for select
to anon, authenticated
using (true);

create policy "Admins can manage product variants"
on public.product_variants
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins can manage orders"
on public.orders
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins can manage order items"
on public.order_items
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Public can read active coupons"
on public.coupons
for select
to anon, authenticated
using (is_active = true);

create policy "Admins can manage coupons"
on public.coupons
for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

-- This project has one public bucket. Public image reads remain available,
-- while all mutations require membership in admin_users.
do $$
declare
    v_policy record;
begin
    for v_policy in
        select policyname
        from pg_policies
        where schemaname = 'storage'
          and tablename = 'objects'
    loop
        execute format(
            'drop policy if exists %I on storage.objects',
            v_policy.policyname
        );
    end loop;
end
$$;

create policy "Public can read product images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

create policy "Admins can upload product images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images' and (select private.is_admin()));

create policy "Admins can update product images"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images' and (select private.is_admin()))
with check (bucket_id = 'product-images' and (select private.is_admin()));

create policy "Admins can delete product images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images' and (select private.is_admin()));
