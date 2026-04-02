-- Payroll System Tables

-- Salary Components (Basic, Allowances, Deductions)
CREATE TABLE IF NOT EXISTS salary_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'earning' or 'deduction'
  is_percentage BOOLEAN DEFAULT false,
  amount NUMERIC(10,2) DEFAULT 0,
  percentage NUMERIC(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee Salary Structure
CREATE TABLE IF NOT EXISTS employee_salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  basic_salary NUMERIC(10,2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Salary Slips
CREATE TABLE IF NOT EXISTS salary_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  basic_salary NUMERIC(10,2) NOT NULL,
  total_earnings NUMERIC(10,2) DEFAULT 0,
  total_deductions NUMERIC(10,2) DEFAULT 0,
  net_salary NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  generated_by UUID,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP,
  UNIQUE(org_id, employee_id, month, year)
);

-- Salary Slip Line Items
CREATE TABLE IF NOT EXISTS salary_slip_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salary_slip_id UUID NOT NULL,
  component_name VARCHAR(255) NOT NULL,
  component_type VARCHAR(50) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_salary_components_org ON salary_components(org_id);
CREATE INDEX IF NOT EXISTS idx_employee_salaries_employee ON employee_salaries(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_slips_employee ON salary_slips(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_slips_month_year ON salary_slips(month, year);
