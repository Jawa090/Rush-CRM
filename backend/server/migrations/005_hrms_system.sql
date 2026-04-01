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
SELECT DISTINCT org_id, user_id, 'Annual Leave', 25
FROM users 
WHERE NOT EXISTS (
  SELECT 1 FROM leave_types 
  WHERE leave_types.org_id = users.org_id 
  AND leave_types.name = 'Annual Leave'
);

INSERT INTO leave_types (org_id, user_id, name, days_allowed)
SELECT DISTINCT org_id, user_id, 'Sick Leave', 10
FROM users 
WHERE NOT EXISTS (
  SELECT 1 FROM leave_types 
  WHERE leave_types.org_id = users.org_id 
  AND leave_types.name = 'Sick Leave'
);

INSERT INTO leave_types (org_id, user_id, name, days_allowed)
SELECT DISTINCT org_id, user_id, 'Personal Leave', 5
FROM users 
WHERE NOT EXISTS (
  SELECT 1 FROM leave_types 
  WHERE leave_types.org_id = users.org_id 
  AND leave_types.name = 'Personal Leave'
);

INSERT INTO leave_types (org_id, user_id, name, days_allowed)
SELECT DISTINCT org_id, user_id, 'Emergency Leave', 3
FROM users 
WHERE NOT EXISTS (
  SELECT 1 FROM leave_types 
  WHERE leave_types.org_id = users.org_id 
  AND leave_types.name = 'Emergency Leave'
);