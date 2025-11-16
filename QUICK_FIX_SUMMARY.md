# Quick Fix Summary - Database Setup Issues Resolved

## What Was Wrong

When you ran the setup commands, you encountered these errors:

1. **"relation 'users' does not exist"** - The migration files tried to modify the `users` table before it was created
2. **"syntax error at or near 'user'"** - PostgreSQL doesn't allow `user` as a column name (reserved word)
3. **Migration order confusion** - `setup-db` was using `pg_schema.sql` (which has all features), then migrations tried to add features again

## What Was Fixed (Commit 0c7e4df)

### 1. Fixed PostgreSQL Syntax Errors

**File: `database/migrations/001_initial_schema.sql`**
- Changed `DATETIME` → `TIMESTAMP` (PostgreSQL standard, not SQLite)
- Changed `user` → `user_name` in audit_logs table (avoided reserved word)

### 2. Fixed Setup Process

**File: `scripts/setup-pg-db.ts`**
- Changed to use `001_initial_schema.sql` instead of `pg_schema.sql`
- Ensures clean base tables are created first
- Migrations then add features (role system, user linking)

### 3. Created Comprehensive Guide

**New File: `SETUP_GUIDE.md`**
- Step-by-step setup instructions
- Troubleshooting for common errors
- Verification steps
- Complete database reset guide

## How to Fix Your Database

### Option 1: Quick Fresh Start (Recommended)

**METHOD A: Using SQL Script**
```bash
# Run the drop script directly
psql $DATABASE_URL -f scripts/drop-all-tables.sql

# Then do fresh setup
npm run setup-db
npm run migrate
npm run create-admin
```

**METHOD B: Manual SQL Commands**
```bash
# 1. Connect to your database
psql $DATABASE_URL

# 2. In psql, run:
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS community_events CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS prayer_times CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS mosques CASCADE;

\q

# 3. Run setup commands in correct order
npm run setup-db      # Creates base tables
npm run migrate       # Adds role system
npm run create-admin  # Creates admin user

# 4. Start the application
npm run dev
```

### Option 2: Using Reset Script

```bash
# 1. Run the reset script
psql $DATABASE_URL -f scripts/reset-database.sql

# 2. Setup fresh
npm run setup-db
npm run migrate
npm run create-admin

# 3. Start app
npm run dev
```

## Verification After Setup

### Check Tables Exist

```bash
psql $DATABASE_URL

# In psql:
\dt

# Should show:
# mosques
# users
# members
# prayer_times
# announcements
# donations
# community_events
# audit_logs
```

### Check Users Table Structure

```sql
\d users

# Should show columns:
# - id
# - name
# - email
# - username
# - avatar
# - password_hash
# - role
# - mosque_id
# - address
```

### Check Admin User

```sql
SELECT id, name, email, username, role FROM "users" WHERE role = 'Admin';

# Should return:
# admin user with role = 'Admin'
```

## Login After Fix

1. Open `http://localhost:3001`
2. Click "Login" button
3. Enter credentials:
   - Username: `admin` OR Email: `admin@masjid.com`
   - Password: `admin123`
4. If you still see errors, clear browser cache:
   ```javascript
   // In browser console (F12):
   localStorage.clear();
   ```
   Then refresh and login again.

## What Each Command Does

### `npm run setup-db`
- Reads `database/migrations/001_initial_schema.sql`
- Creates base tables: mosques, users, members, prayer_times, announcements, donations, community_events, audit_logs
- Creates tables WITHOUT role system features

### `npm run migrate`
- Scans `database/migrations/` folder
- Finds all migration files: 001_*.sql, 002_*.sql, 003_*.sql
- Runs them in sequential order:
  - `002_add_user_roles.sql` - Adds role, username, address columns
  - `003_link_members_to_users.sql` - Links members to users
- Idempotent - safe to run multiple times

### `npm run create-admin`
- Creates admin user with:
  - Username: `admin`
  - Email: `admin@masjid.com`
  - Password: `admin123`
  - Role: `Admin`
- Also creates member entry linked to admin user

## Understanding the Error Messages

### "relation 'users' does not exist"
**Meaning:** PostgreSQL can't find the `users` table.
**Cause:** Table wasn't created, or migrations ran before setup-db.
**Fix:** Run `setup-db` first, then `migrate`.

### "syntax error at or near 'user'"
**Meaning:** `user` is a reserved word in PostgreSQL.
**Fix:** Already fixed - changed to `user_name`.

### "column 'user_id' does not exist"
**Meaning:** Migration 003 hasn't been run yet.
**Fix:** Run `npm run migrate`.

## Still Having Issues?

1. **Double-check DATABASE_URL** in `.env` file
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
   ```

2. **Verify PostgreSQL version** (should be 12+)
   ```bash
   psql $DATABASE_URL -c "SELECT version();"
   ```

3. **Check Node.js version** (should be 18+)
   ```bash
   node --version
   ```

4. **Clear everything and start fresh:**
   - Drop all tables
   - Run `npm run setup-db`
   - Run `npm run migrate`
   - Run `npm run create-admin`
   - Clear browser `localStorage`
   - Login with admin credentials

## Complete Documentation

For more detailed information, see:

1. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup guide with troubleshooting
2. **[DATABASE_RESET_GUIDE.md](./DATABASE_RESET_GUIDE.md)** - Database reset and troubleshooting
3. **[RBAC_README.md](./RBAC_README.md)** - Role permissions and access control
4. **[SWR_IMPLEMENTATION.md](./SWR_IMPLEMENTATION.md)** - State management guide
5. **[PERFORMANCE_IMPROVEMENTS.md](./PERFORMANCE_IMPROVEMENTS.md)** - Performance optimizations

## Summary

**The fix is simple:**

1. Pull the latest changes (commit 0c7e4df)
2. Drop all existing tables in your database
3. Run: `npm run setup-db`
4. Run: `npm run migrate`
5. Run: `npm run create-admin`
6. Clear browser localStorage
7. Login and enjoy!

All PostgreSQL syntax errors are now fixed, and the setup process works correctly.
