-- Restore missing drive and lead-related tables
-- Created: 2026-04-01

-- Fix lead columns seen in code but missing from initial migrations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='workspace_id') THEN
    ALTER TABLE public.leads ADD COLUMN workspace_id UUID REFERENCES public.workgroups(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='external_source_id') THEN
    ALTER TABLE public.leads ADD COLUMN external_source_id VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='pipeline') THEN
    ALTER TABLE public.leads ADD COLUMN pipeline VARCHAR(100);
  END IF;
END $$;

-- Table for connected drive instances (company, personal, cloud)
CREATE TABLE IF NOT EXISTS public.connected_drives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  ownership VARCHAR(50) NOT NULL, -- 'company', 'personal', 'cloud'
  drive_type VARCHAR(50) NOT NULL, -- 'network', 'onedrive', 'googledrive', 'local'
  display_name VARCHAR(255) NOT NULL,
  network_path TEXT,
  network_protocol VARCHAR(50),
  connected_by UUID REFERENCES public.users(id),
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for drive-level permissions
CREATE TABLE IF NOT EXISTS public.drive_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drive_id UUID REFERENCES public.connected_drives(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  role UUID REFERENCES public.roles(id),
  access_level VARCHAR(50) NOT NULL, -- 'view', 'edit', 'full'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for linking files to specific entities (deals, leads, etc)
CREATE TABLE IF NOT EXISTS public.entity_drive_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- 'deal', 'lead', 'project', etc
  entity_id UUID NOT NULL,
  provider VARCHAR(50) NOT NULL,
  drive_connection_id UUID REFERENCES public.connected_drives(id),
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_connected_drives_org ON connected_drives(org_id);
CREATE INDEX IF NOT EXISTS idx_drive_permissions_drive ON drive_permissions(drive_id);
CREATE INDEX IF NOT EXISTS idx_entity_drive_files_entity ON entity_drive_files(entity_type, entity_id);
