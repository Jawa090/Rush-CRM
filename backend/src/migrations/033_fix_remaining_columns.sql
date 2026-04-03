-- =====================================================
-- Migration: Fix Remaining Missing Columns
-- Description: Tasks table, user_roles, unibox, hrms_notifications, profiles
-- Date: 2026-04-02
-- =====================================================

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  project_id UUID,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  assigned_to UUID,
  due_date DATE,
  sort_order INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fix user_roles table
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS org_id UUID;

-- Fix unibox_emails table
ALTER TABLE unibox_emails ADD COLUMN IF NOT EXISTS body TEXT;

-- Fix hrms_notifications table
ALTER TABLE hrms_notifications ADD COLUMN IF NOT EXISTS notification_type VARCHAR(100);
ALTER TABLE hrms_notifications ADD COLUMN IF NOT EXISTS user_id UUID;

-- Fix profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar VARCHAR(500);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language VARCHAR(50);

-- Fix lead_external_sources table
ALTER TABLE lead_external_sources ADD COLUMN IF NOT EXISTS workspace_id UUID;
ALTER TABLE lead_external_sources ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create lead_imports table
CREATE TABLE IF NOT EXISTS lead_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  workspace_id UUID,
  imported_by UUID NOT NULL,
  source_type VARCHAR(50),
  file_name VARCHAR(255),
  file_path TEXT,
  field_mapping JSONB,
  status VARCHAR(50) DEFAULT 'processing',
  total_rows INTEGER DEFAULT 0,
  successful_imports INTEGER DEFAULT 0,
  failed_imports INTEGER DEFAULT 0,
  duplicate_skipped INTEGER DEFAULT 0,
  error_log JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(org_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

CREATE INDEX IF NOT EXISTS idx_lead_imports_org_id ON lead_imports(org_id);
CREATE INDEX IF NOT EXISTS idx_lead_imports_workspace_id ON lead_imports(workspace_id);
CREATE INDEX IF NOT EXISTS idx_lead_imports_status ON lead_imports(status);
CREATE INDEX IF NOT EXISTS idx_lead_imports_imported_by ON lead_imports(imported_by);

-- =====================================================
-- End of Migration
-- =====================================================
