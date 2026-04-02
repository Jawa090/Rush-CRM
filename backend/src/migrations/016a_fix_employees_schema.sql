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
