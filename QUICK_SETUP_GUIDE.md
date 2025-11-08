# Quick Setup Guide - Complete System

## ⚡ Quick Steps to Get Everything Working

### Step 1: Run Database Migration (5 minutes)

Open **MySQL Workbench** and run this:

```sql
USE oneflow_db;

-- Add permission column
ALTER TABLE users 
  ADD COLUMN can_manage_users BOOLEAN DEFAULT FALSE 
  AFTER created_by;

-- Add company to projects
ALTER TABLE projects 
  ADD COLUMN company_id INT AFTER project_manager_id,
  ADD CONSTRAINT fk_project_company 
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX idx_project_company ON projects(company_id);

-- Link existing projects to their PM's company
UPDATE projects p
INNER JOIN users u ON p.project_manager_id = u.id
SET p.company_id = u.company_id
WHERE p.company_id IS NULL;

SELECT 'Done!' AS Status;
```

### Step 2: Server Should Auto-Restart ✅

Your server should restart automatically with nodemon.

---

## 🎯 How to Use - Complete Guide

### For Company Admins

#### 1. **Register Your Company**
```
Navigate to: /register
Fill in:
- First Name: John
- Last Name: Doe
- Email: john@companya.com
- Company Name: Company A
- Country: United States (from dropdown)
- Currency: USD (auto-fills)
- Password: Strong123! (see strength meter)
- Confirm Password: Strong123!

Click: Create Account
Result: ✅ You're now Admin of Company A
```

#### 2. **Create Project Manager (WITH Permission)**
```
Navigate to: /users
Click: Add User
Fill in:
- First Name: Bob
- Last Name: Manager
- Email: bob@companya.com
- Role: Project Manager
✅ Check: "Grant User Management Permission"
- Hourly Rate: 50

Click: Create User
Result: ✅ PM created with full permissions
        ✅ Email sent to bob@companya.com
```

#### 3. **Create Project Manager (WITHOUT Permission)**
```
Same as above, but:
❌ Leave unchecked: "Grant User Management Permission"

Result: ✅ PM created without user management rights
        ✅ Can still manage projects
        ❌ Cannot manage users
```

---

### For Project Managers (WITH Permission)

#### 1. **Add Team Members**
```
Login with credentials from email
Navigate to: /users
See: "Team Members" page
Click: "Add Team Member"
Fill in:
- First Name, Last Name, Email
- Role: Team Member (locked)
- Hourly Rate: 25

Click: Create User
Result: ✅ Team Member created
        ✅ Email sent with temp password
        ✅ You can edit/delete this user
```

#### 2. **Manage Team**
```
View: List of team members you created
Edit: ✅ Click edit, update info
Delete: ✅ Click delete (permanent, sends email)
```

---

### For Project Managers (WITHOUT Permission)

```
Login → Navigate to Users
See: "Access Denied" screen
Message: "Contact administrator for permissions"

Can still:
✅ Create projects
✅ Manage projects
✅ View team members in dropdowns
```

---

## 🔑 Permission Matrix

| Feature | Admin | PM (with perm) | PM (no perm) | Team Member |
|---------|-------|----------------|--------------|-------------|
| **View Users Menu** | ✅ | ✅ | ❌ | ❌ |
| **Add Team Members** | ✅ | ✅ | ❌ | ❌ |
| **Add Project Managers** | ✅ | ❌ | ❌ | ❌ |
| **Grant Permissions** | ✅ | ❌ | ❌ | ❌ |
| **Edit Any User** | ✅ | ❌ | ❌ | ❌ |
| **Edit Created Users** | ✅ | ✅ | ❌ | ❌ |
| **Delete Any User** | ✅ | ❌ | ❌ | ❌ |
| **Delete Created Users** | ✅ | ✅ | ❌ | ❌ |
| **Create Projects** | ✅ | ✅ | ✅ | ❌ |
| **View Company Projects** | ✅ | Own Only | Own Only | Assigned |
| **View Other Companies** | ❌ | ❌ | ❌ | ❌ |

---

## 🌍 Multi-Tenancy Example

### Company A (Acme Corp)
```
Admin: John Doe
PMs: Bob (with perm), Alice (no perm)
Team Members: Mike, Sarah (created by Bob)
Projects: Project Alpha, Project Beta
Data: Completely isolated from other companies
```

### Company B (Tech Solutions)
```
Admin: Jane Smith  
PMs: Tom (with perm)
Team Members: Lisa, Frank (created by Tom)
Projects: Project Gamma
Data: Completely isolated from Company A
```

**Result:**
- ✅ John cannot see Jane's company
- ✅ Bob cannot see Tom's team members
- ✅ Projects are company-specific
- ✅ Perfect data isolation

---

## 📧 Email Notifications

### Welcome Email (New User)
```
Subject: Welcome to OneFlow - Your Account Credentials
Contains:
- Login email
- Temporary password
- Role information
- Login link
```

### Deletion Email (Deleted User)
```
Subject: OneFlow - Account Deleted
Contains:
- Account deletion notice
- Explanation
- Contact information
- Professional red-themed design
```

---

## 🚨 Important Notes

### Hard Delete
- ✅ Users are **permanently removed** from database
- ✅ Email address **immediately available** for reuse
- ✅ Email notification **always sent**
- ⚠️ **Cannot be undone** - confirmation required

### Permissions
- ✅ Only **Admin** can grant permissions
- ✅ Permissions **per Project Manager**
- ✅ Can be **granted or revoked** anytime
- ✅ Takes effect **immediately**

### Multi-Tenancy
- ✅ **Complete data isolation** by company
- ✅ **Zero cross-company access**
- ✅ **Automatic scoping** in all queries
- ✅ **Secure and compliant**

---

## ✅ Verification Steps

After migration, verify:

```sql
-- 1. Check users table has new columns
DESCRIBE users;
-- Should see: can_manage_users column

-- 2. Check projects table has company_id
DESCRIBE projects;
-- Should see: company_id column

-- 3. Check existing projects are linked
SELECT p.id, p.name, c.name AS company 
FROM projects p 
LEFT JOIN companies c ON p.company_id = c.id;
-- All projects should have a company

-- 4. Check permissions are set
SELECT first_name, last_name, role, can_manage_users 
FROM users 
WHERE role = 'Project Manager';
-- Shows which PMs have permissions
```

---

## 🎊 You're All Set!

Your system now has:

✅ **Complete signup with company fields**  
✅ **Password strength indicator**  
✅ **Permission-based user management**  
✅ **Full multi-tenancy**  
✅ **Hard delete with email notifications**  
✅ **Role-based access control**  
✅ **Enterprise-ready architecture**  

**Just run the SQL migration and start testing!** 🚀

---

## 📞 Support

If you encounter issues:

1. **Check server logs** for specific errors
2. **Verify database migration** completed successfully
3. **Check email configuration** in .env file
4. **Clear browser cache** and localStorage
5. **Restart both** client and server

**Everything should work perfectly after migration!** ✨

