-- Complete Marketing Module
-- Campaigns, Lists, Segments, Forms, Sequences, Analytics

-- Update marketing_campaigns table
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'email';
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS subject VARCHAR(255);
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS list_id UUID;
ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS segment_id UUID;

-- Update marketing_lists table
ALTER TABLE marketing_lists ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Create segments table
CREATE TABLE IF NOT EXISTS marketing_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL,
  member_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update marketing_list_members table
ALTER TABLE marketing_list_members ADD COLUMN IF NOT EXISTS org_id UUID;
ALTER TABLE marketing_list_members ADD COLUMN IF NOT EXISTS contact_id UUID;

-- Update marketing_forms table
ALTER TABLE marketing_forms ADD COLUMN IF NOT EXISTS embed_code TEXT;
ALTER TABLE marketing_forms ADD COLUMN IF NOT EXISTS thank_you_message TEXT;
ALTER TABLE marketing_forms ADD COLUMN IF NOT EXISTS auto_add_to_list UUID;

-- Create sequences table
CREATE TABLE IF NOT EXISTS marketing_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) DEFAULT 'manual',
  trigger_conditions JSONB,
  steps JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  enrollment_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Create sequence enrollments table
CREATE TABLE IF NOT EXISTS marketing_sequence_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL,
  contact_id UUID NOT NULL,
  current_step INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(sequence_id, contact_id)
);

-- Update campaign events table
ALTER TABLE marketing_campaign_events ADD COLUMN IF NOT EXISTS contact_id UUID;
ALTER TABLE marketing_campaign_events ADD COLUMN IF NOT EXISTS opened_count INTEGER DEFAULT 0;
ALTER TABLE marketing_campaign_events ADD COLUMN IF NOT EXISTS clicked_count INTEGER DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_segments_org ON marketing_segments(org_id);
CREATE INDEX IF NOT EXISTS idx_sequences_org ON marketing_sequences(org_id);
CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_sequence ON marketing_sequence_enrollments(sequence_id);
CREATE INDEX IF NOT EXISTS idx_sequence_enrollments_contact ON marketing_sequence_enrollments(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_events_contact ON marketing_campaign_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_list_members_list ON marketing_list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_list_members_contact ON marketing_list_members(contact_id);
