# Database Reset and Migration Guide

## Quick Navigation
- [Reset Database](#reset-database)
- [Run Migrations](#run-migrations)
- [Fix User_ID Column Error](#fix-user_id-column-error)
- [Common Issues](#common-issues)

## Fix User_ID Column Error

**Error Message:** `column "user_id" of relation "members" does not exist`

**Solution:** Run the migration to add the `user_id` column:

```bash
# Make sure you're in the project directory
cd /path/to/MasjidLive

# Run all migrations
npm run migrate
```

The migration will:
1. Add `user_id` column to members table
2. Create index for better performance
3. Link existing users to members (if any)

## Run Migrations

**For new installations:**
```bash
npm install
npm run setup-db      # Creates initial schema
npm run migrate       # Runs all migrations (002_add_user_roles.sql, 003_link_members_to_users.sql)
npm run create-admin  # Creates admin user
```

**For existing installations:**
```bash
npm run migrate       # Runs all pending migrations
```

## Reset Database

### Option 1: Quick SQL Reset (Recommended)

1. Open your Neon/PostgreSQL database console
2. Run this SQL script:

```sql
-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS prayer_times CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS mosques CASCADE;

-- Verify tables are dropped
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

3. Then set up fresh:
```bash
npm run setup-db
npm run migrate
npm run create-admin
```

### Option 2: Using Reset Script

```bash
# Connect to your database and run the reset script
psql $DATABASE_URL -f scripts/reset-database.sql

# Then set up fresh
npm run setup-db
npm run migrate
npm run create-admin
```

### Option 3: Manual Reset via Database Console

If you're using Neon, Railway, or Supabase:

1. Go to your database dashboard
2. Navigate to SQL Editor
3. Copy and paste the SQL from `scripts/reset-database.sql`
4. Execute the script
5. Run setup commands:
   ```bash
   npm run setup-db
   npm run migrate
   npm run create-admin
   ```

## After Database Reset

**Important:** Clear your browser data:

1. Open browser developer console (F12)
2. Run this JavaScript:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```
3. Close and reopen the browser
4. Go to the application URL
5. Click "Login" (previously "Admin Login")
6. Use credentials:
   - **Username:** admin
   - **Email:** admin@masjid.com  
   - **Password:** password123

## Common Issues

### Issue 1: "role for admin is wrong"

**Symptom:** Admin shows as 'Muazzin' instead of 'Admin'

**Solution:**
```bash
# Easiest fix - just re-run create-admin
npm run create-admin
```

OR run this SQL:
```sql
UPDATE "users" 
SET role = 'Admin', username = 'admin' 
WHERE email = 'admin@masjid.com';
```

Then clear localStorage:
```javascript
localStorage.clear();
```

### Issue 2: "column user_id does not exist"

**Symptom:** Error when registering or viewing members

**Solution:**
```bash
npm run migrate
```

This runs the `003_link_members_to_users.sql` migration.

### Issue 3: "Username already exists"

**Symptom:** Cannot create admin or register user

**Solution:** Check existing users:
```sql
SELECT id, name, username, role FROM "users";
```

Delete duplicate if needed:
```sql
DELETE FROM "users" WHERE username = 'admin' AND role != 'Admin';
```

### Issue 4: Can't see menu items after login

**Symptom:** Sidebar is empty after logging in

**Causes:**
1. Role field is NULL or wrong
2. LocalStorage has stale data

**Solution:**
```bash
# Fix role
npm run create-admin

# Then in browser console:
localStorage.clear();
```

### Issue 5: Members not showing/updating

**Symptom:** Members list doesn't update when switching mosques

**Cause:** SWR cache issue or missing user_id column

**Solution:**
```bash
# Run migration first
npm run migrate

# Then in browser, hard refresh:
# Ctrl+Shift+R (Windows/Linux)
# Cmd+Shift+R (Mac)
```

## Verification Steps

After reset and setup, verify everything works:

### 1. Check Database Schema
```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should show:
-- announcements
-- audit_logs
-- donations
-- events
-- members
-- mosques
-- prayer_times
-- users
```

### 2. Check Admin User
```sql
SELECT id, name, username, email, role, mosque_id 
FROM "users" 
WHERE role = 'Admin';

-- Should show one admin user with:
-- username: admin
-- role: Admin
```

### 3. Check Members Table
```sql
-- Check members table has user_id column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'members';

-- Should include user_id column
```

### 4. Test Login
1. Go to app URL
2. Click "Login"
3. Enter: admin / password123
4. Should see dashboard with all menu items

### 5. Test Registration
1. Logout
2. Click "Register"
3. Fill form as Imam or Muazzin
4. Should create user and auto-create member entry

## Migration Scripts

### Available Migrations:

1. **001_initial_schema.sql** - Already in pg_schema.sql (initial tables)
2. **002_add_user_roles.sql** - Adds role, username, address to users table
3. **003_link_members_to_users.sql** - Adds user_id to members table

### How Migrations Work:

The `npm run migrate` command:
1. Reads all `*.sql` files from `database/migrations/`
2. Skips `pg_schema.sql` (initial schema)
3. Runs migrations in order (002, 003, etc.)
4. Each migration is idempotent (safe to run multiple times)

### Check Migration Status:

```sql
-- Check if role column exists in users
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Check if user_id column exists in members
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'members' AND column_name = 'user_id';

-- Check if username column exists in users
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'username';
```

## Need Help?

If you're still having issues:

1. Check the console for errors (F12 → Console tab)
2. Check network tab for failed API calls
3. Verify DATABASE_URL environment variable is set correctly
4. Make sure PostgreSQL database is accessible
5. Check server logs: `npm run dev` and look for errors

## Clean Slate Setup (Complete Reset)

For a completely fresh start:

```bash
# 1. Stop the development server if running
# Press Ctrl+C in terminal

# 2. Reset database (using database console)
# Run the DROP TABLE commands from Option 1 above

# 3. Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 4. Set up fresh
npm run setup-db
npm run migrate
npm run create-admin

# 5. Start server
npm run dev

# 6. In browser:
localStorage.clear();
# Then refresh and login
```

Done! Your database should now be completely reset and ready to use.

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
