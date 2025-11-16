# Mosque Access Control for Role-Based Users

## Overview

This update restricts mosque access based on user roles. When Imam or Muazzin users log in, they can only see and work with their assigned mosque. Only Admin users can switch between different mosques.

## Changes Made

### 1. Automatic Mosque Selection on Login
When a user with a `mosque_id` (Imam or Muazzin) logs in, the system automatically selects their assigned mosque and restricts access to that mosque only.

**File: `App.tsx`**
- Updated `handleLogin` to automatically set the user's mosque when they have a `mosque_id`
- Updated `fetchMosques` to prioritize the user's assigned mosque when setting the selected mosque
- Added `user` as a dependency to the `useEffect` that fetches mosques to ensure proper mosque selection on user change

### 2. Hide Mosque Dropdown for Non-Admin Users
The mosque selector dropdown in the header is now only visible to Admin users. Imam and Muazzin users see their mosque name without the ability to change it.

**File: `components/Layout.tsx`**
- Added conditional rendering based on `user.role === 'Admin'`
- Admin users: See the full dropdown with all mosques + ability to add new mosques
- Imam/Muazzin users: See only their mosque name (static, no dropdown icon)

## User Experience

### Admin Users
- Can see mosque dropdown in header
- Can switch between any mosque
- Can add new mosques
- Full control over all mosques in the system

### Imam Users
- Automatically assigned to their mosque on login
- See only their mosque name in header (no dropdown)
- Cannot switch to other mosques
- Can manage all features within their mosque (except mosque edit/delete)

### Muazzin Users
- Automatically assigned to their mosque on login
- See only their mosque name in header (no dropdown)
- Cannot switch to other mosques
- Can manage limited features within their mosque (prayer times, announcements, donations, events)

## Technical Details

### Mosque Selection Logic

1. **On Login**: If user has `mosque_id`, find and set their mosque
2. **On Mosque Fetch**: If user has `mosque_id`, prioritize their mosque over default selection
3. **On Page Render**: Show dropdown only for Admin role

### Security

- Frontend restricts UI access to mosque selection
- Backend should also validate that users can only modify data for their assigned mosque (recommendation for future enhancement)

## Testing

To test these changes:

1. Create an Admin user (default behavior - can switch mosques)
2. Register a Muazzin user with a specific mosque
3. Login as Muazzin - verify:
   - Automatically assigned to their mosque
   - Cannot see mosque dropdown
   - Can only work with their mosque data

## Future Enhancements

Consider adding:
- Backend validation to ensure users can only access their assigned mosque data
- Ability for Admin to reassign users to different mosques
- Multi-mosque access for certain roles (e.g., regional managers)
