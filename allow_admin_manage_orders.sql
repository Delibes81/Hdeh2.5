-- Allow Admins to UPDATE and DELETE orders
CREATE POLICY "Enable update for authenticated users only" ON "public"."orders"
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only" ON "public"."orders"
FOR DELETE TO authenticated USING (true);
