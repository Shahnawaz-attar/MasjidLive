-- Migration: Link members to users
-- This allows members who are also system users (Imam, Muazzin, Admin) to be identified
-- and protected from being edited/deleted by other admins

-- Add user_id column to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "users"(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);

-- Add comment to explain the purpose
COMMENT ON COLUMN members.user_id IS 'Links member to a system user account (Imam, Muazzin, Admin). If set, this member cannot be edited/deleted by admins.';
