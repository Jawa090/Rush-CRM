-- =====================================================
-- Migration: Create Remaining Missing Tables
-- Description: Pipeline stages, stock adjustments, unibox emails
-- Date: 2026-04-02
-- =====================================================

-- Pipeline Stages Table
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  pipeline VARCHAR(100) DEFAULT 'default',
  stage_key VARCHAR(100) NOT NULL,
  stage_label VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  color VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, pipeline, stage_key)
);

-- Stock Adjustments Table
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  product_id UUID NOT NULL,
  warehouse_id UUID NOT NULL,
  adjustment_type VARCHAR(50) NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_adjusted INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reason TEXT,
  notes TEXT,
  adjusted_by UUID,
  adjustment_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unibox Emails Table
CREATE TABLE IF NOT EXISTS unibox_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  external_id VARCHAR(255),
  sender_email VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255),
  recipient_email VARCHAR(255),
  recipient_name VARCHAR(255),
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  status VARCHAR(50) DEFAULT 'New',
  priority VARCHAR(50) DEFAULT 'Normal',
  received_at TIMESTAMPTZ,
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  assigned_to UUID,
  converted_to_lead_id UUID,
  tags TEXT[],
  attachments JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_org ON pipeline_stages(org_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_org ON stock_adjustments(org_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_product ON stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_org ON unibox_emails(org_id);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_status ON unibox_emails(status);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_sender ON unibox_emails(sender_email);

-- =====================================================
-- End of Migration
-- =====================================================
