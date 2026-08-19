-- Add featured_order column to products table
ALTER TABLE products 
ADD COLUMN featured_order INTEGER DEFAULT 0;
