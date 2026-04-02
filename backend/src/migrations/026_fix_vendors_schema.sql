-- Migration: 026_fix_vendors_schema.sql
-- Description: Adds created_by and ensures correct schema for vendors table.

DO $$ 
BEGIN
    -- Ensure vendors table exists with basic columns first
    CREATE TABLE IF NOT EXISTS public.vendors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        contact_person VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add created_by if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'created_by') THEN
        ALTER TABLE public.vendors ADD COLUMN created_by UUID REFERENCES users(id);
    END IF;

    -- Add notes if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'notes') THEN
        ALTER TABLE public.vendors ADD COLUMN notes TEXT;
    END IF;
END $$;
