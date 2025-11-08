# OneFlow Database Schema

## 📁 Complete Database Setup

This folder contains the complete database schema for the OneFlow Project Management System.

---

## 🗄️ Database File

**`database_schema.sql`** - Complete database schema with all tables and relationships

---

## 🚀 Quick Setup

### Option 1: Create Fresh Database

If you're starting fresh:

```bash
# Using MySQL Workbench:
1. Open MySQL Workbench
2. File → Open SQL Script
3. Select: database_schema.sql
4. Click Execute (⚡ lightning bolt)
5. Done!
```

### Option 2: Command Line (CMD, not PowerShell)

```cmd
cd C:\Users\DELL\OneDrive\Desktop\odoo-2\odoo-oneflow
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database_schema.sql
```

---

## 📊 Database Structure

### Tables Created:

1. **companies** - Company/organization information
2. **users** - User accounts and authentication
3. **projects** - Project information
4. **project_members** - Project team assignments
5. **tasks** - Project tasks
6. **timesheets** - Time logging
7. **sales_orders** - Sales order management
8. **purchase_orders** - Purchase order management
9. **customer_invoices** - Customer billing
10. **vendor_bills** - Vendor payment tracking
11. **expenses** - Expense tracking
12. **notifications** - User notifications

---

## 🔑 Key Features

### Multi-Tenancy
- Every table linked to `company_id`
- Complete data isolation per company
- No cross-company queries

### User Management
- `first_name`, `last_name` (no single name field)
- `company_id` - Links user to company
- `created_by` - Tracks who created the user
- `can_manage_users` - PM permission flag

### Project Management
- `company_id` - Links project to company
- `project_manager_id` - Assigns PM
- Multi-member support via `project_members`

### Security
- Proper foreign keys with cascading
- Indexes for performance
- Password hashing (bcrypt)
- Reset token support

---

## 🔗 Relationships

```
companies
├── users (one-to-many)
├── projects (one-to-many)
└── [isolated data]

users
├── created users (self-referential)
├── managed projects (as PM)
├── assigned tasks
├── timesheets
└── expenses

projects
├── project members (many-to-many via project_members)
├── tasks
├── sales orders
├── purchase orders
├── customer invoices
└── vendor bills

tasks
├── timesheets
└── assignee (user)
```

---

## 📋 Field Details

### users
- `first_name`, `last_name` - User's name (split)
- `email` - Unique login email
- `password_hash` - Bcrypt hashed password
- `role` - Admin | Project Manager | Team Member | Sales/Finance
- `hourly_rate` - For timesheet cost calculation
- `company_id` - Links to company (multi-tenancy)
- `created_by` - User who created this account
- `can_manage_users` - Permission to manage team members
- `reset_password_token` - For password reset
- `reset_password_expire` - Token expiration

### companies
- `name` - Unique company name
- `country` - Company country
- `currency` - 3-letter ISO code (USD, INR, etc.)
- `address` - Company address
- `logo` - Logo file path
- `is_active` - Active status

### projects
- `name` - Project name
- `description` - Project details
- `start_date`, `end_date` - Project timeline
- `status` - Planned | In Progress | Completed | On Hold
- `project_manager_id` - Assigned PM
- `company_id` - Links to company (multi-tenancy)
- `budget` - Project budget

---

## 🔐 Default Permissions

### Admin (Company Owner)
- Full access to all company data
- Can create/edit/delete users
- Can grant permissions to PMs
- Can edit company profile
- Can upload company logo

### Project Manager (with can_manage_users = TRUE)
- Can create Team Members
- Can edit/delete users they created
- Can create and manage projects
- Can view company profile (read-only)

### Project Manager (with can_manage_users = FALSE)
- Can create and manage projects
- Cannot access user management
- Can view company profile (read-only)

### Team Member
- Can view assigned projects
- Can log time
- Can submit expenses
- Can update own profile
- Can view company profile (read-only)

---

## 📧 Email Features

### Welcome Email
- Sent when user is created
- Contains temporary password

### Deletion Email
- Sent when user is deleted
- Notifies of account removal

### Password Reset
- Secure token-based reset
- 1-hour expiration

---

## 🛠️ Maintenance Queries

### Check Database Status:
```sql
USE oneflow_db;

-- Table sizes
SELECT 
  table_name,
  table_rows,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'oneflow_db'
ORDER BY (data_length + index_length) DESC;

-- Company statistics
SELECT 
  c.name,
  COUNT(DISTINCT u.id) AS users,
  COUNT(DISTINCT p.id) AS projects
FROM companies c
LEFT JOIN users u ON c.id = u.company_id
LEFT JOIN projects p ON c.id = p.company_id
GROUP BY c.id, c.name;
```

### Grant PM Permission:
```sql
UPDATE users 
SET can_manage_users = TRUE 
WHERE email = 'pm@company.com';
```

### Reset User Password (Manual):
```sql
-- Set a temporary password for user
UPDATE users 
SET password_hash = '$2a$10$...' -- Use bcrypt hash
WHERE email = 'user@company.com';
```

---

## ⚠️ Important Notes

### Multi-Tenancy
- All data queries MUST filter by `company_id`
- No cross-company data access
- Each company is completely isolated

### User Deletion
- Users are **permanently deleted** (hard delete)
- Email addresses are freed immediately
- Deletion email sent automatically

### Permissions
- `can_manage_users` controls PM user management access
- Must logout/login after permission change
- Only Admin can grant/revoke permissions

---

## 🔄 Migration from Old Schema

If you have an old database with different schema:

```sql
-- Backup first!
mysqldump -u root -p oneflow_db > backup.sql

-- Then run migrations in order:
1. Add first_name, last_name columns
2. Migrate name to first_name/last_name
3. Drop name column
4. Add company_id columns
5. Add created_by column
6. Add can_manage_users column
7. Remove phone, department, employee_id
8. Add company logo and address
```

See migration files for detailed steps.

---

## 📞 Support

### Common Issues:

**"Unknown column 'first_name'"**
- Run: `ALTER TABLE users ADD COLUMN first_name VARCHAR(50);`

**"Unknown table 'companies'"**
- Run the complete `database_schema.sql` file

**"Foreign key constraint fails"**
- Create parent tables first (companies before users)
- Check data integrity

**"Duplicate entry for key 'email'"**
- Email must be unique
- Delete or update existing user first

---

## ✅ Verification

After running the schema, verify:

```sql
-- Should return all 12 tables
SHOW TABLES;

-- Should show structure with all new columns
DESCRIBE users;
DESCRIBE companies;
DESCRIBE projects;

-- Should show no data (fresh install)
SELECT COUNT(*) FROM users;    -- 0
SELECT COUNT(*) FROM companies; -- 0
SELECT COUNT(*) FROM projects;  -- 0
```

---

## 🎉 Ready!

Your database is now set up with:

✅ All tables created  
✅ All relationships defined  
✅ All indexes added  
✅ Multi-tenancy support  
✅ Permission system ready  
✅ Ready for use!  

Start the server and begin using OneFlow! 🚀

