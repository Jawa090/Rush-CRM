-- Migration: 025_add_industry_to_customers.sql
-- Description: Adds industry column to customers table.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'industry') THEN
        ALTER TABLE public.customers ADD COLUMN industry VARCHAR(255);
    END IF;
END $$;
