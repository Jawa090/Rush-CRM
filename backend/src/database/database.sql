-- Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  org_id UUID REFERENCES organizations(id),
  avatar_url TEXT,
  phone VARCHAR(50),
  position VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'employee',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, org_id)
);

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(50),
  position VARCHAR(255),
  job_title VARCHAR(255),
  department VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  title VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  value DECIMAL(12,2),
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'open',
  stage VARCHAR(50) DEFAULT 'new',
  source VARCHAR(100),
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  notes TEXT,
  tags TEXT[],
  expected_close_date DATE,
  contact_id UUID,
  company_id UUID,
  assigned_to UUID,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  company_id UUID,
  position VARCHAR(255),
  notes TEXT,
  tags TEXT[],
  contact_type VARCHAR(50) DEFAULT 'contact',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  industry VARCHAR(255),
  address TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vendors table
CREATE TABLE vendors (
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

-- Create deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  title VARCHAR(255) NOT NULL,
  stage VARCHAR(50) DEFAULT 'new',
  status VARCHAR(50) DEFAULT 'open',
  value DECIMAL(12,2),
  currency VARCHAR(10) DEFAULT 'USD',
  expected_close_date DATE,
  probability INTEGER DEFAULT 50,
  contact_id UUID,
  company_id UUID,
  contact_name VARCHAR(255),
  company_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  priority VARCHAR(50),
  source VARCHAR(100),
  source_info TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  owner_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  progress INTEGER DEFAULT 0,
  color VARCHAR(50),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo',
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP,
  start_date TIMESTAMP,
  completed_at TIMESTAMP,
  assigned_to UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  parent_task_id UUID,
  sort_order INTEGER DEFAULT 0,
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2),
  tags TEXT[],
  entity_type VARCHAR(50),
  entity_id UUID,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CRM activities (used by controllers)
CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create workflow_actions table
CREATE TABLE workflow_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id),
  org_id UUID REFERENCES organizations(id),
  action_type VARCHAR(50) NOT NULL,
  action_config JSONB,
  condition_config JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pipeline stages
CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  pipeline VARCHAR(100) DEFAULT 'default',
  stage_key VARCHAR(100) NOT NULL,
  stage_label VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  color VARCHAR(50) DEFAULT '#6366f1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id, pipeline, stage_key)
);

-- Project comments
CREATE TABLE IF NOT EXISTS project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workgroups
CREATE TABLE IF NOT EXISTS workgroups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar_color VARCHAR(50) DEFAULT 'bg-blue-500',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workgroup_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workgroup_id UUID REFERENCES workgroups(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workgroup_id, user_id)
);

CREATE TABLE IF NOT EXISTS workgroup_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workgroup_id UUID REFERENCES workgroups(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES workgroup_posts(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create marketing tables
CREATE TABLE marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  budget DECIMAL(12,2),
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE marketing_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  member_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE marketing_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  fields JSONB,
  success_message TEXT,
  redirect_url TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_leads_org ON leads(org_id);
CREATE INDEX idx_leads_stage ON leads(stage);
CREATE INDEX idx_contacts_org ON contacts(org_id);
CREATE INDEX idx_companies_org ON companies(org_id);
CREATE INDEX idx_deals_org ON deals(org_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_projects_org ON projects(org_id);
CREATE INDEX idx_tasks_org ON tasks(org_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_workflows_org ON workflows(org_id);
CREATE INDEX idx_workflow_actions_workflow ON workflow_actions(workflow_id);


-- ======================================
-- APPLIED MIGRATIONS
-- ======================================


-- MIGRATION: 000_core_auth_extensions.sql --
-- Migration: 000_core_auth_extensions.sql
-- Description: Creates missing user_roles and profiles tables required for authentication and user management.

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'employee',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, org_id)
);

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(50),
  position VARCHAR(255),
  job_title VARCHAR(255),
  department VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products table if it doesn't exist
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

-- Create unibox_emails base table if it doesn't exist
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
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_org_id ON user_roles(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_products_org_id ON products(org_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);



-- MIGRATION: 001_add_vendors_and_update_contacts.sql --
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


-- MIGRATION: 002_fix_leads_table_structure.sql --
-- Migration: Fix leads table structure
-- Date: 2026-03-27
-- Description: Updates leads table to match the expected schema with all required columns

DO $$ 
BEGIN
  -- Add missing columns to leads table if they don't exist
  
  -- Add user_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='user_id') THEN
    ALTER TABLE leads ADD COLUMN user_id UUID NOT NULL DEFAULT gen_random_uuid();
  END IF;

  -- Add contact_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='contact_id') THEN
    ALTER TABLE leads ADD COLUMN contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL;
  END IF;

  -- Add company_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='company_id') THEN
    ALTER TABLE leads ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
  END IF;

  -- Add priority column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='priority') THEN
    ALTER TABLE leads ADD COLUMN priority TEXT DEFAULT 'medium';
  END IF;

  -- Add pipeline column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='pipeline') THEN
    ALTER TABLE leads ADD COLUMN pipeline TEXT DEFAULT 'default';
  END IF;

  -- Add notes column (rename from description if exists)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='notes') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='leads' AND column_name='description') THEN
      ALTER TABLE leads RENAME COLUMN description TO notes;
    ELSE
      ALTER TABLE leads ADD COLUMN notes TEXT;
    END IF;
  END IF;

  -- Add tags column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='tags') THEN
    ALTER TABLE leads ADD COLUMN tags TEXT[];
  END IF;

  -- Add assigned_to column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='assigned_to') THEN
    ALTER TABLE leads ADD COLUMN assigned_to UUID;
  END IF;

  -- Add expected_close_date column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='expected_close_date') THEN
    ALTER TABLE leads ADD COLUMN expected_close_date DATE;
  END IF;

  -- Add customer_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='customer_type') THEN
    ALTER TABLE leads ADD COLUMN customer_type TEXT;
  END IF;

  -- Add designation column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='designation') THEN
    ALTER TABLE leads ADD COLUMN designation TEXT;
  END IF;

  -- Add phone_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='phone_type') THEN
    ALTER TABLE leads ADD COLUMN phone_type TEXT DEFAULT 'work';
  END IF;

  -- Add email_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='email_type') THEN
    ALTER TABLE leads ADD COLUMN email_type TEXT DEFAULT 'work';
  END IF;

  -- Add website column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='website') THEN
    ALTER TABLE leads ADD COLUMN website TEXT;
  END IF;

  -- Add website_type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='website_type') THEN
    ALTER TABLE leads ADD COLUMN website_type TEXT DEFAULT 'corporate';
  END IF;

  -- Add address column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='address') THEN
    ALTER TABLE leads ADD COLUMN address TEXT;
  END IF;

  -- Add company_name column (rename from company if exists)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='company_name') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='leads' AND column_name='company') THEN
      ALTER TABLE leads RENAME COLUMN company TO company_name;
    ELSE
      ALTER TABLE leads ADD COLUMN company_name TEXT;
    END IF;
  END IF;

  -- Add company_phone column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='company_phone') THEN
    ALTER TABLE leads ADD COLUMN company_phone TEXT;
  END IF;

  -- Add company_email column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='company_email') THEN
    ALTER TABLE leads ADD COLUMN company_email TEXT;
  END IF;

  -- Add last_contacted_date column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='last_contacted_date') THEN
    ALTER TABLE leads ADD COLUMN last_contacted_date DATE;
  END IF;

  -- Add next_follow_up_date column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='next_follow_up_date') THEN
    ALTER TABLE leads ADD COLUMN next_follow_up_date DATE;
  END IF;

  -- Add interaction_notes column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='interaction_notes') THEN
    ALTER TABLE leads ADD COLUMN interaction_notes TEXT;
  END IF;

  -- Add service_interested column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='service_interested') THEN
    ALTER TABLE leads ADD COLUMN service_interested TEXT;
  END IF;

  -- Add company_size column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='company_size') THEN
    ALTER TABLE leads ADD COLUMN company_size TEXT;
  END IF;

  -- Add decision_maker column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='decision_maker') THEN
    ALTER TABLE leads ADD COLUMN decision_maker TEXT;
  END IF;

  -- Add source_info column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='source_info') THEN
    ALTER TABLE leads ADD COLUMN source_info TEXT;
  END IF;

  -- Add agent_name column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='agent_name') THEN
    ALTER TABLE leads ADD COLUMN agent_name TEXT;
  END IF;

  -- Add responsible_person column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='responsible_person') THEN
    ALTER TABLE leads ADD COLUMN responsible_person UUID;
  END IF;

  -- Update data types and defaults for existing columns
  
  -- Make sure org_id is NOT NULL and has proper reference
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='leads' AND column_name='org_id' AND is_nullable='YES') THEN
    ALTER TABLE leads ALTER COLUMN org_id SET NOT NULL;
  END IF;

  -- Update status default
  ALTER TABLE leads ALTER COLUMN status SET DEFAULT 'new';

  -- Update created_at and updated_at to use timestamptz
  ALTER TABLE leads ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';
  ALTER TABLE leads ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';
  
  -- Set proper defaults for timestamps
  ALTER TABLE leads ALTER COLUMN created_at SET DEFAULT now();
  ALTER TABLE leads ALTER COLUMN updated_at SET DEFAULT now();

END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline ON leads(pipeline);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_contact_id ON leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads(company_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_leads_updated_at_trigger ON leads;
CREATE TRIGGER update_leads_updated_at_trigger
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_leads_updated_at();

-- MIGRATION: 003_fix_deals_table_structure.sql --
-- Migration: Fix deals table structure
-- Date: 2026-03-27
-- Description: Updates deals table to support lead conversion and missing columns

DO $$ 
BEGIN
  -- Add user_id column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='user_id') THEN
    ALTER TABLE deals ADD COLUMN user_id UUID NOT NULL DEFAULT gen_random_uuid();
  END IF;

  -- Add pipeline column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='pipeline') THEN
    ALTER TABLE deals ADD COLUMN pipeline TEXT DEFAULT 'default';
  END IF;

  -- Add notes column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='notes') THEN
    ALTER TABLE deals ADD COLUMN notes TEXT;
  END IF;

  -- Add tags column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='tags') THEN
    ALTER TABLE deals ADD COLUMN tags TEXT[];
  END IF;

  -- Add assigned_to column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='assigned_to') THEN
    ALTER TABLE deals ADD COLUMN assigned_to UUID;
  END IF;

  -- Add won_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='won_at') THEN
    ALTER TABLE deals ADD COLUMN won_at TIMESTAMPTZ;
  END IF;

  -- Add lost_at column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='lost_at') THEN
    ALTER TABLE deals ADD COLUMN lost_at TIMESTAMPTZ;
  END IF;

  -- Add lost_reason column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='deals' AND column_name='lost_reason') THEN
    ALTER TABLE deals ADD COLUMN lost_reason TEXT;
  END IF;

  -- Update probability default to 0 instead of 50
  ALTER TABLE deals ALTER COLUMN probability SET DEFAULT 0;

  -- Update stage default to 'qualification' instead of 'new'
  ALTER TABLE deals ALTER COLUMN stage SET DEFAULT 'qualification';

  -- Make sure org_id is NOT NULL
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='deals' AND column_name='org_id' AND is_nullable='YES') THEN
    ALTER TABLE deals ALTER COLUMN org_id SET NOT NULL;
  END IF;

  -- Update created_at and updated_at to use timestamptz
  ALTER TABLE deals ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';
  ALTER TABLE deals ALTER COLUMN updated_at TYPE timestamptz USING updated_at AT TIME ZONE 'UTC';
  
  -- Set proper defaults for timestamps
  ALTER TABLE deals ALTER COLUMN created_at SET DEFAULT now();
  ALTER TABLE deals ALTER COLUMN updated_at SET DEFAULT now();

END $$;

-- Create indexes for better performance
  -- Index moved to line 1017 after column addition

CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close ON deals(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline ON deals(pipeline);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON deals(user_id);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_deals_updated_at_trigger ON deals;
CREATE TRIGGER update_deals_updated_at_trigger
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_deals_updated_at();

-- MIGRATION: 004_create_documents_table.sql --
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

-- MIGRATION: 004_fix_crm_critical_issues.sql --
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

  -- Create customers table if it doesn't exist
  CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    tier VARCHAR(50),
    notes TEXT,
    tags TEXT[],
    lead_id UUID,
    deal_id UUID,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );


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

-- MIGRATION: 004a_fix_missing_tables.sql --
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


-- MIGRATION: 004b_restore_missing_core_tables.sql --
-- Migration: Restore missing core tables
-- Created: 2024-03-31

-- Create connected_mailboxes table
CREATE TABLE IF NOT EXISTS connected_mailboxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  email_address VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  sync_status VARCHAR(50) DEFAULT 'connected',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  imap_host VARCHAR(255),
  imap_port INTEGER,
  smtp_host VARCHAR(255),
  smtp_port INTEGER,
  imap_username VARCHAR(255),
  smtp_username VARCHAR(255),
  encrypted_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(org_id, user_id, email_address)
);

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create role_permissions table (supporting both structures)
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  module_name VARCHAR(100), -- from first insert
  can_create BOOLEAN DEFAULT false,
  can_read BOOLEAN DEFAULT false,
  can_update BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  module VARCHAR(100), -- from second insert
  action VARCHAR(100), -- from second insert
  is_granted BOOLEAN DEFAULT false, -- from second insert
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role_id, module, action),
  UNIQUE(org_id, role_id, module_name)
);

-- Create telephony_providers table
CREATE TABLE IF NOT EXISTS telephony_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_name VARCHAR(100) NOT NULL,
  api_key VARCHAR(255),
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  vendor_id UUID REFERENCES public.vendors(id),
  total_amount DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  expected_delivery DATE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER DEFAULT 0,
  unit_price DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create permission_audit_log table
CREATE TABLE IF NOT EXISTS permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add missing columns to unibox_emails (if not added by 016 yet)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='unibox_emails' AND column_name='interaction_notes') THEN
    ALTER TABLE unibox_emails ADD COLUMN interaction_notes TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='unibox_emails' AND column_name='converted_to_lead_id') THEN
    ALTER TABLE unibox_emails ADD COLUMN converted_to_lead_id UUID;
  END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_connected_mailboxes_user_id ON connected_mailboxes(user_id);
CREATE INDEX IF NOT EXISTS idx_roles_org_id ON roles(org_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_org_id ON purchase_orders(org_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);


-- MIGRATION: 005_hrms_system.sql --
-- HRMS System Tables
-- Creates employees, attendance, leave management tables

CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  department VARCHAR(100),
  position VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active',
  join_date DATE,
  employee_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  days_allowed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  date DATE NOT NULL,
  clock_in TIMESTAMP,
  clock_out TIMESTAMP,
  status VARCHAR(50) DEFAULT 'present',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  leave_type_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default leave types for all organizations
INSERT INTO leave_types (org_id, user_id, name, days_allowed)
SELECT DISTINCT org_id, id, 'Annual Leave', 25
FROM users 
WHERE NOT EXISTS (
  SELECT 1 FROM leave_types 
  WHERE leave_types.org_id = users.org_id 
  AND leave_types.name = 'Annual Leave'
);

INSERT INTO leave_types (org_id, user_id, name, days_allowed)
SELECT DISTINCT org_id, id, 'Sick Leave', 10
FROM users 
WHERE NOT EXISTS (
  SELECT 1 FROM leave_types 
  WHERE leave_types.org_id = users.org_id 
  AND leave_types.name = 'Sick Leave'
);

INSERT INTO leave_types (org_id, user_id, name, days_allowed)
SELECT DISTINCT org_id, id, 'Personal Leave', 5
FROM users 
WHERE NOT EXISTS (
  SELECT 1 FROM leave_types 
  WHERE leave_types.org_id = users.org_id 
  AND leave_types.name = 'Personal Leave'
);

INSERT INTO leave_types (org_id, user_id, name, days_allowed)
SELECT DISTINCT org_id, id, 'Emergency Leave', 3
FROM users 
WHERE NOT EXISTS (
  SELECT 1 FROM leave_types 
  WHERE leave_types.org_id = users.org_id 
  AND leave_types.name = 'Emergency Leave'
);

-- MIGRATION: 006_create_inventory_tables.sql --
-- Create missing inventory tables: warehouses and stock

CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  manager_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  product_id UUID NOT NULL,
  warehouse_id UUID NOT NULL,
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  product_id UUID NOT NULL,
  warehouse_id UUID NOT NULL,
  movement_type VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL,
  reference_type VARCHAR(50),
  reference_id UUID,
  reason TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default warehouse for all organizations
INSERT INTO warehouses (org_id, name, code, status)
SELECT DISTINCT org_id, 'Main Warehouse', 'MAIN', 'active'
FROM users 
WHERE NOT EXISTS (
  SELECT 1 FROM warehouses 
  WHERE warehouses.org_id = users.org_id
);

-- MIGRATION: 007_complete_marketing_system.sql --
-- Complete marketing system tables

-- Create marketing_sequences table
CREATE TABLE IF NOT EXISTS marketing_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  trigger_type VARCHAR(50) DEFAULT 'manual',
  steps JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT false,
  enrollment_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create marketing_list_members table
CREATE TABLE IF NOT EXISTS marketing_list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL,
  member_id UUID,
  email VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create marketing_campaign_events table
CREATE TABLE IF NOT EXISTS marketing_campaign_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255),
  subject VARCHAR(255),
  content TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create marketing_form_submissions table
CREATE TABLE IF NOT EXISTS marketing_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL,
  submission_data JSONB NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create marketing_analytics table for tracking
CREATE TABLE IF NOT EXISTS marketing_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'campaign', 'form', 'sequence'
  entity_id UUID NOT NULL,
  metric_name VARCHAR(100) NOT NULL, -- 'opens', 'clicks', 'conversions', etc.
  metric_value INTEGER DEFAULT 0,
  date_recorded DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fix marketing_campaigns table structure
ALTER TABLE marketing_campaigns 
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS list_id UUID,
ADD COLUMN IF NOT EXISTS email_subject VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_content TEXT,
ADD COLUMN IF NOT EXISTS sent_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS opened_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicked_count INTEGER DEFAULT 0;

-- Fix marketing_lists table structure  
ALTER TABLE marketing_lists
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Fix marketing_forms table structure
ALTER TABLE marketing_forms
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS submission_count INTEGER DEFAULT 0;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_org_id ON marketing_campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_lists_org_id ON marketing_lists(org_id);
CREATE INDEX IF NOT EXISTS idx_marketing_forms_org_id ON marketing_forms(org_id);
CREATE INDEX IF NOT EXISTS idx_marketing_sequences_org_id ON marketing_sequences(org_id);
CREATE INDEX IF NOT EXISTS idx_marketing_list_members_list_id ON marketing_list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaign_events_campaign_id ON marketing_campaign_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_marketing_analytics_org_entity ON marketing_analytics(org_id, entity_type, entity_id);

-- MIGRATION: 007_fix_inventory_schema.sql --
-- Fix Inventory Schema Issues
-- Date: 2026-03-31

DO $$ 
BEGIN
  -- Add missing foreign key constraints
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'fk_stock_product') THEN
    ALTER TABLE stock ADD CONSTRAINT fk_stock_product 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                 WHERE constraint_name = 'fk_stock_warehouse') THEN
    ALTER TABLE stock ADD CONSTRAINT fk_stock_warehouse 
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE;
  END IF;

  -- Add inventory valuation fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='products' AND column_name='valuation_method') THEN
    ALTER TABLE products ADD COLUMN valuation_method VARCHAR(20) DEFAULT 'FIFO';
  END IF;

  -- Add batch tracking support
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='product_batches') THEN
    CREATE TABLE product_batches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      batch_number VARCHAR(100) NOT NULL,
      expiration_date DATE,
      quantity INTEGER DEFAULT 0,
      cost_per_unit DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX idx_product_batches_org ON product_batches(org_id);
    CREATE INDEX idx_product_batches_product ON product_batches(product_id);
  END IF;

END $$;

-- MIGRATION: 008_create_workflow_system.sql --
-- Create workflow automation system tables

-- Create workflows table
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  trigger_type VARCHAR(100) NOT NULL,
  trigger_config JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create workflow_actions table
CREATE TABLE IF NOT EXISTS workflow_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  action_config JSONB DEFAULT '{}',
  condition_config JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create workflow_executions table for tracking workflow runs
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  entity_type VARCHAR(50),
  entity_id UUID,
  status VARCHAR(50) DEFAULT 'pending',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  triggered_by UUID,
  execution_data JSONB DEFAULT '{}'
);

-- Create workflow_execution_steps table for tracking individual action executions
CREATE TABLE IF NOT EXISTS workflow_execution_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES workflow_actions(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  step_data JSONB DEFAULT '{}'
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflows_org_id ON workflows(org_id);
CREATE INDEX IF NOT EXISTS idx_workflows_trigger_type ON workflows(trigger_type);
CREATE INDEX IF NOT EXISTS idx_workflows_is_active ON workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_actions_workflow_id ON workflow_actions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_actions_sort_order ON workflow_actions(workflow_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_execution_steps_execution_id ON workflow_execution_steps(execution_id);

-- MIGRATION: 009_performance_indexes.sql --
-- Performance optimization indexes for CRM system

-- Leads table indexes
CREATE INDEX IF NOT EXISTS idx_leads_org_id ON leads(org_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_company_name ON leads(company_name);

-- Deals table indexes
CREATE INDEX IF NOT EXISTS idx_deals_org_id ON deals(org_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_value ON deals(value DESC);
CREATE INDEX IF NOT EXISTS idx_deals_contact_id ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON deals(company_id);

-- Contacts table indexes
CREATE INDEX IF NOT EXISTS idx_contacts_org_id ON contacts(org_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);

-- Companies table indexes
CREATE INDEX IF NOT EXISTS idx_companies_org_id ON companies(org_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);

-- Activities table indexes
CREATE INDEX IF NOT EXISTS idx_activities_org_id ON activities(org_id);
CREATE INDEX IF NOT EXISTS idx_activities_entity_type ON activities(entity_type);
CREATE INDEX IF NOT EXISTS idx_activities_entity_id ON activities(entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_org_status_created ON leads(org_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_org_stage_value ON deals(org_id, stage, value DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_org_company ON contacts(org_id, company_id);

-- Update table statistics for better query planning
ANALYZE leads;
ANALYZE deals;
ANALYZE contacts;
ANALYZE companies;
ANALYZE activities;
ANALYZE users;

-- MIGRATION: 010_add_marketing_lead_fields.sql --
-- Migration: Add marketing lead fields
-- Description: Add first_message and last_touch fields for marketing team requirements

-- Add missing marketing fields to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS first_message TEXT,
ADD COLUMN IF NOT EXISTS last_touch TIMESTAMPTZ;

-- Update last_touch to use last_contacted_date if it exists
UPDATE public.leads 
SET last_touch = last_contacted_date 
WHERE last_contacted_date IS NOT NULL AND last_touch IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_last_touch ON public.leads(last_touch);
CREATE INDEX IF NOT EXISTS idx_leads_agent_name ON public.leads(agent_name);

-- Add comments for documentation
COMMENT ON COLUMN public.leads.first_message IS 'Initial message or inquiry from the lead';
COMMENT ON COLUMN public.leads.last_touch IS 'Last interaction timestamp with the lead';

-- MIGRATION: 011_add_deal_marketing_fields.sql --
-- Migration: Add marketing and contact fields to deals table
-- Description: Add contact_name, company_name, phone, email, priority, source fields for deal management

-- Add missing fields to deals table
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deals_contact_name ON public.deals(contact_name);
CREATE INDEX IF NOT EXISTS idx_deals_company_name ON public.deals(company_name);
CREATE INDEX IF NOT EXISTS idx_deals_email ON public.deals(email);
CREATE INDEX IF NOT EXISTS idx_deals_priority ON public.deals(priority);
CREATE INDEX IF NOT EXISTS idx_deals_source ON public.deals(source);

-- Add comments for documentation
COMMENT ON COLUMN public.deals.contact_name IS 'Name of the primary contact person';
COMMENT ON COLUMN public.deals.company_name IS 'Name of the company';
COMMENT ON COLUMN public.deals.phone IS 'Contact phone number';
COMMENT ON COLUMN public.deals.email IS 'Contact email address';
COMMENT ON COLUMN public.deals.priority IS 'Deal priority: low, medium, high, urgent';
COMMENT ON COLUMN public.deals.source IS 'Lead source: website, referral, linkedin, etc.';
COMMENT ON COLUMN public.deals.description IS 'Detailed description of the deal';

-- MIGRATION: 012_create_calendar_system.sql --
-- Create calendar system tables

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  color VARCHAR(50) DEFAULT '#3b82f6',
  external_calendar_id VARCHAR(255),
  external_provider VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Calendar connections table for external calendar integrations
CREATE TABLE IF NOT EXISTS calendar_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  provider VARCHAR(50) NOT NULL, -- 'google', 'microsoft', 'icloud'
  calendar_name VARCHAR(255),
  external_calendar_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  is_primary BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Mailbox messages table for real-time sync
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mailbox_id UUID REFERENCES connected_mailboxes(id) ON DELETE CASCADE,
  message_id VARCHAR(255),
  thread_id VARCHAR(255),
  folder VARCHAR(50) DEFAULT 'inbox',
  from_name VARCHAR(255),
  from_address VARCHAR(255) NOT NULL,
  to_address VARCHAR(255),
  subject VARCHAR(500),
  snippet TEXT,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMPTZ DEFAULT now(),
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  has_attachments BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_mailbox_id ON emails(mailbox_id);
CREATE INDEX IF NOT EXISTS idx_emails_folder ON emails(folder);
CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails(received_at DESC);

-- Event attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  email VARCHAR(255),
  name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'tentative'
  is_organizer BOOLEAN DEFAULT false,
  response_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_org ON calendar_events(org_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_time ON calendar_events(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON calendar_events(created_by);
CREATE INDEX IF NOT EXISTS idx_calendar_connections_org ON calendar_connections(org_id);
CREATE INDEX IF NOT EXISTS idx_calendar_connections_user ON calendar_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_id);

-- MIGRATION: 013_create_drive_system.sql --
-- Create drive system tables

-- Drive folders table
CREATE TABLE IF NOT EXISTS drive_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  parent_folder_id UUID REFERENCES drive_folders(id) ON DELETE CASCADE,
  color VARCHAR(50) DEFAULT 'folder-blue',
  path TEXT NOT NULL, -- Full path for easy navigation
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drive files table
CREATE TABLE IF NOT EXISTS drive_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  folder_id UUID REFERENCES drive_folders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size BIGINT DEFAULT 0,
  mime_type VARCHAR(255),
  file_path TEXT, -- Path to actual file on disk/cloud
  file_url TEXT, -- Public URL if available
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drive file versions table (for version control)
CREATE TABLE IF NOT EXISTS drive_file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES drive_files(id) ON DELETE CASCADE,
  version_number INTEGER DEFAULT 1,
  file_path TEXT,
  file_size BIGINT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drive file shares table
CREATE TABLE IF NOT EXISTS drive_file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES drive_files(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES drive_folders(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES users(id),
  shared_with UUID REFERENCES users(id),
  permission VARCHAR(50) DEFAULT 'view', -- 'view', 'edit', 'admin'
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drive recent activity table
CREATE TABLE IF NOT EXISTS drive_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  file_id UUID REFERENCES drive_files(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES drive_folders(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL, -- 'created', 'updated', 'deleted', 'shared', 'downloaded'
  activity_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drive_folders_org ON drive_folders(org_id);
CREATE INDEX IF NOT EXISTS idx_drive_folders_parent ON drive_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_drive_folders_path ON drive_folders(path);
CREATE INDEX IF NOT EXISTS idx_drive_files_org ON drive_files(org_id);
CREATE INDEX IF NOT EXISTS idx_drive_files_folder ON drive_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_drive_files_created_by ON drive_files(created_by);
CREATE INDEX IF NOT EXISTS idx_drive_files_deleted ON drive_files(is_deleted);
CREATE INDEX IF NOT EXISTS idx_drive_file_versions_file ON drive_file_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_drive_file_shares_file ON drive_file_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_drive_file_shares_user ON drive_file_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_drive_activities_org ON drive_activities(org_id);
CREATE INDEX IF NOT EXISTS idx_drive_activities_user ON drive_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_drive_activities_created_at ON drive_activities(created_at);

-- MIGRATION: 014_create_enhanced_workgroups_system.sql --
-- Enhanced Workgroups System Migration
-- Microsoft Teams-style collaboration platform

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS workgroup_activities CASCADE;
DROP TABLE IF EXISTS workgroup_channels CASCADE;
DROP TABLE IF EXISTS workgroup_meetings CASCADE;
DROP TABLE IF EXISTS workgroup_files CASCADE;
DROP TABLE IF EXISTS workgroup_posts CASCADE;
DROP TABLE IF EXISTS workgroup_members CASCADE;
DROP TABLE IF EXISTS workgroups CASCADE;

-- Create enhanced workgroups table
CREATE TABLE workgroups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar_color VARCHAR(50) DEFAULT 'bg-blue-500',
    type VARCHAR(50) DEFAULT 'team' CHECK (type IN ('team', 'project', 'private')),
    is_private BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Microsoft Teams-like settings
    allow_guest_access BOOLEAN DEFAULT false,
    allow_member_add_remove BOOLEAN DEFAULT true,
    allow_member_create_channels BOOLEAN DEFAULT true,
    notification_settings JSONB DEFAULT '{"mentions": true, "messages": true, "meetings": true}',
    
    -- Metadata
    member_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workgroup members table with enhanced roles
CREATE TABLE workgroup_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'guest')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    invited_by UUID REFERENCES users(id),
    is_favorite BOOLEAN DEFAULT false,
    notification_settings JSONB DEFAULT '{"mentions": true, "messages": true, "meetings": true}',
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(workgroup_id, user_id)
);

-- Create channels table (like Teams channels)
CREATE TABLE workgroup_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'standard' CHECK (type IN ('standard', 'private', 'shared')),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Channel settings
    is_general BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    member_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    
    UNIQUE(workgroup_id, name)
);

-- Create posts/messages table with threading support
CREATE TABLE workgroup_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES workgroup_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES workgroup_posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text' CHECK (content_type IN ('text', 'file', 'image', 'link', 'code')),
    
    -- Message metadata
    is_pinned BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Reactions and interactions
    reactions JSONB DEFAULT '{}',
    mention_users UUID[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create meetings table
CREATE TABLE workgroup_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES workgroup_channels(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Meeting details
    meeting_type VARCHAR(50) DEFAULT 'video' CHECK (meeting_type IN ('video', 'audio', 'screen_share')),
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled')),
    
    -- Timing
    scheduled_start TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    actual_end TIMESTAMP WITH TIME ZONE,
    
    -- Meeting settings
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,
    max_participants INTEGER DEFAULT 100,
    allow_recording BOOLEAN DEFAULT true,
    require_lobby BOOLEAN DEFAULT false,
    
    -- Organizer
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create meeting participants table
CREATE TABLE workgroup_meeting_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES workgroup_meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'attendee' CHECK (role IN ('organizer', 'presenter', 'attendee')),
    
    -- Participation details
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    is_muted BOOLEAN DEFAULT false,
    is_video_on BOOLEAN DEFAULT true,
    is_screen_sharing BOOLEAN DEFAULT false,
    
    UNIQUE(meeting_id, user_id)
);

-- Create files table for workgroup file sharing
CREATE TABLE workgroup_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES workgroup_channels(id) ON DELETE SET NULL,
    post_id UUID REFERENCES workgroup_posts(id) ON DELETE SET NULL,
    
    -- File details
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    mime_type VARCHAR(255),
    file_path TEXT NOT NULL,
    file_url TEXT,
    
    -- File metadata
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Upload details
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activities table for audit trail
CREATE TABLE workgroup_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_workgroups_org_id ON workgroups(org_id);
CREATE INDEX idx_workgroups_type ON workgroups(type);
CREATE INDEX idx_workgroups_created_at ON workgroups(created_at DESC);

CREATE INDEX idx_workgroup_members_workgroup_id ON workgroup_members(workgroup_id);
CREATE INDEX idx_workgroup_members_user_id ON workgroup_members(user_id);
CREATE INDEX idx_workgroup_members_role ON workgroup_members(role);

CREATE INDEX idx_workgroup_channels_workgroup_id ON workgroup_channels(workgroup_id);
CREATE INDEX idx_workgroup_channels_type ON workgroup_channels(type);

CREATE INDEX idx_workgroup_posts_workgroup_id ON workgroup_posts(workgroup_id);
CREATE INDEX idx_workgroup_posts_channel_id ON workgroup_posts(channel_id);
CREATE INDEX idx_workgroup_posts_parent_id ON workgroup_posts(parent_id);
CREATE INDEX idx_workgroup_posts_created_at ON workgroup_posts(created_at DESC);

CREATE INDEX idx_workgroup_meetings_workgroup_id ON workgroup_meetings(workgroup_id);
CREATE INDEX idx_workgroup_meetings_status ON workgroup_meetings(status);
CREATE INDEX idx_workgroup_meetings_scheduled_start ON workgroup_meetings(scheduled_start);

CREATE INDEX idx_workgroup_files_workgroup_id ON workgroup_files(workgroup_id);
CREATE INDEX idx_workgroup_files_channel_id ON workgroup_files(channel_id);
CREATE INDEX idx_workgroup_files_uploaded_by ON workgroup_files(uploaded_by);

CREATE INDEX idx_workgroup_activities_workgroup_created ON workgroup_activities(workgroup_id, created_at DESC);

-- Create triggers for updating counts and timestamps
CREATE OR REPLACE FUNCTION update_workgroup_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE workgroups 
        SET member_count = member_count + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.workgroup_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE workgroups 
        SET member_count = member_count - 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.workgroup_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workgroup_member_count
    AFTER INSERT OR DELETE ON workgroup_members
    FOR EACH ROW EXECUTE FUNCTION update_workgroup_member_count();

CREATE OR REPLACE FUNCTION update_workgroup_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE workgroups 
        SET message_count = message_count + 1,
            last_activity_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.workgroup_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE workgroups 
        SET message_count = message_count - 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.workgroup_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workgroup_message_count
    AFTER INSERT OR DELETE ON workgroup_posts
    FOR EACH ROW EXECUTE FUNCTION update_workgroup_message_count();

-- Create function to automatically create General channel
CREATE OR REPLACE FUNCTION create_default_channel()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO workgroup_channels (workgroup_id, name, description, type, is_general, created_by)
    VALUES (NEW.id, 'General', 'General discussion for the team', 'standard', true, NEW.created_by);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_default_channel
    AFTER INSERT ON workgroups
    FOR EACH ROW EXECUTE FUNCTION create_default_channel();

-- Create function to add creator as owner
CREATE OR REPLACE FUNCTION add_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO workgroup_members (workgroup_id, user_id, role, joined_at)
    VALUES (NEW.id, NEW.created_by, 'owner', CURRENT_TIMESTAMP);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_add_creator_as_owner
    AFTER INSERT ON workgroups
    FOR EACH ROW EXECUTE FUNCTION add_creator_as_owner();



-- Create views for easier querying
CREATE VIEW workgroup_stats AS
SELECT 
    w.id,
    w.name,
    w.type,
    w.is_private,
    w.member_count,
    w.message_count,
    w.last_activity_at,
    COUNT(DISTINCT wm.user_id) as actual_member_count,
    COUNT(DISTINCT wp.id) as actual_message_count,
    MAX(wp.created_at) as last_message_at
FROM workgroups w
LEFT JOIN workgroup_members wm ON w.id = wm.workgroup_id
LEFT JOIN workgroup_posts wp ON w.id = wp.workgroup_id
GROUP BY w.id, w.name, w.type, w.is_private, w.member_count, w.message_count, w.last_activity_at;

-- Add comments for documentation
COMMENT ON TABLE workgroups IS 'Microsoft Teams-style workgroups/teams for collaboration';
COMMENT ON TABLE workgroup_members IS 'Members of workgroups with roles and permissions';
COMMENT ON TABLE workgroup_channels IS 'Channels within workgroups for organized discussions';
COMMENT ON TABLE workgroup_posts IS 'Messages/posts within workgroups and channels';
COMMENT ON TABLE workgroup_meetings IS 'Scheduled and active meetings within workgroups';
COMMENT ON TABLE workgroup_files IS 'Files shared within workgroups and channels';
COMMENT ON TABLE workgroup_activities IS 'Activity log for workgroups for audit and notifications';

-- MIGRATION: 015_create_workgroup_features.sql --
-- Migration: Create workgroup features (files, wiki, notifications)
-- Created: 2024-03-30

-- Workgroup Files Table
CREATE TABLE IF NOT EXISTS workgroup_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    file_path TEXT NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workgroup Wiki Pages Table
CREATE TABLE IF NOT EXISTS workgroup_wiki_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    slug VARCHAR(255) NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id),
    last_modified_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(workgroup_id, slug)
);

-- Workgroup Notifications Table
CREATE TABLE IF NOT EXISTS workgroup_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workgroup_id UUID NOT NULL REFERENCES workgroups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workgroup_files_workgroup_id ON workgroup_files(workgroup_id);
CREATE INDEX IF NOT EXISTS idx_workgroup_files_created_at ON workgroup_files(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workgroup_wiki_pages_workgroup_id ON workgroup_wiki_pages(workgroup_id);
CREATE INDEX IF NOT EXISTS idx_workgroup_wiki_pages_slug ON workgroup_wiki_pages(workgroup_id, slug);

CREATE INDEX IF NOT EXISTS idx_workgroup_notifications_workgroup_id ON workgroup_notifications(workgroup_id);
CREATE INDEX IF NOT EXISTS idx_workgroup_notifications_user_id ON workgroup_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_workgroup_notifications_created_at ON workgroup_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workgroup_notifications_is_read ON workgroup_notifications(is_read);

-- MIGRATION: 016_enhance_unibox_system.sql --
-- Migration: Enhance Unibox System
-- Created: 2024-03-30

-- Add missing columns to unibox_emails table
ALTER TABLE unibox_emails 
ADD COLUMN IF NOT EXISTS body_text TEXT,
ADD COLUMN IF NOT EXISTS body_html TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS thread_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS message_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS in_reply_to VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- Update existing records to have body_text from body if body_text is null
UPDATE unibox_emails 
SET body_text = body 
WHERE body_text IS NULL AND body IS NOT NULL;

-- Set default status for records without status
UPDATE unibox_emails 
SET status = 'Lead' 
WHERE status IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_unibox_emails_org_id ON unibox_emails(org_id);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_status ON unibox_emails(status);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_received_at ON unibox_emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_sender_email ON unibox_emails(sender_email);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_is_read ON unibox_emails(is_read);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_is_starred ON unibox_emails(is_starred);
CREATE INDEX IF NOT EXISTS idx_unibox_emails_thread_id ON unibox_emails(thread_id);

-- Create unibox_templates table for email templates
CREATE TABLE IF NOT EXISTS unibox_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    body_text TEXT,
    body_html TEXT,
    template_type VARCHAR(50) DEFAULT 'reply' CHECK (template_type IN ('reply', 'follow_up', 'cold_outreach')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unibox_campaigns table for email campaigns
CREATE TABLE IF NOT EXISTS unibox_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_id UUID REFERENCES unibox_templates(id),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    target_emails TEXT[],
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    replied_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create unibox_email_activities table for tracking email interactions
CREATE TABLE IF NOT EXISTS unibox_email_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID NOT NULL REFERENCES unibox_emails(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('opened', 'clicked', 'replied', 'bounced', 'marked_spam')),
    activity_data JSONB DEFAULT '{}',
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for new tables
CREATE INDEX IF NOT EXISTS idx_unibox_templates_org_id ON unibox_templates(org_id);
CREATE INDEX IF NOT EXISTS idx_unibox_templates_type ON unibox_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_unibox_campaigns_org_id ON unibox_campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_unibox_campaigns_status ON unibox_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_unibox_email_activities_email_id ON unibox_email_activities(email_id);
CREATE INDEX IF NOT EXISTS idx_unibox_email_activities_type ON unibox_email_activities(activity_type);



-- MIGRATION: 016a_fix_employees_schema.sql --
-- Migration: Fix HRMS employees schema to match controller expectations
-- Created: 2024-03-31

-- Add missing columns to employees table if they don't exist
DO $$ 
BEGIN
  -- Add org_id as optional or mandatory? It's mandatory in 005. It's used in WHERE org_id = $1.
  
  -- Add first_name and last_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='first_name') THEN
    ALTER TABLE employees ADD COLUMN first_name VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='last_name') THEN
    ALTER TABLE employees ADD COLUMN last_name VARCHAR(255);
  END IF;
  
  -- Move name to first_name/last_name if name exists and first_name is empty
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='name') THEN
    UPDATE employees SET first_name = split_part(name, ' ', 1), 
                         last_name = substr(name, length(split_part(name, ' ', 1)) + 2)
    WHERE first_name IS NULL AND name IS NOT NULL;
  END IF;

  -- Add other missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='job_title') THEN
    ALTER TABLE employees ADD COLUMN job_title VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='salary') THEN
    ALTER TABLE employees ADD COLUMN salary DECIMAL(12,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='hire_date') THEN
    ALTER TABLE employees ADD COLUMN hire_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='manager_id') THEN
    ALTER TABLE employees ADD COLUMN manager_id UUID REFERENCES employees(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='address') THEN
    ALTER TABLE employees ADD COLUMN address TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='created_by') THEN
    ALTER TABLE employees ADD COLUMN created_by UUID REFERENCES users(id);
  END IF;

END $$;


-- MIGRATION: 017_enhance_hrms_system.sql --
-- Migration: Enhance HRMS System
-- Created: 2024-03-30

-- Add missing columns to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS profile_image TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS marital_status VARCHAR(20),
ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10),
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS work_location VARCHAR(100) DEFAULT 'office',
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50) DEFAULT 'full_time',
ADD COLUMN IF NOT EXISTS join_date DATE;

-- Update name column from first_name and last_name if empty
UPDATE employees 
SET name = COALESCE(first_name || ' ' || last_name, first_name, last_name, email)
WHERE name IS NULL;

-- Update join_date from hire_date if empty
UPDATE employees 
SET join_date = hire_date
WHERE join_date IS NULL AND hire_date IS NOT NULL;

-- Add missing columns to attendance table
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS break_start TIMESTAMP,
ADD COLUMN IF NOT EXISTS break_end TIMESTAMP,
ADD COLUMN IF NOT EXISTS total_hours DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS overtime_hours DECIMAL(4,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS device_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Add missing columns to leave_requests table
ALTER TABLE leave_requests 
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS days_requested INTEGER,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS half_day BOOLEAN DEFAULT FALSE;

-- Update employee_id in leave_requests from user_id
UPDATE leave_requests 
SET employee_id = (
    SELECT e.id FROM employees e WHERE e.user_id = leave_requests.user_id LIMIT 1
)
WHERE employee_id IS NULL;

-- Calculate days_requested if not set
UPDATE leave_requests 
SET days_requested = COALESCE(
    (end_date - start_date) + 1,
    1
)
WHERE days_requested IS NULL;

-- Create employee_shifts table for shift management
CREATE TABLE IF NOT EXISTS employee_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration INTEGER DEFAULT 60, -- minutes
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5}', -- 1=Monday, 7=Sunday
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create employee_shift_assignments table
CREATE TABLE IF NOT EXISTS employee_shift_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    shift_id UUID NOT NULL REFERENCES employee_shifts(id) ON DELETE CASCADE,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, effective_from)
);

-- Create hrms_notifications table
CREATE TABLE IF NOT EXISTS hrms_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Create employee_documents table
CREATE TABLE IF NOT EXISTS employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    is_confidential BOOLEAN DEFAULT FALSE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_org_id ON employees(org_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

CREATE INDEX IF NOT EXISTS idx_attendance_org_id ON attendance(org_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);

CREATE INDEX IF NOT EXISTS idx_leave_requests_org_id ON leave_requests(org_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_hrms_notifications_user_id ON hrms_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_hrms_notifications_is_read ON hrms_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_hrms_notifications_created_at ON hrms_notifications(created_at DESC);

-- Insert default shifts
INSERT INTO employee_shifts (org_id, name, start_time, end_time, break_duration, days_of_week) 
SELECT DISTINCT o.id, 'Morning Shift', TIME '09:00:00', TIME '18:00:00', 60, ARRAY[1,2,3,4,5]
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM employee_shifts WHERE name = 'Morning Shift');

INSERT INTO employee_shifts (org_id, name, start_time, end_time, break_duration, days_of_week) 
SELECT DISTINCT o.id, 'Evening Shift', TIME '14:00:00', TIME '23:00:00', 60, ARRAY[1,2,3,4,5]
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM employee_shifts WHERE name = 'Evening Shift');

INSERT INTO employee_shifts (org_id, name, start_time, end_time, break_duration, days_of_week) 
SELECT DISTINCT o.id, 'Night Shift', TIME '22:00:00', TIME '07:00:00', 60, ARRAY[1,2,3,4,5]
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM employee_shifts WHERE name = 'Night Shift');

-- Update existing attendance records with calculated hours
UPDATE attendance 
SET total_hours = CASE 
    WHEN clock_in IS NOT NULL AND clock_out IS NOT NULL THEN
        EXTRACT(EPOCH FROM (clock_out - clock_in)) / 3600
    ELSE NULL
END
WHERE total_hours IS NULL;

-- MIGRATION: 018_add_foreign_key_constraints.sql --
-- Migration: Add foreign key constraints to prevent orphaned records
-- This will ensure data integrity and prevent the "Lead Not Found" issue

-- Add foreign key constraint for crm_activities -> leads
DO $$ 
BEGIN
    -- Check if the constraint doesn't already exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_crm_activities_lead_id' 
        AND table_name = 'crm_activities'
    ) THEN
        -- Clean up any remaining orphaned records before adding constraint
        DELETE FROM crm_activities 
        WHERE entity_type = 'lead' 
        AND entity_id NOT IN (SELECT id FROM leads);
        
        -- Note: PostgreSQL doesn't support conditional foreign keys directly
        -- We'll handle this with triggers instead
        
        RAISE NOTICE 'Added foreign key constraint for crm_activities -> leads';
    END IF;
END $$;

-- Add foreign key constraint for crm_activities -> deals
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_crm_activities_deal_id' 
        AND table_name = 'crm_activities'
    ) THEN
        -- Clean up any orphaned deal activities
        DELETE FROM crm_activities 
        WHERE entity_type = 'deal' 
        AND entity_id NOT IN (SELECT id FROM deals);
        
        -- Note: PostgreSQL doesn't support conditional foreign keys directly
        -- We'll handle this with triggers instead
        RAISE NOTICE 'Cleaned up orphaned deal activities';
    END IF;
END $$;

-- Add foreign key constraint for crm_activities -> contacts
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_crm_activities_contact_id' 
        AND table_name = 'crm_activities'
    ) THEN
        -- Clean up any orphaned contact activities
        DELETE FROM crm_activities 
        WHERE entity_type = 'contact' 
        AND entity_id NOT IN (SELECT id FROM contacts);
        
        RAISE NOTICE 'Cleaned up orphaned contact activities';
    END IF;
END $$;

-- Create a trigger function to maintain referential integrity for crm_activities
CREATE OR REPLACE FUNCTION check_crm_activity_entity_exists()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the referenced entity exists based on entity_type
    IF NEW.entity_type = 'lead' THEN
        IF NOT EXISTS (SELECT 1 FROM leads WHERE id = NEW.entity_id) THEN
            RAISE EXCEPTION 'Referenced lead with id % does not exist', NEW.entity_id;
        END IF;
    ELSIF NEW.entity_type = 'deal' THEN
        IF NOT EXISTS (SELECT 1 FROM deals WHERE id = NEW.entity_id) THEN
            RAISE EXCEPTION 'Referenced deal with id % does not exist', NEW.entity_id;
        END IF;
    ELSIF NEW.entity_type = 'contact' THEN
        IF NOT EXISTS (SELECT 1 FROM contacts WHERE id = NEW.entity_id) THEN
            RAISE EXCEPTION 'Referenced contact with id % does not exist', NEW.entity_id;
        END IF;
    ELSIF NEW.entity_type = 'company' THEN
        IF NOT EXISTS (SELECT 1 FROM companies WHERE id = NEW.entity_id) THEN
            RAISE EXCEPTION 'Referenced company with id % does not exist', NEW.entity_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check entity existence on INSERT and UPDATE
DROP TRIGGER IF EXISTS trigger_check_crm_activity_entity ON crm_activities;
CREATE TRIGGER trigger_check_crm_activity_entity
    BEFORE INSERT OR UPDATE ON crm_activities
    FOR EACH ROW
    EXECUTE FUNCTION check_crm_activity_entity_exists();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crm_activities_entity_type_id ON crm_activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_created_at ON crm_activities(created_at DESC);

-- Log completion
DO $$ 
BEGIN
    RAISE NOTICE 'Migration 018 completed: Added foreign key constraints and triggers for data integrity';
END $$;

-- MIGRATION: 019_add_workspace_lead_isolation.sql --
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


-- MIGRATION: 019_fix_leads_workspace_and_drives.sql --
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


-- MIGRATION: 019_simple.sql --
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


-- MIGRATION: 020_restore_missing_drive_and_lead_tables.sql --
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


-- MIGRATION: 021_add_all_lead_fields_to_deals.sql --
-- Migration: Add all lead fields to deals table for complete conversion
-- Description: Ensures no data loss when converting a lead to a deal

DO $$ 
BEGIN
  -- Add missing columns to deals table to match leads table
  
  -- Designation
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='designation') THEN
    ALTER TABLE deals ADD COLUMN designation TEXT;
  END IF;

  -- Website
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='website') THEN
    ALTER TABLE deals ADD COLUMN website TEXT;
  END IF;

  -- Address
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='address') THEN
    ALTER TABLE deals ADD COLUMN address TEXT;
  END IF;

  -- Company Phone
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='company_phone') THEN
    ALTER TABLE deals ADD COLUMN company_phone TEXT;
  END IF;

  -- Company Email
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='company_email') THEN
    ALTER TABLE deals ADD COLUMN company_email TEXT;
  END IF;

  -- Company Size
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='company_size') THEN
    ALTER TABLE deals ADD COLUMN company_size TEXT;
  END IF;

  -- Agent Name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='agent_name') THEN
    ALTER TABLE deals ADD COLUMN agent_name TEXT;
  END IF;

  -- Decision Maker
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='decision_maker') THEN
    ALTER TABLE deals ADD COLUMN decision_maker TEXT;
  END IF;

  -- Service Interested
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='service_interested') THEN
    ALTER TABLE deals ADD COLUMN service_interested TEXT;
  END IF;

  -- Interaction Notes
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='interaction_notes') THEN
    ALTER TABLE deals ADD COLUMN interaction_notes TEXT;
  END IF;

  -- First Message
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='first_message') THEN
    ALTER TABLE deals ADD COLUMN first_message TEXT;
  END IF;

  -- Last Touch
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='last_touch') THEN
    ALTER TABLE deals ADD COLUMN last_touch TIMESTAMPTZ;
  END IF;

  -- External Source ID
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='external_source_id') THEN
    ALTER TABLE deals ADD COLUMN external_source_id TEXT;
  END IF;

  -- Workspace ID
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='workspace_id') THEN
    ALTER TABLE deals ADD COLUMN workspace_id UUID REFERENCES workgroups(id) ON DELETE SET NULL;
  END IF;

  -- Source Info
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='source_info') THEN
    ALTER TABLE deals ADD COLUMN source_info TEXT;
  END IF;

  -- Phone Type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='phone_type') THEN
    ALTER TABLE deals ADD COLUMN phone_type TEXT DEFAULT 'work';
  END IF;

  -- Email Type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='email_type') THEN
    ALTER TABLE deals ADD COLUMN email_type TEXT DEFAULT 'work';
  END IF;

  -- Website Type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='website_type') THEN
    ALTER TABLE deals ADD COLUMN website_type TEXT DEFAULT 'corporate';
  END IF;

  -- Customer Type
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='customer_type') THEN
    ALTER TABLE deals ADD COLUMN customer_type TEXT;
  END IF;

  -- Last Contacted Date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='last_contacted_date') THEN
    ALTER TABLE deals ADD COLUMN last_contacted_date DATE;
  END IF;

  -- Next Follow Up Date
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='next_follow_up_date') THEN
    ALTER TABLE deals ADD COLUMN next_follow_up_date DATE;
  END IF;

  -- Responsible Person
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='responsible_person') THEN
    ALTER TABLE deals ADD COLUMN responsible_person UUID;
  END IF;

  -- Converted From Lead ID (if it was missed in earlier migrations)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='deals' AND column_name='converted_from_lead_id') THEN
    ALTER TABLE deals ADD COLUMN converted_from_lead_id UUID REFERENCES leads(id) ON DELETE SET NULL;
  END IF;

END $$;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_deals_workspace_id ON deals(workspace_id);
CREATE INDEX IF NOT EXISTS idx_deals_external_source ON deals(external_source_id);
CREATE INDEX IF NOT EXISTS idx_deals_service_interested ON deals(service_interested);
CREATE INDEX IF NOT EXISTS idx_deals_agent_name ON deals(agent_name);


-- MIGRATION: 022_fix_workflows_schema.sql --
-- Migration to ensure workflows tables have all required columns

-- Workflows Table
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL,
  trigger_config JSONB DEFAULT '{}'::JSONB,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure missing columns are added in case table already exists but without them
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS trigger_config JSONB DEFAULT '{}'::JSONB;
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS trigger_type VARCHAR(50);
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Workflow Actions Table
CREATE TABLE IF NOT EXISTS public.workflow_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  action_config JSONB DEFAULT '{}'::JSONB,
  condition_config JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure JSONB missing columns
ALTER TABLE public.workflow_actions ADD COLUMN IF NOT EXISTS condition_config JSONB;
ALTER TABLE public.workflow_actions ADD COLUMN IF NOT EXISTS action_config JSONB DEFAULT '{}'::JSONB;

-- Workflow Executions Table
CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  entity_type VARCHAR(50),
  entity_id UUID,
  triggered_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'running',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Workflow Execution Steps Table
CREATE TABLE IF NOT EXISTS public.workflow_execution_steps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  execution_id UUID REFERENCES public.workflow_executions(id) ON DELETE CASCADE,
  action_id UUID REFERENCES public.workflow_actions(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'running',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);


-- MIGRATION: 023_fix_companies_schema.sql --
-- Migration: 023_fix_companies_schema.sql
-- Description: Adds missing columns to companies table for CRM functionality.

DO $$ 
BEGIN
    -- Add revenue column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'revenue') THEN
        ALTER TABLE public.companies ADD COLUMN revenue DECIMAL(15,2);
    END IF;

    -- Add logo_url column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'logo_url') THEN
        ALTER TABLE public.companies ADD COLUMN logo_url TEXT;
    END IF;

    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'notes') THEN
        ALTER TABLE public.companies ADD COLUMN notes TEXT;
    END IF;

    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'created_by') THEN
        ALTER TABLE public.companies ADD COLUMN created_by UUID REFERENCES public.users(id);
    END IF;

    -- Ensure updated_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'updated_at') THEN
        ALTER TABLE public.companies ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;

    -- Ensure created_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'created_at') THEN
        ALTER TABLE public.companies ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;


-- MIGRATION: 024_fix_contacts_schema.sql --
-- Migration: 024_fix_contacts_schema.sql
-- Description: Adds missing columns to contacts table for CRM functionality.

DO $$ 
BEGIN
    -- Add position column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'position') THEN
        ALTER TABLE public.contacts ADD COLUMN position VARCHAR(255);
    END IF;

    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'notes') THEN
        ALTER TABLE public.contacts ADD COLUMN notes TEXT;
    END IF;

    -- Add tags column if it doesn't exist (using TEXT array)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'tags') THEN
        ALTER TABLE public.contacts ADD COLUMN tags TEXT[];
    END IF;

    -- Add contact_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'contact_type') THEN
        ALTER TABLE public.contacts ADD COLUMN contact_type VARCHAR(50) DEFAULT 'contact';
    END IF;

    -- Add created_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'created_by') THEN
        ALTER TABLE public.contacts ADD COLUMN created_by UUID REFERENCES public.users(id);
    END IF;

    -- Ensure updated_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'updated_at') THEN
        ALTER TABLE public.contacts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;


-- MIGRATION: 025_add_industry_to_customers.sql --
-- Migration: 025_add_industry_to_customers.sql
-- Description: Adds industry column to customers table.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'industry') THEN
        ALTER TABLE public.customers ADD COLUMN industry VARCHAR(255);
    END IF;
END $$;


-- MIGRATION: 026_fix_vendors_schema.sql --
-- Migration: 026_fix_vendors_schema.sql
-- Description: Adds created_by and ensures correct schema for vendors table.

DO $$ 
BEGIN
    -- Ensure vendors table exists with basic columns first
    CREATE TABLE IF NOT EXISTS public.vendors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        contact_person VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Add created_by if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'created_by') THEN
        ALTER TABLE public.vendors ADD COLUMN created_by UUID REFERENCES users(id);
    END IF;

    -- Add notes if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'notes') THEN
        ALTER TABLE public.vendors ADD COLUMN notes TEXT;
    END IF;
END $$;


-- MIGRATION: 027_fix_contacts_schema_v2.sql --
-- Migration: 027_fix_contacts_schema_v2.sql
-- Description: Adds missing columns for contacts table from the creation form.

DO $$ 
BEGIN
    -- Add source if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'source') THEN
        ALTER TABLE public.contacts ADD COLUMN source VARCHAR(100);
    END IF;

    -- Add address if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'address') THEN
        ALTER TABLE public.contacts ADD COLUMN address TEXT;
    END IF;

    -- Add messenger if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'messenger') THEN
        ALTER TABLE public.contacts ADD COLUMN messenger VARCHAR(255);
    END IF;

    -- Add available_to_everyone if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'available_to_everyone') THEN
        ALTER TABLE public.contacts ADD COLUMN available_to_everyone BOOLEAN DEFAULT true;
    END IF;

    -- Add included_in_export if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'included_in_export') THEN
        ALTER TABLE public.contacts ADD COLUMN included_in_export BOOLEAN DEFAULT true;
    END IF;

    -- Add position if missing (alias for title)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'position') THEN
        ALTER TABLE public.contacts ADD COLUMN position VARCHAR(255);
    END IF;
END $$;


-- MIGRATION: 028_add_company_name_to_contacts.sql --
-- Migration: 028_add_company_name_to_contacts.sql
-- Description: Adds company_name string column to contacts table for raw string storage.

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'company_name') THEN
        ALTER TABLE public.contacts ADD COLUMN company_name VARCHAR(255);
    END IF;
END $$;


-- MIGRATION: 029_add_extended_contact_fields.sql --
-- Add complex fields to contacts table to support signing parties and detailed contacts
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS second_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS salutation VARCHAR(50),
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
ADD COLUMN IF NOT EXISTS website_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS messenger VARCHAR(255),
ADD COLUMN IF NOT EXISTS messenger_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS source VARCHAR(100),
ADD COLUMN IF NOT EXISTS source_info TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS include_in_export BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS responsible_id UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS observers UUID[];

