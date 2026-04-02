-- Migration: Fix missing lead columns and core workspace/drive tables
-- Created: 2024-03-31

-- Fix leads table schema
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='workspace_id') THEN
    ALTER TABLE public.leads ADD COLUMN workspace_id UUID REFERENCES public.workgroups(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='external_source_id') THEN
    ALTER TABLE public.leads ADD COLUMN external_source_id VARCHAR(100);
  END IF;
  
  -- Extra columns seen in controller query
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='pipeline') THEN
    ALTER TABLE public.leads ADD COLUMN pipeline VARCHAR(100);
  END IF;
END $$;

-- Create missing entity_drive_files table (required by driveIntegrations routes)
CREATE TABLE IF NOT EXISTS public.entity_drive_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  provider VARCHAR(50) NOT NULL,
  drive_connection_id UUID,
  file_id VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  file_size BIGINT,
  web_view_link TEXT,
  thumbnail_link TEXT,
  folder_path TEXT,
  linked_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add lead_workspace_access table (referenced in leadController.js)
CREATE TABLE IF NOT EXISTS public.lead_workspace_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workgroups(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_leads_workspace_id ON leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_entity_drive_files_entity ON entity_drive_files(entity_type, entity_id);
