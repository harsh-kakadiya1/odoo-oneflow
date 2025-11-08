-- ================================================
-- DATABASE MIGRATION: Add Missing Columns After Merge
-- Run this script in MySQL Workbench
-- ================================================

USE oneflow_db;

-- ================================================
-- 1. Add missing columns to companies table
-- ================================================

-- Add email column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'oneflow_db' 
  AND TABLE_NAME = 'companies' 
  AND COLUMN_NAME = 'email';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE companies ADD COLUMN email VARCHAR(100) AFTER name', 
  'SELECT ''Column email already exists'' AS Info');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add phone column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'oneflow_db' 
  AND TABLE_NAME = 'companies' 
  AND COLUMN_NAME = 'phone';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE companies ADD COLUMN phone VARCHAR(20) AFTER email', 
  'SELECT ''Column phone already exists'' AS Info');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add address column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'oneflow_db' 
  AND TABLE_NAME = 'companies' 
  AND COLUMN_NAME = 'address';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE companies ADD COLUMN address TEXT AFTER phone', 
  'SELECT ''Column address already exists'' AS Info');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add website column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'oneflow_db' 
  AND TABLE_NAME = 'companies' 
  AND COLUMN_NAME = 'website';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE companies ADD COLUMN website VARCHAR(255) AFTER address', 
  'SELECT ''Column website already exists'' AS Info');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add industry column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'oneflow_db' 
  AND TABLE_NAME = 'companies' 
  AND COLUMN_NAME = 'industry';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE companies ADD COLUMN industry VARCHAR(100) AFTER website', 
  'SELECT ''Column industry already exists'' AS Info');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add company_size column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'oneflow_db' 
  AND TABLE_NAME = 'companies' 
  AND COLUMN_NAME = 'company_size';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE companies ADD COLUMN company_size ENUM(''1-10'', ''11-50'', ''51-200'', ''201-500'', ''501-1000'', ''1000+'') AFTER industry', 
  'SELECT ''Column company_size already exists'' AS Info');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add logo column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'oneflow_db' 
  AND TABLE_NAME = 'companies' 
  AND COLUMN_NAME = 'logo';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE companies ADD COLUMN logo VARCHAR(255) AFTER company_size', 
  'SELECT ''Column logo already exists'' AS Info');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ================================================
-- 2. Add cover_image column to tasks table
-- ================================================

SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'oneflow_db' 
  AND TABLE_NAME = 'tasks' 
  AND COLUMN_NAME = 'cover_image';

SET @query = IF(@col_exists = 0, 
  'ALTER TABLE tasks ADD COLUMN cover_image TEXT AFTER status', 
  'SELECT ''Column cover_image already exists'' AS Info');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ================================================
-- 3. Verify the changes
-- ================================================

SELECT '✅ Migration completed successfully!' AS Result;
SELECT '' AS Spacer;

-- Check companies table structure
SELECT 'Companies table columns:' AS Info;
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'oneflow_db' 
  AND TABLE_NAME = 'companies'
ORDER BY ORDINAL_POSITION;

SELECT '' AS Spacer;

-- Check tasks table for cover_image
SELECT 'Tasks table - cover_image column:' AS Info;
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'oneflow_db' 
  AND TABLE_NAME = 'tasks'
  AND COLUMN_NAME = 'cover_image';

-- ================================================
-- 4. Verify data integrity
-- ================================================

SELECT '' AS Spacer;
SELECT 'Data integrity check:' AS Info;

-- Check if users have company_id
SELECT 
    'Users with company_id' AS status,
    COUNT(*) AS count 
FROM users 
WHERE company_id IS NOT NULL;

SELECT 
    'Users WITHOUT company_id' AS status,
    COUNT(*) AS count 
FROM users 
WHERE company_id IS NULL;

-- ================================================
-- SUCCESS MESSAGE
-- ================================================

SELECT '' AS Spacer;
SELECT '📋 Next steps:' AS info;
SELECT '1. Your Node.js server should auto-restart with nodemon' AS step1;
SELECT '2. Refresh your browser' AS step2;
SELECT '3. Dashboard should now work without errors!' AS step3;
