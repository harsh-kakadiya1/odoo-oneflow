-- ============================================
-- GRANT PERMISSION TO PROJECT MANAGER
-- Quick script to give PM user management rights
-- ============================================

USE oneflow_db;

-- Show all Project Managers
SELECT 
  id,
  first_name,
  last_name,
  email,
  role,
  can_manage_users,
  created_at
FROM users
WHERE role = 'Project Manager'
ORDER BY id;

-- Grant permission to a specific PM (replace ID or email)
-- Option 1: Grant by ID
-- UPDATE users SET can_manage_users = TRUE WHERE id = 12;

-- Option 2: Grant by email (safer - replace with actual PM email)
UPDATE users 
SET can_manage_users = TRUE 
WHERE email = '23aiml063@charusat.edu.in';  -- Replace with actual PM email

-- Verify the update
SELECT 
  id,
  first_name,
  last_name,
  email,
  role,
  can_manage_users AS 'Has Permission'
FROM users
WHERE role = 'Project Manager';

-- After running this:
-- 1. The PM should LOGOUT completely
-- 2. Then LOGIN again
-- 3. The permission will be active
SELECT 'Permission granted! PM must logout and login again.' AS Important_Note;

