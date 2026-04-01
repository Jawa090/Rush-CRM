-- Migration: Add marketing lead fields
-- Description: Add first_message and last_touch fields for marketing team requirements

-- Add missing marketing fields to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS first_message TEXT,
ADD COLUMN IF NOT EXISTS last_touch TIMESTAMPTZ;

-- Update last_touch to use last_contacted_date if it exists
UPDATE public.leads 
SET last_touch = last_contacted_date 
WHERE last_contacted_date IS NOT NULL AND last_touch IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_last_touch ON public.leads(last_touch);
CREATE INDEX IF NOT EXISTS idx_leads_agent_name ON public.leads(agent_name);

-- Add comments for documentation
COMMENT ON COLUMN public.leads.first_message IS 'Initial message or inquiry from the lead';
COMMENT ON COLUMN public.leads.last_touch IS 'Last interaction timestamp with the lead';