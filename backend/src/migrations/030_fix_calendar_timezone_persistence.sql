-- Migration: Fix Calendar Timezone Persistence
-- Description: Convert TIMESTAMP columns to TIMESTAMPTZ to ensure timezone information is preserved correctly.
-- Created: 2026-04-02

-- Update calendar_events table
ALTER TABLE calendar_events 
  ALTER COLUMN start_time TYPE TIMESTAMPTZ,
  ALTER COLUMN end_time TYPE TIMESTAMPTZ,
  ALTER COLUMN created_at TYPE TIMESTAMPTZ,
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ;

-- Update calendar_connections table
ALTER TABLE calendar_connections
  ALTER COLUMN expires_at TYPE TIMESTAMPTZ,
  ALTER COLUMN last_sync_at TYPE TIMESTAMPTZ,
  ALTER COLUMN created_at TYPE TIMESTAMPTZ,
  ALTER COLUMN updated_at TYPE TIMESTAMPTZ;

-- Update event_attendees table
ALTER TABLE event_attendees
  ALTER COLUMN response_time TYPE TIMESTAMPTZ,
  ALTER COLUMN created_at TYPE TIMESTAMPTZ;
