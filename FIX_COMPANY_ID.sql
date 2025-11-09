-- ================================================
-- FIX COMPANY_ID ISSUE
-- This script fixes existing users who don't have a company_id
-- ================================================

-- Step 1: Check which users are missing company_id
SELECT 
    id, 
    CONCAT(first_name, ' ', last_name) AS name, 
    email, 
    role, 
    company_id 
FROM users 
WHERE company_id IS NULL;

-- ================================================
-- OPTION 1: If you have ONE main company
-- ================================================
-- Replace 1 with your actual company ID
-- UPDATE users 
-- SET company_id = 1 
-- WHERE company_id IS NULL;

-- ================================================
-- OPTION 2: Create a default company for orphaned users
-- ================================================

-- Create a default company if it doesn't exist
INSERT INTO companies (name, country, currency, is_active, created_at, updated_at)
SELECT 'Default Company', 'US', 'USD', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'Default Company');

-- Get the default company ID
SET @default_company_id = (SELECT id FROM companies WHERE name = 'Default Company' LIMIT 1);

-- Update all users without company_id to use the default company
UPDATE users 
SET company_id = @default_company_id 
WHERE company_id IS NULL;

-- ================================================
-- OPTION 3: Delete users without company_id (CAREFUL!)
-- ================================================
-- Only use this if you're sure these are test/invalid users
-- DELETE FROM users WHERE company_id IS NULL;

-- ================================================
-- Verify the fix
-- ================================================
SELECT 
    'Users without company_id' AS check_name,
    COUNT(*) AS count 
FROM users 
WHERE company_id IS NULL;

-- Show all users with their companies
SELECT 
    u.id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    u.email,
    u.role,
    u.company_id,
    c.name AS company_name
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
ORDER BY u.company_id, u.id;

-- ================================================
-- NOTES:
-- ================================================
-- 1. Run this script in your MySQL Workbench or command line
-- 2. Choose ONE of the three options above (uncomment the one you want)
-- 3. After running, restart your server
-- 4. All new signups will automatically have company_id set
-- ================================================

