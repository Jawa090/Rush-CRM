-- Migration: Fix leads table structure
-- Date: 2026-03-27
-- Description: Updates leads table to match the expected schema with all required columns

DO $$ 
BEGIN
  -- Add missing columns to leads table if they don't exist
  
  -- Add user_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='user_id') THEN
    ALTER TABLE leads ADD COLUMN user_id UUID NOT NULL DEFAULT gen_random_uuid();
  END IF;

  -- Add contact_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='contact_id') THEN
    ALTER TABLE leads ADD COLUMN contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
  END IF;

  -- Add company_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='company_id') THEN
    ALTER TABLE leads ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
  END IF;

  -- Add priority column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='priority') THEN
    ALTER TABLE leads ADD COLUMN priority TEXT DEFAULT 'medium';
  END IF;

  -- Add pipeline column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='pipeline') THEN
    ALTER TABLE leads ADD COLUMN pipeline TEXT DEFAULT 'default';
  END IF;

  -- Add notes column (rename from description if exists)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='notes') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='leads' AND column_name='description') THEN
      ALTER TABLE leads RENAME COLUMN description TO notes;
    ELSE
      ALTER TABLE leads ADD COLUMN notes TEXT;
    END IF;
  END IF;

  -- Add tags column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='tags') THEN
    ALTER TABLE leads ADD COLUMN tags TEXT[];
  END IF;

  -- Add assigned_to column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='assigned_to') THEN
    ALTER TABLE leads ADD COLUMN assigned_to UUID;
  END IF;

  -- Add expected_close_date column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='expected_close_date') THEN
    ALTER TABLE leads ADD COLUMN expected_close_date DATE;
  END IF;

  -- Add customer_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='customer_type') THEN
    ALTER TABLE leads ADD COLUMN customer_type TEXT;
  END IF;

  -- Add designation column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='designation') THEN
    ALTER TABLE leads ADD COLUMN designation TEXT;
  END IF;

  -- Add phone_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='phone_type') THEN
    ALTER TABLE leads ADD COLUMN phone_type TEXT DEFAULT 'work';
  END IF;

  -- Add email_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='email_type') THEN
    ALTER TABLE leads ADD COLUMN email_type TEXT DEFAULT 'work';
  END IF;

  -- Add website column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='website') THEN
    ALTER TABLE leads ADD COLUMN website TEXT;
  END IF;

  -- Add website_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='website_type') THEN
    ALTER TABLE leads ADD COLUMN website_type TEXT DEFAULT 'corporate';
  END IF;

  -- Add address column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='address') THEN
    ALTER TABLE leads ADD COLUMN address TEXT;
  END IF;

  -- Add company_name column (rename from company if exists)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='company_name') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='leads' AND column_name='company') THEN
      ALTER TABLE leads RENAME COLUMN company TO company_name;
    ELSE
      ALTER TABLE leads ADD COLUMN company_name TEXT;
    END IF;
  END IF;

  -- Add company_phone column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='company_phone') THEN
    ALTER TABLE leads ADD COLUMN company_phone TEXT;
  END IF;

  -- Add company_email column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='company_email') THEN
    ALTER TABLE leads ADD COLUMN company_email TEXT;
  END IF;

  -- Add last_contacted_date column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='last_contacted_date') THEN
    ALTER TABLE leads ADD COLUMN last_contacted_date DATE;
  END IF;

  -- Add next_follow_up_date column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='next_follow_up_date') THEN
    ALTER TABLE leads ADD COLUMN next_follow_up_date DATE;
  END IF;

  -- Add interaction_notes column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='interaction_notes') THEN
    ALTER TABLE leads ADD COLUMN interaction_notes TEXT;
  END IF;

  -- Add service_interested column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='service_interested') THEN
    ALTER TABLE leads ADD COLUMN service_interested TEXT;
  END IF;

  -- Add company_size column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='company_size') THEN
    ALTER TABLE leads ADD COLUMN company_size TEXT;
  END IF;

  -- Add decision_maker column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='decision_maker') THEN
    ALTER TABLE leads ADD COLUMN decision_maker TEXT;
  END IF;

  -- Add source_info column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='source_info') THEN
    ALTER TABLE leads ADD COLUMN source_info TEXT;
  END IF;

  -- Add agent_name column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='agent_name') THEN
    ALTER TABLE leads ADD COLUMN agent_name TEXT;
  END IF;

  -- Add responsible_person column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='responsible_person') THEN
    ALTER TABLE leads ADD COLUMN responsible_person UUID;
  END IF;

  -- Update data types and defaults for existing columns
  
  -- Make sure org_id is NOT NULL and has proper reference
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='leads' AND column_name='org_id' AND is_nullable='YES') THEN
    ALTER TABLE leads ALTER COLUMN org_id SET NOT NULL;
  END IF;

  -- Update status default
  ALTER TABLE leads ALTER COLUMN status SET DEFAULT 'new';

  -- Update created_at and updated_at to use timestamptz
  ALTER TABLE leads ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';
  ALTER TABLE leads ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';
  
  -- Set proper defaults for timestamps
  ALTER TABLE leads ALTER COLUMN created_at SET DEFAULT now();
  ALTER TABLE leads ALTER COLUMN updated_at SET DEFAULT now();

END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline ON leads(pipeline);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_contact_id ON leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads(company_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_leads_updated_at_trigger ON leads;
CREATE TRIGGER update_leads_updated_at_trigger
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_leads_updated_at();