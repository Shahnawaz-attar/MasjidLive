# Member-User Linking System

## Overview

This system links members in the `members` table to users in the `users` table, allowing system users (Imam, Muazzin, Admin) to appear in the members list while being protected from accidental editing or deletion by other admins.

## Problem Solved

**Before:** When a user registered as Imam or Muazzin, they were only in the `users` table but not visible in the members list. If admins manually added them as members, there was no way to prevent accidental editing or deletion of their information.

**After:** System users are automatically added to the members list when they register, with a link to their user account. These linked members cannot be edited or deleted from the members page, maintaining data integrity.

## Database Changes

### New Column: `user_id` in `members` table

```sql
ALTER TABLE members ADD COLUMN user_id TEXT REFERENCES "users"(id) ON DELETE SET NULL;
```

- **Type**: `TEXT` (foreign key)
- **References**: `users(id)`
- **On Delete**: `SET NULL` (if user is deleted, member entry remains but unlinked)
- **Purpose**: Links a member to a system user account

### Migration Script

Location: `database/migrations/003_link_members_to_users.sql`

Run with: `npm run migrate`

## Type Updates

### Member Interface

```typescript
export interface Member {
  id: string;
  mosqueId: string;
  name: string;
  role: MemberRole;
  photo: string;
  contact: string;
  background: string;
  education?: MemberEducation;
  userId?: string; // NEW: Link to User table
}
```

## Registration Flow

When a user registers (Imam or Muazzin):

1. **User account created** in `users` table
2. **Member entry automatically created** in `members` table with:
   - Same name, role, and photo as user
   - `user_id` field set to link to the user
   - Background text: "System user - {role}"
   - Contact: user's email

This happens automatically in `pgService.register()`.

## Admin Creation

When creating an admin user via `npm run create-admin`:

1. Admin user created in `users` table
2. Member entry created in `members` table with:
   - Role: "Committee"
   - Background: "System Administrator"
   - Linked to admin user

## Member Page Behavior

### For Admins and Imams (Full Access):

**Regular Members (no `userId`):**
- ✅ Can edit
- ✅ Can delete
- Shows edit/delete buttons (enabled)

**System Users (has `userId`):**
- ❌ Cannot edit - Shows alert: "This member is a system user and cannot be edited from here. They can update their profile from the Profile page."
- ❌ Cannot delete - Shows alert: "This member is a system user and cannot be deleted."
- Shows edit/delete buttons (disabled/grayed out)
- Badge displayed: "System User"

### For Muazzin (Read-Only):
- Can view all members
- No edit/delete buttons shown
- "System User" badge still visible

## UI Indicators

### System User Badge
Members with `userId` show a badge next to their name:
```
[Name] 🏷️ System User
```

### Info Banner
An amber info banner explains the system:
> **Note:** Members marked as "System User" are also registered users (Imam, Muazzin, Admin) and cannot be edited or deleted from here. They can update their information from the Profile page.

### Disabled Buttons
For system users:
- Edit button: Grayed out with tooltip "System users cannot be edited from here"
- Delete button: Grayed out with tooltip "System users cannot be deleted"

## Benefits

1. **Data Integrity**: System users cannot be accidentally modified or deleted from members page
2. **Visibility**: All system users appear in the members list automatically
3. **Clarity**: Clear visual indicators show which members are system users
4. **Self-Service**: System users can still update their own profile via Profile page
5. **Audit Trail**: User-member link preserved even if user account is deleted

## User Profiles

System users can update their own information through:
- **Profile Page** - Update name, email, avatar, address
- **Password Change** - Update password securely

These changes are reflected in:
- User authentication
- Member list display
- Profile displays across the app

## Edge Cases

### What if a user is deleted?
- `ON DELETE SET NULL` ensures member entry remains
- `userId` becomes `null`
- Member becomes editable again (no longer protected)

### What if we need to delete a system user's member entry?
- Cannot be done from Members page
- Must be done directly in database if truly necessary
- Not recommended - breaks the link

### Can a system user also be added as a regular member?
- No - username uniqueness prevents duplicate users
- Registration checks for existing usernames/emails
- Each person should have one account

## Testing

To test this feature:

1. **Register a new Imam or Muazzin**
   ```
   - Go to Register page
   - Fill in details
   - Submit
   ```

2. **Check Members List**
   ```
   - Login as Admin
   - Go to Members page
   - New user should appear with "System User" badge
   ```

3. **Try to Edit System User**
   ```
   - Click edit button (disabled)
   - See alert message
   - Confirm cannot edit
   ```

4. **Try to Delete System User**
   ```
   - Click delete button (disabled)
   - See alert message
   - Confirm cannot delete
   ```

5. **Edit Regular Member**
   ```
   - Add a regular member
   - Edit should work normally
   - Delete should work normally
   ```

## Migration Guide

### For existing installations:

1. **Run migration**:
   ```bash
   npm run migrate
   ```

2. **Link existing users to members** (if any exist):
   ```sql
   -- Find users who might have manual member entries
   SELECT u.id as user_id, u.name, m.id as member_id 
   FROM "users" u 
   LEFT JOIN members m ON u.name = m.name AND u.mosque_id = m.mosque_id
   WHERE m.user_id IS NULL;
   
   -- Link them (adjust IDs as needed)
   UPDATE members SET user_id = 'user-xxx' WHERE id = 'member-yyy';
   ```

3. **Create member entries for users without them**:
   ```sql
   -- Find users without member entries
   SELECT u.* FROM "users" u 
   LEFT JOIN members m ON m.user_id = u.id 
   WHERE m.id IS NULL;
   
   -- Create member entries (do this via admin panel or script)
   ```

## Technical Details

### Database Constraint
```sql
user_id TEXT REFERENCES "users"(id) ON DELETE SET NULL
```

### Index
```sql
CREATE INDEX idx_members_user_id ON members(user_id);
```

### Queries

**Get all system users in members list:**
```sql
SELECT m.*, u.username, u.role as user_role 
FROM members m 
INNER JOIN "users" u ON m.user_id = u.id;
```

**Get all regular members (non-system users):**
```sql
SELECT * FROM members WHERE user_id IS NULL;
```

**Check if member is system user:**
```sql
SELECT user_id IS NOT NULL as is_system_user FROM members WHERE id = 'member-xxx';
```

## Future Enhancements

Possible improvements:

1. **Sync Updates**: Automatically sync user profile changes to member entry
2. **Role Badges**: Show user role (Admin/Imam/Muazzin) in member list
3. **Bulk Operations**: Skip system users in bulk operations
4. **Advanced Filters**: Filter members by system/regular
5. **Permission Levels**: Different edit permissions based on user role hierarchy
