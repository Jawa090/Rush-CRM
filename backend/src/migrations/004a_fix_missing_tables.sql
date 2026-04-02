-- Migration: Fix missing core tables for HRMS and Unibox
-- Created: 2024-03-31

-- Create products table if it doesn't exist (needed for HRMS and Inventory)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100),
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(12,2) DEFAULT 0,
  cost DECIMAL(12,2) DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'piece',
  min_stock_level INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  valuation_method VARCHAR(20) DEFAULT 'FIFO',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create unibox_emails table if it doesn't exist (needed for Unibox)
CREATE TABLE IF NOT EXISTS unibox_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  external_id VARCHAR(255),
  sender_email VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255),
  subject VARCHAR(500),
  body TEXT,
  status VARCHAR(50) DEFAULT 'Lead',
  received_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_org_id ON products(org_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_org_id_base ON unibox_emails(org_id);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_external_id ON unibox_emails(external_id);
