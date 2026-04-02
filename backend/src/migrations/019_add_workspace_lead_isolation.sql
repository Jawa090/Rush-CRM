-- Migration: Add Workspace-based Lead Isolation
-- Date: 2026-04-01
-- Description: Adds workspace support to leads for complete isolation and access control

-- Add workspace_id to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workgroups(id) ON DELETE CASCADE;

-- Create index for workspace-based queries
CREATE INDEX IF NOT EXISTS idx_leads_workspace_id ON leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_leads_org_workspace ON leads(org_id, workspace_id);

-- Create lead access permissions table
CREATE TABLE IF NOT EXISTS lead_workspace_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    granted_by UUID NOT NULL REFERENCES users(id),
    access_level VARCHAR(50) DEFAULT 'view' CHECK (access_level IN ('view', 'edit', 'full')),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(lead_id, workspace_id)
);

CREATE INDEX idx_lead_workspace_access_lead ON lead_workspace_access(lead_id);
CREATE INDEX idx_lead_workspace_access_workspace ON lead_workspace_access(workspace_id);

-- Create lead import history table
CREATE TABLE IF NOT EXISTS lead_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workgroups(id) ON DELETE SET NULL,
    imported_by UUID NOT NULL REFERENCES users(id),
    
    -- Import details
    source_type VARCHAR(50) DEFAULT 'csv' CHECK (source_type IN ('csv', 'excel', 'api', 'webhook', 'website')),
    source_name VARCHAR(255),
    file_name VARCHAR(255),
    file_path TEXT,
    
    -- Import stats
    total_rows INTEGER DEFAULT 0,
    successful_imports INTEGER DEFAULT 0,
    failed_imports INTEGER DEFAULT 0,
    duplicate_skipped INTEGER DEFAULT 0,
    
    -- Field mapping used
    field_mapping JSONB DEFAULT '{}',
    
    -- Import status
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'partial')),
    error_log JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_lead_imports_org ON lead_imports(org_id);
CREATE INDEX idx_lead_imports_workspace ON lead_imports(workspace_id);
CREATE INDEX idx_lead_imports_status ON lead_imports(status);
CREATE INDEX idx_lead_imports_created ON lead_imports(created_at DESC);

-- Create external lead sources table for website integration
CREATE TABLE IF NOT EXISTS lead_external_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workgroups(id) ON DELETE SET NULL,
    
    -- Source details
    source_name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) DEFAULT 'website' CHECK (source_type IN ('website', 'api', 'webhook', 'form', 'chatbot')),
    source_url TEXT,
    
    -- API/Webhook configuration
    api_key VARCHAR(255) UNIQUE,
    webhook_url TEXT,
    webhook_secret VARCHAR(255),
    
    -- Field mapping configuration
    field_mapping JSONB DEFAULT '{}',
    default_values JSONB DEFAULT '{}',
    
    -- Auto-assignment rules
    auto_assign_enabled BOOLEAN DEFAULT false,
    assignment_rules JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    total_leads_received INTEGER DEFAULT 0,
    
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(org_id, source_name)
);

CREATE INDEX idx_lead_external_sources_org ON lead_external_sources(org_id);
CREATE INDEX idx_lead_external_sources_workspace ON lead_external_sources(workspace_id);
CREATE INDEX idx_lead_external_sources_api_key ON lead_external_sources(api_key);
CREATE INDEX idx_lead_external_sources_active ON lead_external_sources(is_active);

-- Add import_id to leads to track which import they came from
ALTER TABLE leads ADD COLUMN IF NOT EXISTS import_id UUID REFERENCES lead_imports(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS external_source_id UUID REFERENCES lead_external_sources(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_leads_import_id ON leads(import_id);
CREATE INDEX IF NOT EXISTS idx_leads_external_source ON leads(external_source_id);
CREATE INDEX IF NOT EXISTS idx_leads_external_id ON leads(external_id);

-- Function to check if user has access to lead in workspace
CREATE OR REPLACE FUNCTION user_has_lead_access(
    p_user_id UUID,
    p_lead_id UUID,
    p_required_level VARCHAR DEFAULT 'view'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_lead_workspace UUID;
    v_is_member BOOLEAN;
    v_has_shared_access BOOLEAN;
BEGIN
    -- Get lead's workspace
    SELECT workspace_id INTO v_lead_workspace FROM leads WHERE id = p_lead_id;
    
    -- If no workspace assigned, check org-level access (legacy behavior)
    IF v_lead_workspace IS NULL THEN
        RETURN TRUE;
  END IF;
    
    -- Check if user is member of the workspace
    SELECT EXISTS(
        SELECT 1 FROM workgroup_members 
        WHERE workgroup_id = v_lead_workspace AND user_id = p_user_id
    ) INTO v_is_member;
    
    IF v_is_member THEN
        RETURN TRUE;
    END IF;
    
    -- Check if lead has been shared with user's workspace
    SELECT EXISTS(
        SELECT 1 FROM lead_workspace_access lwa
        JOIN workgroup_members wm ON wm.workgroup_id = lwa.workspace_id
        WHERE lwa.lead_id = p_lead_id 
        AND wm.user_id = p_user_id
        AND (lwa.expires_at IS NULL OR lwa.expires_at > CURRENT_TIMESTAMP)
        AND (
            p_required_level = 'view' OR
            (p_required_level = 'edit' AND lwa.access_level IN ('edit', 'full')) OR
            (p_required_level = 'full' AND lwa.access_level = 'full')
        )
    ) INTO v_has_shared_access;
    
    RETURN v_has_shared_access;
END;
$$ LANGUAGE plpgsql;

-- Create view for leads with workspace access info
CREATE OR REPLACE VIEW leads_with_access AS
SELECT 
    l.*,
    w.name as workspace_name,
    w.type as workspace_type,
    CASE 
        WHEN l.workspace_id IS NULL THEN 'org'
        ELSE 'workspace'
    END as access_scope,
    (
        SELECT json_agg(json_build_object(
            'workspace_id', lwa.workspace_id,
            'workspace_name', w2.name,
            'access_level', lwa.access_level,
            'granted_at', lwa.granted_at,
            'expires_at', lwa.expires_at
        ))
        FROM lead_workspace_access lwa
        JOIN workgroups w2 ON w2.id = lwa.workspace_id
        WHERE lwa.lead_id = l.id
        AND (lwa.expires_at IS NULL OR lwa.expires_at > CURRENT_TIMESTAMP)
    ) as shared_with
FROM leads l
LEFT JOIN workgroups w ON w.id = l.workspace_id;

-- Add comments
COMMENT ON TABLE lead_workspace_access IS 'Controls which workspaces can access specific leads';
COMMENT ON TABLE lead_imports IS 'Tracks all lead import operations with stats and field mappings';
COMMENT ON TABLE lead_external_sources IS 'External sources (websites, APIs) that can push leads into the system';
COMMENT ON FUNCTION user_has_lead_access IS 'Checks if a user has access to a lead based on workspace membership or shared access';
