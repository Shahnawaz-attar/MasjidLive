-- Quick fix for admin role issue
-- Run this in your PostgreSQL database

-- Update existing admin user to have correct role and username
UPDATE "users" 
SET 
    role = 'Admin',
    username = COALESCE(username, 'admin')
WHERE email = 'admin@masjid.com';

-- Verify the update worked
SELECT id, name, email, username, role, mosque_id 
FROM "users" 
WHERE email = 'admin@masjid.com';

-- If you see the role as 'Admin' in the output above, it worked!
-- Now clear your browser's localStorage and log in again:
-- In browser console, run: localStorage.clear()
