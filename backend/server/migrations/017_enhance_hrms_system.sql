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