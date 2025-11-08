-- ============================================
-- PERMISSION SYSTEM & MULTI-TENANCY MIGRATION
-- Complete migration script for all new features
-- ============================================

USE oneflow_db;

-- Step 1: Add can_manage_users permission column to users table
ALTER TABLE users 
  ADD COLUMN can_manage_users BOOLEAN DEFAULT FALSE 
  COMMENT 'Permission for Project Managers to manage Team Members'
  AFTER created_by;

-- Step 2: Add company_id to projects table for multi-tenancy
ALTER TABLE projects 
  ADD COLUMN company_id INT AFTER project_manager_id;

-- Step 3: Add foreign key constraint for project company
ALTER TABLE projects 
  ADD CONSTRAINT fk_project_company 
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Step 4: Add index for better performance
CREATE INDEX idx_project_company ON projects(company_id);

-- Step 5: Migrate existing projects to their PM's company
UPDATE projects p
INNER JOIN users u ON p.project_manager_id = u.id
SET p.company_id = u.company_id
WHERE p.company_id IS NULL;

-- Verification Queries
SELECT 'Migration completed successfully!' AS Status;

-- Show users with their companies and permissions
SELECT 
  u.id,
  u.first_name,
  u.last_name,
  u.email,
  u.role,
  u.can_manage_users AS has_permission,
  c.name AS company_name,
  creator.first_name AS created_by_first_name,
  creator.last_name AS created_by_last_name
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN users creator ON u.created_by = creator.id
ORDER BY c.id, u.role, u.id;

-- Show projects with their companies
SELECT 
  p.id,
  p.name AS project_name,
  c.name AS company_name,
  CONCAT(pm.first_name, ' ', pm.last_name) AS project_manager,
  p.status
FROM projects p
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN users pm ON p.project_manager_id = pm.id
ORDER BY c.id, p.id;

-- Show company statistics
SELECT 
  c.name AS company_name,
  COUNT(DISTINCT u.id) AS total_users,
  SUM(CASE WHEN u.role = 'Admin' THEN 1 ELSE 0 END) AS admins,
  SUM(CASE WHEN u.role = 'Project Manager' THEN 1 ELSE 0 END) AS project_managers,
  SUM(CASE WHEN u.role = 'Team Member' THEN 1 ELSE 0 END) AS team_members,
  SUM(CASE WHEN u.can_manage_users = TRUE THEN 1 ELSE 0 END) AS pms_with_permission,
  COUNT(DISTINCT p.id) AS total_projects
FROM companies c
LEFT JOIN users u ON c.id = u.company_id
LEFT JOIN projects p ON c.id = p.company_id
GROUP BY c.id, c.name;

