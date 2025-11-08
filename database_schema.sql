-- ============================================
-- ONEFLOW PROJECT MANAGEMENT SYSTEM
-- Complete Database Schema
-- ============================================

-- Create database
CREATE DATABASE IF NOT EXISTS oneflow_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE oneflow_db;

-- ============================================
-- TABLE: companies
-- Stores company/organization information
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  country VARCHAR(100) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  address TEXT,
  logo VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_company_name (name),
  INDEX idx_company_country (country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: users
-- Stores user accounts and authentication
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Project Manager', 'Team Member', 'Sales/Finance') NOT NULL DEFAULT 'Team Member',
  hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  reset_password_token VARCHAR(255),
  reset_password_expire DATETIME,
  company_id INT,
  created_by INT,
  can_manage_users BOOLEAN DEFAULT FALSE COMMENT 'Permission for Project Managers to manage Team Members',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_user_email (email),
  INDEX idx_user_role (role),
  INDEX idx_user_company (company_id),
  INDEX idx_user_creator (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: projects
-- Stores project information
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status ENUM('Planned', 'In Progress', 'Completed', 'On Hold') NOT NULL DEFAULT 'Planned',
  project_manager_id INT NOT NULL,
  company_id INT,
  budget DECIMAL(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_manager_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  
  INDEX idx_project_status (status),
  INDEX idx_project_manager (project_manager_id),
  INDEX idx_project_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: project_members
-- Many-to-many relationship between projects and users
-- ============================================
CREATE TABLE IF NOT EXISTS project_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_project_member (project_id, user_id),
  INDEX idx_project_member_project (project_id),
  INDEX idx_project_member_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: tasks
-- Stores project tasks
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  project_id INT NOT NULL,
  assignee_id INT,
  due_date DATE,
  priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
  status ENUM('To Do', 'In Progress', 'In Review', 'Done') NOT NULL DEFAULT 'To Do',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_task_project (project_id),
  INDEX idx_task_assignee (assignee_id),
  INDEX idx_task_status (status),
  INDEX idx_task_priority (priority),
  INDEX idx_task_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: timesheets
-- Stores time logging for tasks
-- ============================================
CREATE TABLE IF NOT EXISTS timesheets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  hours_logged DECIMAL(5, 2) NOT NULL,
  log_date DATE NOT NULL,
  description TEXT,
  cost DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_timesheet_task (task_id),
  INDEX idx_timesheet_user (user_id),
  INDEX idx_timesheet_date (log_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: sales_orders
-- Stores sales order information
-- ============================================
CREATE TABLE IF NOT EXISTS sales_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name VARCHAR(200) NOT NULL,
  customer_email VARCHAR(100),
  project_id INT,
  amount DECIMAL(12, 2) NOT NULL,
  status ENUM('Draft', 'Confirmed', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Draft',
  order_date DATE NOT NULL,
  delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  
  INDEX idx_sales_order_number (order_number),
  INDEX idx_sales_order_project (project_id),
  INDEX idx_sales_order_status (status),
  INDEX idx_sales_order_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: purchase_orders
-- Stores purchase order information
-- ============================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  vendor_name VARCHAR(200) NOT NULL,
  vendor_email VARCHAR(100),
  project_id INT,
  amount DECIMAL(12, 2) NOT NULL,
  status ENUM('Draft', 'Sent', 'Confirmed', 'Received', 'Cancelled') NOT NULL DEFAULT 'Draft',
  order_date DATE NOT NULL,
  expected_delivery DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  
  INDEX idx_purchase_order_number (order_number),
  INDEX idx_purchase_order_project (project_id),
  INDEX idx_purchase_order_status (status),
  INDEX idx_purchase_order_date (order_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: customer_invoices
-- Stores customer billing information
-- ============================================
CREATE TABLE IF NOT EXISTS customer_invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  project_id INT,
  sales_order_id INT,
  customer_name VARCHAR(200) NOT NULL,
  customer_email VARCHAR(100),
  amount DECIMAL(12, 2) NOT NULL,
  status ENUM('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled') NOT NULL DEFAULT 'Draft',
  invoice_date DATE NOT NULL,
  due_date DATE,
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL,
  
  INDEX idx_customer_invoice_number (invoice_number),
  INDEX idx_customer_invoice_project (project_id),
  INDEX idx_customer_invoice_status (status),
  INDEX idx_customer_invoice_date (invoice_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: vendor_bills
-- Stores vendor payment information
-- ============================================
CREATE TABLE IF NOT EXISTS vendor_bills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bill_number VARCHAR(50) NOT NULL UNIQUE,
  project_id INT,
  purchase_order_id INT,
  vendor_name VARCHAR(200) NOT NULL,
  vendor_email VARCHAR(100),
  amount DECIMAL(12, 2) NOT NULL,
  status ENUM('Draft', 'Submitted', 'Approved', 'Paid', 'Rejected') NOT NULL DEFAULT 'Draft',
  bill_date DATE NOT NULL,
  due_date DATE,
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE SET NULL,
  
  INDEX idx_vendor_bill_number (bill_number),
  INDEX idx_vendor_bill_project (project_id),
  INDEX idx_vendor_bill_status (status),
  INDEX idx_vendor_bill_date (bill_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: expenses
-- Stores project expenses
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  project_id INT,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  description TEXT,
  receipt_path VARCHAR(255),
  status ENUM('Pending', 'Approved', 'Rejected', 'Reimbursed') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  
  INDEX idx_expense_user (user_id),
  INDEX idx_expense_project (project_id),
  INDEX idx_expense_status (status),
  INDEX idx_expense_date (expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: notifications
-- Stores user notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_notification_user (user_id),
  INDEX idx_notification_read (is_read),
  INDEX idx_notification_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show all tables
SHOW TABLES;

-- Show table structures
SELECT 'Companies Table Structure:' AS '';
DESCRIBE companies;

SELECT 'Users Table Structure:' AS '';
DESCRIBE users;

SELECT 'Projects Table Structure:' AS '';
DESCRIBE projects;

SELECT 'Project Members Table Structure:' AS '';
DESCRIBE project_members;

SELECT 'Tasks Table Structure:' AS '';
DESCRIBE tasks;

SELECT 'Timesheets Table Structure:' AS '';
DESCRIBE timesheets;

SELECT 'Sales Orders Table Structure:' AS '';
DESCRIBE sales_orders;

SELECT 'Purchase Orders Table Structure:' AS '';
DESCRIBE purchase_orders;

SELECT 'Customer Invoices Table Structure:' AS '';
DESCRIBE customer_invoices;

SELECT 'Vendor Bills Table Structure:' AS '';
DESCRIBE vendor_bills;

SELECT 'Expenses Table Structure:' AS '';
DESCRIBE expenses;

SELECT 'Notifications Table Structure:' AS '';
DESCRIBE notifications;

-- Show foreign keys
SELECT 'Foreign Key Relationships:' AS '';
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'oneflow_db' 
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME;

-- Show indexes
SELECT 'Database Indexes:' AS '';
SELECT 
  TABLE_NAME,
  INDEX_NAME,
  GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS COLUMNS
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'oneflow_db'
  AND INDEX_NAME != 'PRIMARY'
GROUP BY TABLE_NAME, INDEX_NAME
ORDER BY TABLE_NAME, INDEX_NAME;

SELECT 'Database schema created successfully!' AS Status;
SELECT 'You can now start the server and begin using the application.' AS NextSteps;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment below to insert sample data

/*
-- Create sample company
INSERT INTO companies (name, country, currency, address)
VALUES ('Sample Company Inc', 'United States', 'USD', '123 Main Street, New York, NY 10001');

SET @company_id = LAST_INSERT_ID();

-- Create admin user (password: Admin123!)
-- Note: This is a hashed version of 'Admin123!'
INSERT INTO users (first_name, last_name, email, password_hash, role, company_id, can_manage_users, hourly_rate)
VALUES (
  'Admin', 
  'User', 
  'admin@samplecompany.com', 
  '$2a$10$YourHashedPasswordHere',  -- Replace with actual bcrypt hash
  'Admin',
  @company_id,
  TRUE,
  100.00
);

SET @admin_id = LAST_INSERT_ID();

-- Create sample Project Manager
INSERT INTO users (first_name, last_name, email, password_hash, role, company_id, created_by, can_manage_users, hourly_rate)
VALUES (
  'Project',
  'Manager',
  'pm@samplecompany.com',
  '$2a$10$YourHashedPasswordHere',  -- Replace with actual bcrypt hash
  'Project Manager',
  @company_id,
  @admin_id,
  TRUE,
  75.00
);

SET @pm_id = LAST_INSERT_ID();

-- Create sample Team Member
INSERT INTO users (first_name, last_name, email, password_hash, role, company_id, created_by, hourly_rate)
VALUES (
  'Team',
  'Member',
  'member@samplecompany.com',
  '$2a$10$YourHashedPasswordHere',  -- Replace with actual bcrypt hash
  'Team Member',
  @company_id,
  @pm_id,
  50.00
);

-- Create sample project
INSERT INTO projects (name, description, status, project_manager_id, company_id, budget)
VALUES (
  'Sample Project',
  'This is a sample project for testing',
  'In Progress',
  @pm_id,
  @company_id,
  50000.00
);

SELECT 'Sample data inserted successfully!' AS Status;
*/

-- ============================================
-- USEFUL QUERIES FOR ADMINISTRATION
-- ============================================

/*
-- List all companies with user counts
SELECT 
  c.id,
  c.name AS company_name,
  c.country,
  c.currency,
  COUNT(DISTINCT u.id) AS total_users,
  COUNT(DISTINCT p.id) AS total_projects
FROM companies c
LEFT JOIN users u ON c.id = u.company_id
LEFT JOIN projects p ON c.id = p.company_id
GROUP BY c.id, c.name, c.country, c.currency
ORDER BY c.id;

-- List all users with their company
SELECT 
  u.id,
  u.first_name,
  u.last_name,
  u.email,
  u.role,
  u.can_manage_users,
  c.name AS company_name,
  creator.first_name AS created_by_first_name,
  creator.last_name AS created_by_last_name
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN users creator ON u.created_by = creator.id
ORDER BY c.id, u.role, u.id;

-- List all projects with their company and manager
SELECT 
  p.id,
  p.name AS project_name,
  p.status,
  c.name AS company_name,
  CONCAT(pm.first_name, ' ', pm.last_name) AS project_manager,
  p.budget
FROM projects p
LEFT JOIN companies c ON p.company_id = c.id
LEFT JOIN users pm ON p.project_manager_id = pm.id
ORDER BY c.id, p.id;

-- Check Project Managers and their permissions
SELECT 
  u.id,
  u.first_name,
  u.last_name,
  u.email,
  u.can_manage_users AS has_permission,
  c.name AS company_name,
  COUNT(DISTINCT created.id) AS team_members_created
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
LEFT JOIN users created ON u.id = created.created_by
WHERE u.role = 'Project Manager'
GROUP BY u.id, u.first_name, u.last_name, u.email, u.can_manage_users, c.name
ORDER BY c.id, u.id;
*/

-- ============================================
-- END OF SCHEMA
-- ============================================

