# Database Reset Guide

This guide will help you completely reset your database and set it up fresh with proper role configuration.

## Issue

Your admin user has the wrong role ('Muazzin' instead of 'Admin'). This can happen if:
1. The migration wasn't run before creating the admin user
2. The admin was created without the role field
3. Manual database changes didn't persist correctly

## Solution: Complete Database Reset

### Step 1: Drop All Tables

Connect to your PostgreSQL database and run these commands to completely reset:

```sql
-- Drop all tables (this will delete ALL data!)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS community_events CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS prayer_times CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS mosques CASCADE;
```

### Step 2: Set Up Fresh Database

Run the setup script to create all tables with the latest schema:

```bash
npm run setup-db
```

This will create all tables including the new fields (role, username, address).

### Step 3: Run Migration (Optional but Recommended)

Even though setup-db creates tables with the new schema, run the migration for consistency:

```bash
npm run migrate
```

### Step 4: Create Admin User with Proper Role

Run the updated admin creation script:

```bash
npm run create-admin
```

This will create an admin user with:
- Username: `admin`
- Email: `admin@masjid.com`
- Password: `password123`
- **Role: `Admin`** (properly set)

## Alternative: Quick SQL Fix

If you don't want to reset everything and just want to fix the role for an existing user:

```sql
-- Update the admin user's role and add username
UPDATE "users" 
SET 
    role = 'Admin',
    username = 'admin'
WHERE email = 'admin@masjid.com';

-- Verify the change
SELECT id, name, email, username, role, mosque_id FROM "users" WHERE email = 'admin@masjid.com';
```

## Verify Your Database

After setup, verify everything is correct:

```sql
-- Check the users table structure
\d "users"

-- Check your admin user
SELECT id, name, email, username, role, mosque_id FROM "users";

-- Check if mosques exist
SELECT * FROM mosques;
```

## Expected Result

Your admin user should have:
- ✅ `role = 'Admin'`
- ✅ `username = 'admin'`
- ✅ `email = 'admin@masjid.com'`
- ✅ Access to all menu items
- ✅ Ability to switch between mosques

## Troubleshooting

### Issue: "relation does not exist"
- Run `npm run setup-db` first

### Issue: Role still shows as 'Muazzin' after update
- Clear your browser's localStorage: `localStorage.clear()`
- Log out and log in again
- Check if the database was actually updated with the SQL query above

### Issue: Can't see menu items after login
- This is fixed in the latest code (users without role default to Admin)
- But it's better to have the role properly set in the database

### Issue: Connection refused or authentication failed
- Check your `.env` file has the correct `DATABASE_URL`
- Make sure your database server is running

## Quick Commands Summary

```bash
# Full reset process
npm run setup-db      # Creates fresh tables
npm run migrate       # Applies migrations
npm run create-admin  # Creates admin with proper role

# Or manually in SQL
# DROP TABLE IF EXISTS... (all tables)
# Then run setup-db
```
