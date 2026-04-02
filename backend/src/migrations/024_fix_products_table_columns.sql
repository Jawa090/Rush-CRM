-- Fix Products Table - Add Missing Columns
-- This migration adds columns that should exist but may be missing

-- Add unit_price column if missing
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2) DEFAULT 0;

-- Add cost_price column if missing
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2) DEFAULT 0;

-- Add reorder_level column if missing
ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 10;

-- Add reorder_quantity column if missing
ALTER TABLE products ADD COLUMN IF NOT EXISTS reorder_quantity INTEGER DEFAULT 50;

-- Add barcode column if missing
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode VARCHAR(100);

-- Add image_url column if missing
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_reorder_level ON products(reorder_level);
