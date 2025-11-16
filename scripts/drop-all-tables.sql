-- Drop All Tables Script
-- Run this to completely reset your database before fresh setup
-- WARNING: This will delete ALL data!

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS community_events CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS prayer_times CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS mosques CASCADE;

-- Verify all tables are dropped
-- Run: \dt in psql to see remaining tables (should be empty)
