-- =====================================================
-- Migration: Create Employee Product Assignments Table
-- Description: Track product assignments to employees
-- Date: 2026-04-02
-- =====================================================

CREATE TABLE IF NOT EXISTS employee_product_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  employee_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(50) DEFAULT 'assigned',
  assigned_date DATE DEFAULT CURRENT_DATE,
  return_date DATE,
  condition_at_assignment VARCHAR(100),
  condition_at_return VARCHAR(100),
  notes TEXT,
  assigned_by UUID,
  returned_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_epa_org_id ON employee_product_assignments(org_id);
CREATE INDEX IF NOT EXISTS idx_epa_employee_id ON employee_product_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_epa_product_id ON employee_product_assignments(product_id);
CREATE INDEX IF NOT EXISTS idx_epa_status ON employee_product_assignments(status);

-- =====================================================
-- End of Migration
-- =====================================================
