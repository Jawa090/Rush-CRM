-- Migration: Fix deals table structure
-- Date: 2026-03-27
-- Description: Updates deals table to support lead conversion and missing columns

DO $$ 
BEGIN
  -- Add user_id column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='user_id') THEN
    ALTER TABLE deals ADD COLUMN user_id UUID NOT NULL DEFAULT gen_random_uuid();
  END IF;

  -- Add pipeline column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='pipeline') THEN
    ALTER TABLE deals ADD COLUMN pipeline TEXT DEFAULT 'default';
  END IF;

  -- Add notes column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='notes') THEN
    ALTER TABLE deals ADD COLUMN notes TEXT;
  END IF;

  -- Add tags column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='tags') THEN
    ALTER TABLE deals ADD COLUMN tags TEXT[];
  END IF;

  -- Add assigned_to column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='assigned_to') THEN
    ALTER TABLE deals ADD COLUMN assigned_to UUID;
  END IF;

  -- Add won_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='won_at') THEN
    ALTER TABLE deals ADD COLUMN won_at TIMESTAMPTZ;
  END IF;

  -- Add lost_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='lost_at') THEN
    ALTER TABLE deals ADD COLUMN lost_at TIMESTAMPTZ;
  END IF;

  -- Add lost_reason column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='lost_reason') THEN
    ALTER TABLE deals ADD COLUMN lost_reason TEXT;
  END IF;

  -- Update probability default to 0 instead of 50
  ALTER TABLE deals ALTER COLUMN probability SET DEFAULT 0;

  -- Update stage default to 'qualification' instead of 'new'
  ALTER TABLE deals ALTER COLUMN stage SET DEFAULT 'qualification';

  -- Make sure org_id is NOT NULL
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='deals' AND column_name='org_id' AND is_nullable='YES') THEN
    ALTER TABLE deals ALTER COLUMN org_id SET NOT NULL;
  END IF;

  -- Update created_at and updated_at to use timestamptz
  ALTER TABLE deals ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';
  ALTER TABLE deals ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';
  
  -- Set proper defaults for timestamps
  ALTER TABLE deals ALTER COLUMN created_at SET DEFAULT now();
  ALTER TABLE deals ALTER COLUMN updated_at SET DEFAULT now();

END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deals_converted_from_lead ON deals(converted_from_lead_id);
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close ON deals(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline ON deals(pipeline);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_deals_updated_at_trigger ON deals;
CREATE TRIGGER update_deals_updated_at_trigger
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_deals_updated_at();