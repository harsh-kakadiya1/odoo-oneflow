-- ============================================
-- MULTI-TENANCY MIGRATION
-- Adds company_id to projects table for data isolation
-- ============================================

USE oneflow_db;

-- Add company_id to projects table
ALTER TABLE projects 
  ADD COLUMN company_id INT AFTER project_manager_id;

-- Add foreign key constraint
ALTER TABLE projects 
  ADD CONSTRAINT fk_project_company 
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX idx_project_company ON projects(company_id);

-- Migrate existing projects:
-- Option 1: Associate projects with the project manager's company
UPDATE projects p
INNER JOIN users u ON p.project_manager_id = u.id
SET p.company_id = u.company_id
WHERE p.company_id IS NULL;

-- Verify migration
SELECT 'Migration completed successfully!' AS Status;

-- Show projects with their companies
SELECT 
  p.id,
  p.name AS project_name,
  c.name AS company_name,
  CONCAT(u.first_name, ' ', u.last_name) AS project_manager
FROM projects p
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN users u ON p.project_manager_id = u.id
ORDER BY p.id;

-- Show statistics
SELECT 
  c.name AS company_name,
  COUNT(DISTINCT p.id) AS total_projects,
  COUNT(DISTINCT u.id) AS total_users
FROM companies c
LEFT JOIN projects p ON c.id = p.company_id
LEFT JOIN users u ON c.id = u.company_id
GROUP BY c.id, c.name;

