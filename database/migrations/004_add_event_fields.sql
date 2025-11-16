-- Migration: Add description, start_date, and end_date to community_events table
-- Created: 2024-11-16

-- Add description column
ALTER TABLE community_events 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add start_date column (using TEXT to match other date columns)
ALTER TABLE community_events 
ADD COLUMN IF NOT EXISTS start_date TEXT;

-- Add end_date column (using TEXT to match other date columns)
ALTER TABLE community_events 
ADD COLUMN IF NOT EXISTS end_date TEXT;

-- Populate start_date and end_date from existing date column for backward compatibility
UPDATE community_events 
SET start_date = date 
WHERE start_date IS NULL AND date IS NOT NULL;

UPDATE community_events 
SET end_date = date 
WHERE end_date IS NULL AND date IS NOT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_community_events_start_date ON community_events(start_date);
CREATE INDEX IF NOT EXISTS idx_community_events_end_date ON community_events(end_date);
