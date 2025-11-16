# Role-Based Access Control System

This document describes the role-based access control (RBAC) system implemented in the Masjid Manager application.

## Overview

The application now supports three user roles with different permission levels:
- **Admin**: Full access to all features
- **Imam**: Manages mosque operations (read-only access to mosque settings)
- **Muazzin**: Limited access to prayer times and announcements

## User Roles

### Admin
- **Full Access**: Can manage everything including mosques, members, prayer times, announcements, donations, events, and audit logs
- **Mosque Management**: Can create, edit, and delete mosques
- **User Management**: Has access to all administrative features

### Imam
- **Mosque Settings**: Read-only access (can view but not edit/delete mosques)
- **Full Access to**:
  - Dashboard
  - Members (can add/edit/delete)
  - Prayer Times
  - Announcements
  - Donations
  - Events
  - Audit Logs
  - Profile

### Muazzin
- **Read-Only Access**:
  - Members (can view only, cannot add/edit/delete)
- **Full Access to**:
  - Dashboard
  - Prayer Times
  - Announcements
  - Donations
  - Events
  - Profile
- **No Access to**:
  - Mosques Management
  - Audit Logs

## Registration

New users can register through the registration form with the following requirements:

### Required Fields
- **Full Name**: User's complete name
- **Username**: Must be unique, minimum 3 characters
- **Password**: Minimum 8 characters
- **Role**: Choose between Imam or Muazzin
- **Mosque**: Select the mosque they belong to

### Optional Fields
- **Email**: Contact email (not required for login)
- **Address**: Physical address

### Registration Process
1. Navigate to the login page
2. Click "Register" link
3. Fill in all required fields
4. Select your role (Imam or Muazzin)
5. Choose your mosque from the dropdown
6. Submit the form

## Login

Users can log in using either:
- **Username** (recommended)
- **Email** (if provided during registration)

Plus their password.

## Setup Instructions

### For New Installations

1. Set up the database schema:
   ```bash
   npm run setup-db
   ```

2. Run the role migration:
   ```bash
   npm run migrate
   ```

3. Create an admin user:
   ```bash
   npm run create-admin
   ```

### For Existing Installations

If you already have the database set up, you only need to run the migration:

```bash
npm run migrate
```

This will add the new role-based fields to your existing users table while preserving existing data.

## Database Changes

The migration adds the following fields to the `users` table:
- `role`: User role (Admin, Imam, Muazzin) - defaults to Muazzin
- `username`: Unique username for login - required
- `address`: Optional physical address
- Email is now optional (was previously required)

Existing users will be automatically assigned the Admin role during migration.

## API Endpoints

### Registration
```
POST /api/register
```

Request body:
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "password": "password123",
  "email": "john@example.com",
  "role": "Muazzin",
  "mosque_id": "mosque-abc123",
  "address": "123 Main St"
}
```

### Login
```
POST /api/login
```

Request body:
```json
{
  "email": "johndoe",  // Can be username or email
  "password": "password123"
}
```

## Security Considerations

1. **Password Requirements**: Minimum 8 characters
2. **Username Uniqueness**: System validates username uniqueness before registration
3. **Role Restrictions**: Only Imam and Muazzin roles can register through the UI
4. **Admin Creation**: Admin users must be created using the `create-admin` script
5. **Permission Enforcement**: Role-based permissions are enforced both in UI and backend

## UI Changes

### Navigation
The navigation menu automatically adjusts based on user role:
- Admin sees all menu items
- Imam sees all except mosque management
- Muazzin sees limited menu items (no mosques or audit logs)

### Read-Only Indicators
Pages with read-only access display a blue notification banner explaining the access level.

## Troubleshooting

### Registration Issues

**Error: "Username already exists"**
- Choose a different username

**Error: "Password must be at least 8 characters long"**
- Use a longer password

**Error: "Invalid mosque ID"**
- Ensure mosques exist in the system before registering users

### Login Issues

**Error: "Invalid credentials"**
- Verify username/email and password
- Check if the account was created successfully

### Migration Issues

If the migration fails:
1. Check your DATABASE_URL environment variable
2. Ensure you have database connection access
3. Run the migration script again (it's idempotent and safe to run multiple times)

## Future Enhancements

Potential improvements to consider:
- Additional roles (Treasurer, Secretary, etc.)
- Fine-grained permissions for specific features
- Multi-mosque access for users
- Role-based data filtering (users only see their mosque's data)
- User approval workflow
- Password reset functionality
