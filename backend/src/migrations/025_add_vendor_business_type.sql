-- Add business_type and rating columns to vendors table

ALTER TABLE vendors ADD COLUMN IF NOT EXISTS business_type VARCHAR(255);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 4.0;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add index for business_type
CREATE INDEX IF NOT EXISTS idx_vendors_business_type ON vendors(business_type);
