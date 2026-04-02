-- Migration: Add all lead fields to deals table for complete conversion
-- Description: Ensures no data loss when converting a lead to a deal

DO $$ 
BEGIN
  -- Add missing columns to deals table to match leads table
  
  -- Designation
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='designation') THEN
    ALTER TABLE deals ADD COLUMN designation TEXT;
  END IF;

  -- Website
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='website') THEN
    ALTER TABLE deals ADD COLUMN website TEXT;
  END IF;

  -- Address
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='address') THEN
    ALTER TABLE deals ADD COLUMN address TEXT;
  END IF;

  -- Company Phone
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='company_phone') THEN
    ALTER TABLE deals ADD COLUMN company_phone TEXT;
  END IF;

  -- Company Email
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='company_email') THEN
    ALTER TABLE deals ADD COLUMN company_email TEXT;
  END IF;

  -- Company Size
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='company_size') THEN
    ALTER TABLE deals ADD COLUMN company_size TEXT;
  END IF;

  -- Agent Name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='agent_name') THEN
    ALTER TABLE deals ADD COLUMN agent_name TEXT;
  END IF;

  -- Decision Maker
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='decision_maker') THEN
    ALTER TABLE deals ADD COLUMN decision_maker TEXT;
  END IF;

  -- Service Interested
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='service_interested') THEN
    ALTER TABLE deals ADD COLUMN service_interested TEXT;
  END IF;

  -- Interaction Notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='interaction_notes') THEN
    ALTER TABLE deals ADD COLUMN interaction_notes TEXT;
  END IF;

  -- First Message
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='first_message') THEN
    ALTER TABLE deals ADD COLUMN first_message TEXT;
  END IF;

  -- Last Touch
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='last_touch') THEN
    ALTER TABLE deals ADD COLUMN last_touch TIMESTAMPTZ;
  END IF;

  -- External Source ID
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='external_source_id') THEN
    ALTER TABLE deals ADD COLUMN external_source_id TEXT;
  END IF;

  -- Workspace ID
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='workspace_id') THEN
    ALTER TABLE deals ADD COLUMN workspace_id UUID REFERENCES workgroups(id) ON DELETE SET NULL;
  END IF;

  -- Source Info
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='source_info') THEN
    ALTER TABLE deals ADD COLUMN source_info TEXT;
  END IF;

  -- Phone Type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='phone_type') THEN
    ALTER TABLE deals ADD COLUMN phone_type TEXT DEFAULT 'work';
  END IF;

  -- Email Type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='email_type') THEN
    ALTER TABLE deals ADD COLUMN email_type TEXT DEFAULT 'work';
  END IF;

  -- Website Type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='website_type') THEN
    ALTER TABLE deals ADD COLUMN website_type TEXT DEFAULT 'corporate';
  END IF;

  -- Customer Type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='customer_type') THEN
    ALTER TABLE deals ADD COLUMN customer_type TEXT;
  END IF;

  -- Last Contacted Date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='last_contacted_date') THEN
    ALTER TABLE deals ADD COLUMN last_contacted_date DATE;
  END IF;

  -- Next Follow Up Date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='next_follow_up_date') THEN
    ALTER TABLE deals ADD COLUMN next_follow_up_date DATE;
  END IF;

  -- Responsible Person
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='responsible_person') THEN
    ALTER TABLE deals ADD COLUMN responsible_person UUID;
  END IF;

  -- Converted From Lead ID (if it was missed in earlier migrations)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='converted_from_lead_id') THEN
    ALTER TABLE deals ADD COLUMN converted_from_lead_id UUID REFERENCES leads(id) ON DELETE SET NULL;
  END IF;

END $$;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_deals_workspace_id ON deals(workspace_id);
CREATE INDEX IF NOT EXISTS idx_deals_external_source ON deals(external_source_id);
CREATE INDEX IF NOT EXISTS idx_deals_service_interested ON deals(service_interested);
CREATE INDEX IF NOT EXISTS idx_deals_agent_name ON deals(agent_name);
