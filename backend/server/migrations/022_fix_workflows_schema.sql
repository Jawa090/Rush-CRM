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
