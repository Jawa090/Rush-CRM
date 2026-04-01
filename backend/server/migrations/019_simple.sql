-- Simple migration without complex functions

-- Add workspace_id to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workgroups(id) ON DELETE CASCADE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS import_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS external_source_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_workspace_id ON leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_workspace ON leads(org_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_leads_import_id ON leads(import_id);
CREATE INDEX IF NOT EXISTS idx_leads_external_source ON leads(external_source_id);
CREATE INDEX IF NOT EXISTS idx_leads_external_id ON leads(external_id);

-- Create lead access permissions table
CREATE TABLE IF NOT EXISTS lead_workspace_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL,
    workspace_id UUID NOT NULL,
    granted_by UUID NOT NULL,
    access_level VARCHAR(50) DEFAULT 'view' CHECK (access_level IN ('view', 'edit', 'full')),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(lead_id, workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_lead_workspace_access_lead ON lead_workspace_access(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_workspace_access_workspace ON lead_workspace_access(workspace_id);

-- Create lead import history table
CREATE TABLE IF NOT EXISTS lead_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    workspace_id UUID,
    imported_by UUID NOT NULL,
    source_type VARCHAR(50) DEFAULT 'csv' CHECK (source_type IN ('csv', 'excel', 'api', 'webhook', 'website')),
    source_name VARCHAR(255),
    file_name VARCHAR(255),
    file_path TEXT,
    total_rows INTEGER DEFAULT 0,
    successful_imports INTEGER DEFAULT 0,
    failed_imports INTEGER DEFAULT 0,
    duplicate_skipped INTEGER DEFAULT 0,
    field_mapping JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'partial')),
    error_log JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_lead_imports_org ON lead_imports(org_id);
CREATE INDEX IF NOT EXISTS idx_lead_imports_workspace ON lead_imports(workspace_id);
CREATE INDEX IF NOT EXISTS idx_lead_imports_status ON lead_imports(status);
CREATE INDEX IF NOT EXISTS idx_lead_imports_created ON lead_imports(created_at DESC);

-- Create external lead sources table
CREATE TABLE IF NOT EXISTS lead_external_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    workspace_id UUID,
    source_name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) DEFAULT 'website' CHECK (source_type IN ('website', 'api', 'webhook', 'form', 'chatbot')),
    source_url TEXT,
    api_key VARCHAR(255) UNIQUE,
    webhook_url TEXT,
    webhook_secret VARCHAR(255),
    field_mapping JSONB DEFAULT '{}',
    default_values JSONB DEFAULT '{}',
    auto_assign_enabled BOOLEAN DEFAULT false,
    assignment_rules JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    total_leads_received INTEGER DEFAULT 0,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(org_id, source_name)
);

CREATE INDEX IF NOT EXISTS idx_lead_external_sources_org ON lead_external_sources(org_id);
CREATE INDEX IF NOT EXISTS idx_lead_external_sources_workspace ON lead_external_sources(workspace_id);
CREATE INDEX IF NOT EXISTS idx_lead_external_sources_api_key ON lead_external_sources(api_key);
CREATE INDEX IF NOT EXISTS idx_lead_external_sources_active ON lead_external_sources(is_active);
