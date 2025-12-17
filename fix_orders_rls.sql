-- PERMITIR QUE EL ADMIN VEA LOS PEDIDOS
create policy "Admin View Orders" on public.orders 
for select using (auth.role() = 'authenticated');

-- PERMITIR QUE EL ADMIN VEA LOS ITEMS DEL PEDIDO
create policy "Admin View Items" on public.order_items 
for select using (auth.role() = 'authenticated');
