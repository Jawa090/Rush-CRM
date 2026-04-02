-- Migration: 028_add_company_name_to_contacts.sql
-- Description: Adds company_name string column to contacts table for raw string storage.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'company_name') THEN
        ALTER TABLE public.contacts ADD COLUMN company_name VARCHAR(255);
    END IF;
END $$;
