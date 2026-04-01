-- Migration: Fix Critical CRM Issues
-- Date: 2026-03-31
-- Description: Fixes missing tables and columns for proper CRM functionality

DO $$ 
BEGIN
  -- Create deal_contacts table if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='deal_contacts') THEN
    CREATE TABLE deal_contacts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      role VARCHAR(100),
      primary_contact BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(org_id, deal_id, contact_id)
    );
    
    CREATE INDEX idx_deal_contacts_org ON deal_contacts(org_id);
    CREATE INDEX idx_deal_contacts_deal ON deal_contacts(deal_id);
    CREATE INDEX idx_deal_contacts_contact ON deal_contacts(contact_id);
  END IF;

  -- Create deal_signing_parties table if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='deal_signing_parties') THEN
    CREATE TABLE deal_signing_parties (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      role VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(org_id, deal_id, contact_id)
    );
    
    CREATE INDEX idx_deal_signing_parties_org ON deal_signing_parties(org_id);
    CREATE INDEX idx_deal_signing_parties_deal ON deal_signing_parties(deal_id);
    CREATE INDEX idx_deal_signing_parties_contact ON deal_signing_parties(contact_id);
  END IF;

  -- Add missing conversion fields to customers table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='customers' AND column_name='converted_from_lead_id') THEN
    ALTER TABLE customers ADD COLUMN converted_from_lead_id UUID REFERENCES leads(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='customers' AND column_name='converted_from_deal_id') THEN
    ALTER TABLE customers ADD COLUMN converted_from_deal_id UUID REFERENCES deals(id);
  END IF;

  -- Add conversion tracking fields to leads if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='converted_to_deal_id') THEN
    ALTER TABLE leads ADD COLUMN converted_to_deal_id UUID REFERENCES deals(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='converted_at') THEN
    ALTER TABLE leads ADD COLUMN converted_at TIMESTAMP;
  END IF;

  -- Add conversion tracking fields to deals if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='converted_from_lead_id') THEN
    ALTER TABLE deals ADD COLUMN converted_from_lead_id UUID REFERENCES leads(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='converted_to_customer_id') THEN
    ALTER TABLE deals ADD COLUMN converted_to_customer_id UUID REFERENCES customers(id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='closed_at') THEN
    ALTER TABLE deals ADD COLUMN closed_at TIMESTAMP;
  END IF;

  -- Add indexes for conversion tracking
  CREATE INDEX IF NOT EXISTS idx_leads_converted_deal ON leads(converted_to_deal_id);
  CREATE INDEX IF NOT EXISTS idx_deals_converted_lead ON deals(converted_from_lead_id);
  CREATE INDEX IF NOT EXISTS idx_deals_converted_customer ON deals(converted_to_customer_id);
  CREATE INDEX IF NOT EXISTS idx_customers_converted_lead ON customers(converted_from_lead_id);
  CREATE INDEX IF NOT EXISTS idx_customers_converted_deal ON customers(converted_from_deal_id);

END $$;