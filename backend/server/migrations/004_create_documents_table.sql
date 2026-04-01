-- Migration: Create documents table for signature management
-- Date: 2026-03-27
-- Description: Creates documents table for managing signature documents and vault

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('contract', 'nda', 'purchase_order', 'invoice', 'certificate')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'signed', 'completed', 'cancelled')),
  content TEXT,
  signers JSONB DEFAULT '[]',
  company_id UUID REFERENCES companies(id),
  contact_id UUID REFERENCES contacts(id),
  expiry_date DATE,
  signed_at TIMESTAMP,
  notes TEXT,
  file_path VARCHAR(500),
  file_size INTEGER,
  is_secure BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_org_id ON documents(org_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_company_id ON documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_contact_id ON documents(contact_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_signed_at ON documents(signed_at);

-- Insert some sample data for testing
INSERT INTO documents (org_id, user_id, title, type, status, signers, company_id, expiry_date, notes, is_secure)
SELECT 
  o.id as org_id,
  u.id as user_id,
  'Service Agreement - ' || c.name as title,
  'contract' as type,
  'pending' as status,
  '["John Doe", "Jane Smith"]'::jsonb as signers,
  c.id as company_id,
  CURRENT_DATE + INTERVAL '1 year' as expiry_date,
  'Sample service agreement document' as notes,
  true as is_secure
FROM organizations o
CROSS JOIN users u
LEFT JOIN companies c ON c.org_id = o.id
WHERE u.org_id = o.id
LIMIT 1;

INSERT INTO documents (org_id, user_id, title, type, status, signers, expiry_date, notes, is_secure, signed_at)
SELECT 
  o.id as org_id,
  u.id as user_id,
  'Non-Disclosure Agreement - Tech Solutions' as title,
  'nda' as type,
  'signed' as status,
  '["Mike Johnson"]'::jsonb as signers,
  CURRENT_DATE + INTERVAL '3 years' as expiry_date,
  'Confidentiality agreement for tech partnership' as notes,
  true as is_secure,
  CURRENT_TIMESTAMP - INTERVAL '5 days' as signed_at
FROM organizations o
CROSS JOIN users u
WHERE u.org_id = o.id
LIMIT 1;

INSERT INTO documents (org_id, user_id, title, type, status, signers, notes, is_secure)
SELECT 
  o.id as org_id,
  u.id as user_id,
  'Purchase Order #PO-2024-001' as title,
  'purchase_order' as type,
  'draft' as status,
  '[]'::jsonb as signers,
  'Purchase order for office supplies' as notes,
  false as is_secure
FROM organizations o
CROSS JOIN users u
WHERE u.org_id = o.id
LIMIT 1;