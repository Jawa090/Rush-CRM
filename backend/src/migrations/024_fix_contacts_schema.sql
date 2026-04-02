-- Migration: 024_fix_contacts_schema.sql
-- Description: Adds missing columns to contacts table for CRM functionality.

DO $$ 
BEGIN
    -- Add position column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'position') THEN
        ALTER TABLE public.contacts ADD COLUMN position VARCHAR(255);
    END IF;

    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'notes') THEN
        ALTER TABLE public.contacts ADD COLUMN notes TEXT;
    END IF;

    -- Add tags column if it doesn't exist (using TEXT array)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'tags') THEN
        ALTER TABLE public.contacts ADD COLUMN tags TEXT[];
    END IF;

    -- Add contact_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'contact_type') THEN
        ALTER TABLE public.contacts ADD COLUMN contact_type VARCHAR(50) DEFAULT 'contact';
    END IF;

    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'created_by') THEN
        ALTER TABLE public.contacts ADD COLUMN created_by UUID REFERENCES public.users(id);
    END IF;

    -- Ensure updated_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'updated_at') THEN
        ALTER TABLE public.contacts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;
