-- ================================================
-- QUICK FIX: Assign company_id to users
-- ================================================

-- Step 1: Check current users (see who has no company_id)
SELECT 
    id, 
    CONCAT(first_name, ' ', last_name) AS name, 
    email, 
    role, 
    company_id 
FROM users;

-- Step 2: Check companies
SELECT * FROM companies;

-- ================================================
-- OPTION A: If you have a company already
-- ================================================
-- Find your company ID and update your user
-- Replace 1 with your actual company ID
UPDATE users 
SET company_id = 1 
WHERE id = 1;  -- Replace with your user ID

-- ================================================
-- OPTION B: Create a company if none exists
-- ================================================
-- Create your company
INSERT INTO companies (name, country, currency, is_active, created_at, updated_at)
VALUES ('My Company', 'US', 'USD', 1, NOW(), NOW());

-- Get the new company ID
SET @company_id = LAST_INSERT_ID();

-- Update your user with the company_id
UPDATE users 
SET company_id = @company_id 
WHERE email = 'kaushalsavaliya09032006@gmail.com';  -- Replace with your email

-- Also update any projects to have company_id
UPDATE projects 
SET company_id = @company_id 
WHERE company_id IS NULL;

-- Also update any tasks to have company_id
UPDATE tasks 
SET company_id = @company_id 
WHERE company_id IS NULL;

-- ================================================
-- Step 3: Verify the fix
-- ================================================
SELECT 
    u.id,
    CONCAT(u.first_name, ' ', u.last_name) AS user_name,
    u.email,
    u.company_id,
    c.name AS company_name
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
WHERE u.email = 'kaushalsavaliya09032006@gmail.com';

-- Check projects
SELECT 
    id, 
    name, 
    company_id,
    status
FROM projects
LIMIT 5;

-- ================================================
-- IMPORTANT: After running this SQL
-- ================================================
-- 1. LOGOUT from the website
-- 2. LOGIN again
-- 3. Refresh dashboard
-- 4. Data should now appear!
-- ================================================

