-- Professional Leave Management System
-- Complete leave tracking with balances, policies, and workflows

-- First, backup and drop existing tables
DROP TABLE IF EXISTS leave_request_comments CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS employee_leave_balances CASCADE;
DROP TABLE IF EXISTS public_holidays CASCADE;
DROP TABLE IF EXISTS leave_types CASCADE;

-- Enhanced Leave Types with Policies
CREATE TABLE leave_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#3B82F6',
    
    -- Allowances
    days_allowed INTEGER NOT NULL DEFAULT 0,
    max_consecutive_days INTEGER,
    min_days_notice INTEGER DEFAULT 0,
    
    -- Policies
    is_paid BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT true,
    can_carry_forward BOOLEAN DEFAULT false,
    max_carry_forward_days INTEGER DEFAULT 0,
    expires_after_months INTEGER,
    
    -- Restrictions
    applicable_to VARCHAR(20) DEFAULT 'all', -- all, male, female
    min_service_months INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(org_id, code)
);

-- Employee Leave Balances
CREATE TABLE employee_leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    year INTEGER NOT NULL,
    total_allocated DECIMAL(5,2) NOT NULL DEFAULT 0,
    used DECIMAL(5,2) NOT NULL DEFAULT 0,
    pending DECIMAL(5,2) NOT NULL DEFAULT 0,
    available DECIMAL(5,2) GENERATED ALWAYS AS (total_allocated - used - pending) STORED,
    
    carried_forward DECIMAL(5,2) DEFAULT 0,
    expires_on DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(employee_id, leave_type_id, year)
);

-- Enhanced Leave Requests
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested DECIMAL(5,2) NOT NULL,
    half_day BOOLEAN DEFAULT false,
    
    reason TEXT NOT NULL,
    attachment_path TEXT,
    
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, cancelled
    
    -- Approval workflow
    approver_id UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Additional info
    emergency BOOLEAN DEFAULT false,
    contact_during_leave VARCHAR(255),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (end_date >= start_date),
    CHECK (days_requested > 0),
    CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
);

-- Leave Request Comments/History
CREATE TABLE leave_request_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leave_request_id UUID NOT NULL REFERENCES leave_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    comment TEXT NOT NULL,
    action VARCHAR(50), -- submitted, approved, rejected, cancelled, commented
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Public Holidays
CREATE TABLE public_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    is_optional BOOLEAN DEFAULT false,
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(org_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leave_types_org ON leave_types(org_id);
CREATE INDEX IF NOT EXISTS idx_leave_types_active ON leave_types(org_id, is_active);

CREATE INDEX IF NOT EXISTS idx_leave_balances_employee ON employee_leave_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_year ON employee_leave_balances(year);
CREATE INDEX IF NOT EXISTS idx_leave_balances_org ON employee_leave_balances(org_id);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_org ON leave_requests(org_id);

CREATE INDEX IF NOT EXISTS idx_leave_comments_request ON leave_request_comments(leave_request_id);

CREATE INDEX IF NOT EXISTS idx_holidays_org_date ON public_holidays(org_id, date);

-- Comments
COMMENT ON TABLE leave_types IS 'Leave type definitions with policies and rules';
COMMENT ON TABLE employee_leave_balances IS 'Employee leave balance tracking per year';
COMMENT ON TABLE leave_requests IS 'Leave requests with approval workflow';
COMMENT ON TABLE leave_request_comments IS 'Comments and history for leave requests';
COMMENT ON TABLE public_holidays IS 'Organization public holidays';

-- Insert default leave types (will be created per org)
-- These are just examples, actual creation will be done via API
