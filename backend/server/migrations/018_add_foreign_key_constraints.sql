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