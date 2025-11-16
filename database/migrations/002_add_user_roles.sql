-- Migration: Add role-based fields to users table

-- Add role column
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS role TEXT CHECK(role IN ('Admin', 'Imam', 'Muazzin')) DEFAULT 'Muazzin';

-- Add username column
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add address column
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS address TEXT;

-- Make email optional (allow NULL)
ALTER TABLE "users" ALTER COLUMN email DROP NOT NULL;

-- Update existing users to have Admin role
UPDATE "users" SET role = 'Admin' WHERE role IS NULL;

-- Update existing users to have username if they don't have one (use part of email)
UPDATE "users" SET username = split_part(email, '@', 1) WHERE username IS NULL;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON "users"(username);

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON "users"(role);
