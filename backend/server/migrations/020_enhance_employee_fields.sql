-- Migration: Enhance Employee Fields for Complete HR Management
-- Date: 2026-04-01
-- Description: Adds comprehensive employee fields including CNIC, pictures, documents, etc.

-- Add new columns to employees table (Part 1 - Personal Info)
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS cnic VARCHAR(20),
ADD COLUMN IF NOT EXISTS cnic_picture TEXT,
ADD COLUMN IF NOT EXISTS profile_picture TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS secondary_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS official_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS personal_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS religion VARCHAR(50);
-- Add probation and employment fields
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS probation_status VARCHAR(50) DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS probation_end_date DATE,
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS base_salary DECIMAL(12,2);
-- Add emergency contact fields
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS emergency_contact_relation VARCHAR(100),
ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10),
ADD COLUMN IF NOT EXISTS marital_status VARCHAR(20),
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);
-- Add address fields
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS permanent_address TEXT,
ADD COLUMN IF NOT EXISTS current_address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Pakistan';
-- Add banking fields
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS bank_account_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS social_security_number VARCHAR(50);
-- Add education and experience fields
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS education_level VARCHAR(100),
ADD COLUMN IF NOT EXISTS university VARCHAR(255),
ADD COLUMN IF NOT EXISTS degree VARCHAR(255),
ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
ADD COLUMN IF NOT EXISTS previous_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS previous_position VARCHAR(255),
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
ADD COLUMN IF NOT EXISTS skills TEXT,
ADD COLUMN IF NOT EXISTS certifications TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS termination_date DATE,
ADD COLUMN IF NOT EXISTS termination_reason TEXT;

-- Create employee documents table
CREATE TABLE IF NOT EXISTS employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type VARCHAR(50),
    
    issue_date DATE,
    expiry_date DATE,
    document_number VARCHAR(100),
    
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    notes TEXT,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_employee_documents_employee ON employee_documents(employee_id);
CREATE INDEX idx_employee_documents_org ON employee_documents(org_id);
CREATE INDEX idx_employee_documents_type ON employee_documents(document_type);

-- Create employee salary history table
CREATE TABLE IF NOT EXISTS employee_salary_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    previous_salary DECIMAL(12,2),
    new_salary DECIMAL(12,2) NOT NULL,
    increment_percentage DECIMAL(5,2),
    increment_amount DECIMAL(12,2),
    
    effective_date DATE NOT NULL,
    reason VARCHAR(255),
    notes TEXT,
    
    approved_by UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_salary_history_employee ON employee_salary_history(employee_id);
CREATE INDEX idx_salary_history_org ON employee_salary_history(org_id);
CREATE INDEX idx_salary_history_date ON employee_salary_history(effective_date DESC);

-- Create employee performance reviews table
CREATE TABLE IF NOT EXISTS employee_performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    review_date DATE NOT NULL,
    
    reviewer_id UUID NOT NULL REFERENCES users(id),
    
    overall_rating INTEGER,
    technical_skills_rating INTEGER,
    communication_rating INTEGER,
    teamwork_rating INTEGER,
    punctuality_rating INTEGER,
    
    strengths TEXT,
    areas_for_improvement TEXT,
    goals TEXT,
    comments TEXT,
    
    employee_comments TEXT,
    employee_acknowledged_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_performance_reviews_employee ON employee_performance_reviews(employee_id);
CREATE INDEX idx_performance_reviews_org ON employee_performance_reviews(org_id);
CREATE INDEX idx_performance_reviews_date ON employee_performance_reviews(review_date DESC);

-- Create employee training records table
CREATE TABLE IF NOT EXISTS employee_training_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    training_name VARCHAR(255) NOT NULL,
    training_provider VARCHAR(255),
    training_type VARCHAR(100),
    
    start_date DATE NOT NULL,
    end_date DATE,
    duration_hours INTEGER,
    
    status VARCHAR(50) DEFAULT 'scheduled',
    completion_percentage INTEGER DEFAULT 0,
    
    certificate_issued BOOLEAN DEFAULT false,
    certificate_path TEXT,
    certificate_number VARCHAR(100),
    
    cost DECIMAL(10,2),
    notes TEXT,
    
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_training_records_employee ON employee_training_records(employee_id);
CREATE INDEX idx_training_records_org ON employee_training_records(org_id);
CREATE INDEX idx_training_records_status ON employee_training_records(status);

-- Create indexes for new employee fields
CREATE INDEX IF NOT EXISTS idx_employees_cnic ON employees(cnic) WHERE cnic IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_official_email ON employees(official_email) WHERE official_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_probation ON employees(probation_status) WHERE probation_status = 'on_probation';
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_dob ON employees(date_of_birth);

-- Add comments for documentation
COMMENT ON COLUMN employees.cnic IS 'National Identity Card Number (Pakistan CNIC)';
COMMENT ON COLUMN employees.cnic_picture IS 'Path to CNIC image file';
COMMENT ON COLUMN employees.profile_picture IS 'Path to employee profile picture';
COMMENT ON COLUMN employees.probation_status IS 'Employee probation period status';
COMMENT ON COLUMN employees.commission_rate IS 'Commission percentage for sales employees';
COMMENT ON COLUMN employees.base_salary IS 'Base monthly salary amount';

COMMENT ON TABLE employee_documents IS 'Stores all employee-related documents and certificates';
COMMENT ON TABLE employee_salary_history IS 'Tracks salary changes and increments over time';
COMMENT ON TABLE employee_performance_reviews IS 'Employee performance review records';
COMMENT ON TABLE employee_training_records IS 'Employee training and development records';
