-- Migration: 027_fix_contacts_schema_v2.sql
-- Description: Adds missing columns for contacts table from the creation form.

DO $$ 
BEGIN
    -- Add source if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'source') THEN
        ALTER TABLE public.contacts ADD COLUMN source VARCHAR(100);
    END IF;

    -- Add address if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'address') THEN
        ALTER TABLE public.contacts ADD COLUMN address TEXT;
    END IF;

    -- Add messenger if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'messenger') THEN
        ALTER TABLE public.contacts ADD COLUMN messenger VARCHAR(255);
    END IF;

    -- Add available_to_everyone if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'available_to_everyone') THEN
        ALTER TABLE public.contacts ADD COLUMN available_to_everyone BOOLEAN DEFAULT true;
    END IF;

    -- Add included_in_export if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'included_in_export') THEN
        ALTER TABLE public.contacts ADD COLUMN included_in_export BOOLEAN DEFAULT true;
    END IF;

    -- Add position if missing (alias for title)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'position') THEN
        ALTER TABLE public.contacts ADD COLUMN position VARCHAR(255);
    END IF;
END $$;
