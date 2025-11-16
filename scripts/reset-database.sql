-- Complete Database Reset Script
-- WARNING: This will DELETE ALL DATA in your database!
-- Only run this if you want to start completely fresh

-- Step 1: Drop all tables
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS community_events CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS prayer_times CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS mosques CASCADE;

-- Step 2: After running this, execute the following commands in your terminal:
-- npm run setup-db
-- npm run migrate
-- npm run create-admin

-- This will create a fresh database with:
-- - All tables with proper schema
-- - Admin user with role = 'Admin'
-- - Username = 'admin'
-- - Password = 'password123'
