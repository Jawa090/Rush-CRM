-- Simple Employee Documents Table
-- This creates a minimal working version

-- Drop existing table if it has issues
DROP TABLE IF EXISTS employee_documents CASCADE;

-- Create simple employee documents table
CREATE TABLE employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_employee_documents_employee ON employee_documents(employee_id);
CREATE INDEX idx_employee_documents_org ON employee_documents(org_id);
CREATE INDEX idx_employee_documents_type ON employee_documents(document_type);

-- Add comment
COMMENT ON TABLE employee_documents IS 'Stores employee document uploads';
