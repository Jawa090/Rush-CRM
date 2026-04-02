-- Migration: Add marketing and contact fields to deals table
-- Description: Add contact_name, company_name, phone, email, priority, source fields for deal management

-- Add missing fields to deals table
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deals_contact_name ON public.deals(contact_name);
CREATE INDEX IF NOT EXISTS idx_deals_company_name ON public.deals(company_name);
CREATE INDEX IF NOT EXISTS idx_deals_email ON public.deals(email);
CREATE INDEX IF NOT EXISTS idx_deals_priority ON public.deals(priority);
CREATE INDEX IF NOT EXISTS idx_deals_source ON public.deals(source);

-- Add comments for documentation
COMMENT ON COLUMN public.deals.contact_name IS 'Name of the primary contact person';
COMMENT ON COLUMN public.deals.company_name IS 'Name of the company';
COMMENT ON COLUMN public.deals.phone IS 'Contact phone number';
COMMENT ON COLUMN public.deals.email IS 'Contact email address';
COMMENT ON COLUMN public.deals.priority IS 'Deal priority: low, medium, high, urgent';
COMMENT ON COLUMN public.deals.source IS 'Lead source: website, referral, linkedin, etc.';
COMMENT ON COLUMN public.deals.description IS 'Detailed description of the deal';