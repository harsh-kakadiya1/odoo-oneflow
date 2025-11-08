-- ============================================
-- CHECK PERMISSION STATUS
-- Run this to verify the permission system is working
-- ============================================

USE oneflow_db;

-- Check if can_manage_users column exists
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  IS_NULLABLE, 
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'oneflow_db' 
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'can_manage_users';

-- If the above query returns 0 rows, the column doesn't exist yet!
-- You need to run the migration first.

-- Show all Project Managers and their permission status
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

-- If can_manage_users column doesn't exist, you'll get an error here.
-- That means you need to run: ALTER TABLE users ADD COLUMN can_manage_users BOOLEAN DEFAULT FALSE;

