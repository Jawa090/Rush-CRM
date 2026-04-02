-- Complete marketing system tables

-- Create marketing_sequences table
CREATE TABLE IF NOT EXISTS marketing_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  trigger_type VARCHAR(50) DEFAULT 'manual',
  steps JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  enrollment_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create marketing_list_members table
CREATE TABLE IF NOT EXISTS marketing_list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL,
  member_id UUID,
  email VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create marketing_campaign_events table
CREATE TABLE IF NOT EXISTS marketing_campaign_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255),
  subject VARCHAR(255),
  content TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create marketing_form_submissions table
CREATE TABLE IF NOT EXISTS marketing_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL,
  submission_data JSONB NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create marketing_analytics table for tracking
CREATE TABLE IF NOT EXISTS marketing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'campaign', 'form', 'sequence'
  entity_id UUID NOT NULL,
  metric_name VARCHAR(100) NOT NULL, -- 'opens', 'clicks', 'conversions', etc.
  metric_value INTEGER DEFAULT 0,
  date_recorded DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fix marketing_campaigns table structure
ALTER TABLE marketing_campaigns 
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS list_id UUID,
ADD COLUMN IF NOT EXISTS email_subject VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_content TEXT,
ADD COLUMN IF NOT EXISTS sent_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS opened_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicked_count INTEGER DEFAULT 0;

-- Fix marketing_lists table structure  
ALTER TABLE marketing_lists
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Fix marketing_forms table structure
ALTER TABLE marketing_forms
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS submission_count INTEGER DEFAULT 0;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_org_id ON marketing_campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_lists_org_id ON marketing_lists(org_id);
CREATE INDEX IF NOT EXISTS idx_marketing_forms_org_id ON marketing_forms(org_id);
CREATE INDEX IF NOT EXISTS idx_marketing_sequences_org_id ON marketing_sequences(org_id);
CREATE INDEX IF NOT EXISTS idx_marketing_list_members_list_id ON marketing_list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaign_events_campaign_id ON marketing_campaign_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_marketing_analytics_org_entity ON marketing_analytics(org_id, entity_type, entity_id);