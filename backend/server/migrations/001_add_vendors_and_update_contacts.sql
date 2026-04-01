-- Migration: Add vendors table and update contacts table
-- Date: 2026-03-26
-- Description: Adds vendors table and updates contacts table to support signing parties

-- Add vendors table if it doesn't exist
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  contact_person VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to contacts table if they don't exist
DO $$ 
BEGIN
  -- Add user_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='contacts' AND column_name='user_id') THEN
    ALTER TABLE contacts ADD COLUMN user_id UUID REFERENCES users(id);
  END IF;

  -- Add position column (rename from title if exists)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='contacts' AND column_name='position') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='contacts' AND column_name='title') THEN
      ALTER TABLE contacts RENAME COLUMN title TO position;
    ELSE
      ALTER TABLE contacts ADD COLUMN position VARCHAR(255);
    END IF;
  END IF;

  -- Add notes column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='contacts' AND column_name='notes') THEN
    ALTER TABLE contacts ADD COLUMN notes TEXT;
  END IF;

  -- Add tags column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='contacts' AND column_name='tags') THEN
    ALTER TABLE contacts ADD COLUMN tags TEXT[];
  END IF;

  -- Add contact_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='contacts' AND column_name='contact_type') THEN
    ALTER TABLE contacts ADD COLUMN contact_type VARCHAR(50) DEFAULT 'contact';
  END IF;

  -- Make last_name nullable
  ALTER TABLE contacts ALTER COLUMN last_name DROP NOT NULL;
END $$;

-- Create index on contact_type for faster queries
CREATE INDEX IF NOT EXISTS idx_contacts_contact_type ON contacts(contact_type);

-- Create index on vendors org_id for faster queries
CREATE INDEX IF NOT EXISTS idx_vendors_org_id ON vendors(org_id);

-- Create index on vendors status
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
