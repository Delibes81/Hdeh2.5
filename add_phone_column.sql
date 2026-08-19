-- Add phone number column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS contact_phone text;
