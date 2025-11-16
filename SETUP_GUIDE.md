# Complete Setup Guide for Masjid Manager

This guide will walk you through setting up the Masjid Manager application from scratch.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon, Supabase, or local PostgreSQL)
- DATABASE_URL environment variable configured

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
PORT=3001
```

### 3. Setup Database Schema

This creates all the required tables (mosques, users, members, prayer_times, etc.):

```bash
npm run setup-db
```

**What this does:**
- Creates the `users` table with authentication fields
- Creates the `mosques` table
- Creates all other tables (members, prayer_times, announcements, donations, community_events, audit_logs)

### 4. Run Database Migrations

This adds additional columns and features to the database:

```bash
npm run migrate
```

**What this does:**
- Runs `002_add_user_roles.sql` - Adds role, username, and address columns to users table
- Runs `003_link_members_to_users.sql` - Links members table to users table
- The migration runner automatically detects and runs ALL migration files in sequential order

**Important:** You must run migrations AFTER `setup-db` to add the role-based access control features.

### 5. Create Admin User

Create your first admin user who can access the dashboard:

```bash
npm run create-admin
```

**Default Credentials:**
- Username: `admin`
- Email: `admin@masjid.com`
- Password: `admin123`

**Important:** Change these credentials immediately after first login!

### 6. Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## Complete Fresh Setup (One Command at a Time)

If you're setting up from scratch, run these commands in order:

```bash
# 1. Install dependencies
npm install

# 2. Setup database tables
npm run setup-db

# 3. Run migrations (adds role system)
npm run migrate

# 4. Create admin user
npm run create-admin

# 5. Start the app
npm run dev
```

## Troubleshooting

### Issue: "relation 'users' does not exist"

**Cause:** You ran `migrate` before `setup-db`, or `setup-db` failed.

**Solution:**
```bash
# Drop all tables and start fresh
# Connect to your database and run:
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS community_events CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS prayer_times CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS mosques CASCADE;

# Then run setup again:
npm run setup-db
npm run migrate
npm run create-admin
```

### Issue: "column 'user_id' does not exist"

**Cause:** Migration 003 was not run.

**Solution:**
```bash
npm run migrate
```

### Issue: "syntax error at or near 'user'"

**Cause:** Old migration file with PostgreSQL reserved word.

**Solution:** Already fixed in commit. Just run:
```bash
npm run setup-db
npm run migrate
```

### Issue: Admin role showing as "Muazzin"

**Cause:** Admin user created before migration was run.

**Solution:**
```bash
# Re-run create-admin after migration
npm run migrate
npm run create-admin

# Then clear browser cache
# In browser console:
localStorage.clear()
```

### Issue: TypeScript errors during build

**Cause:** Dependencies not installed or outdated.

**Solution:**
```bash
npm install
npm run build
```

## Database Reset (Complete Fresh Start)

If you want to completely reset your database and start over:

### Option 1: Using SQL Script

```bash
# Connect to your database
psql $DATABASE_URL

# Run the reset script
\i scripts/reset-database.sql

# Exit psql
\q

# Setup again
npm run setup-db
npm run migrate
npm run create-admin
```

### Option 2: Manual Drop Tables

Connect to your database and run:

```sql
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS community_events CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS prayer_times CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS mosques CASCADE;
```

Then run:
```bash
npm run setup-db
npm run migrate
npm run create-admin
```

## Verification

After setup, verify everything is working:

### 1. Check Database Tables

Connect to your database and run:

```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show:
-- announcements
-- audit_logs
-- community_events
-- donations
-- members
-- mosques
-- prayer_times
-- users

-- Check users table has role column
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users';

-- Should include: id, name, email, username, avatar, password_hash, role, mosque_id, address
```

### 2. Check Admin User

```sql
SELECT id, name, email, username, role FROM "users" WHERE role = 'Admin';

-- Should return your admin user with role = 'Admin'
```

### 3. Test Login

1. Open `http://localhost:3001`
2. Click "Login" (top right)
3. Enter admin credentials
4. You should see the dashboard with all menu items

## Next Steps

After successful setup:

1. **Change Admin Password** - Go to Profile page and update your password
2. **Add Your First Mosque** - Go to Mosques page and add your mosque
3. **Register Imam/Muazzin Users** - They can register themselves via the Register page
4. **Add Members** - Go to Members page to add community members
5. **Set Prayer Times** - Configure prayer times for your mosque
6. **Post Announcements** - Start communicating with your community

## Role-Based Access

The system has three roles:

- **Admin**: Full access to everything, can manage mosques
- **Imam**: Full access to mosque management except mosque creation/deletion
- **Muazzin**: Can manage prayer times, announcements, donations, events, profile (read-only access to members)

See [RBAC_README.md](./RBAC_README.md) for complete permissions matrix.

## Additional Documentation

- [RBAC_README.md](./RBAC_README.md) - Role permissions and access control
- [DATABASE_RESET_GUIDE.md](./DATABASE_RESET_GUIDE.md) - Database troubleshooting
- [SWR_IMPLEMENTATION.md](./SWR_IMPLEMENTATION.md) - State management guide
- [MEMBER_USER_LINKING.md](./MEMBER_USER_LINKING.md) - Member-user relationship
- [PERFORMANCE_IMPROVEMENTS.md](./PERFORMANCE_IMPROVEMENTS.md) - Performance optimizations

## Support

If you encounter any issues not covered in this guide, please:

1. Check the troubleshooting section above
2. Review the error messages carefully
3. Ensure all setup steps were completed in order
4. Check that your DATABASE_URL is correct
5. Verify Node.js version is 18 or higher

## Summary

The correct setup order is:

1. `npm install` - Install dependencies
2. `npm run setup-db` - Create tables
3. `npm run migrate` - Add role system and features
4. `npm run create-admin` - Create admin user
5. `npm run dev` - Start application

Never run `migrate` before `setup-db`!
