# Permission System & Multi-Tenancy - Complete Implementation Guide

## ✅ What's Implemented

A comprehensive **permission-based user management system** with **full multi-tenancy** support.

---

## 🔑 Permission System Overview

### Admin (Company Owner)
- ✅ Can create Project Managers
- ✅ Can **grant or deny** "User Management Permission" to PMs
- ✅ Can create, edit, delete ALL users in their company
- ✅ Can manage all projects in their company
- ✅ Full system control within their company

### Project Manager (WITH Permission)
- ✅ Can add Team Members
- ✅ Can edit Team Members they created
- ✅ Can delete Team Members they created
- ✅ Receives deletion confirmation emails
- ❌ Cannot create other PMs or Admins

### Project Manager (WITHOUT Permission)
- ❌ Cannot access Users menu (sees "Access Denied" message)
- ✅ Can still create and manage projects
- ✅ Can see existing team members in project assignments

---

## 🗄️ Database Migration Required

Run this SQL in MySQL Workbench:

```sql
USE oneflow_db;

-- Add permission column
ALTER TABLE users 
  ADD COLUMN can_manage_users BOOLEAN DEFAULT FALSE 
  COMMENT 'Permission for Project Managers to manage Team Members'
  AFTER created_by;

-- Add company_id to projects
ALTER TABLE projects 
  ADD COLUMN company_id INT AFTER project_manager_id;

-- Add foreign key
ALTER TABLE projects 
  ADD CONSTRAINT fk_project_company 
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Add index
CREATE INDEX idx_project_company ON projects(company_id);

-- Migrate existing projects to their PM's company
UPDATE projects p
INNER JOIN users u ON p.project_manager_id = u.id
SET p.company_id = u.company_id
WHERE p.company_id IS NULL;
```

---

## 🎯 How It Works

### Scenario 1: Admin Creates PM with Permission

```
1. Admin clicks "Add User"
2. Selects role: "Project Manager"
3. Checkbox appears: "Grant User Management Permission" ✅
4. Admin checks the box
5. PM is created with can_manage_users = true

Result:
✅ PM can access Users menu
✅ PM can add/edit/delete Team Members
✅ PM sees "Can Manage Users" badge
```

### Scenario 2: Admin Creates PM without Permission

```
1. Admin clicks "Add User"
2. Selects role: "Project Manager"
3. Checkbox appears: "Grant User Management Permission" 
4. Admin leaves unchecked (default)
5. PM is created with can_manage_users = false

Result:
❌ PM sees "Access Denied" when clicking Users menu
❌ PM cannot add users
✅ PM can still manage their projects
✅ Shows "No Permissions" badge
```

### Scenario 3: PM with Permission Adds Team Member

```
1. PM (with permission) clicks "Add Team Member"
2. Fills out form
3. Role is locked to "Team Member"
4. Team member created
5. Welcome email sent with temp password

Result:
✅ Team member can login
✅ PM can see this team member in their list
✅ PM can edit/delete this team member
✅ Admin can see all team members
```

### Scenario 4: Deleting a User

```
Admin or PM (with permission) clicks delete:
1. Confirmation dialog appears (warning: PERMANENT)
2. User confirms deletion
3. User is PERMANENTLY removed from database
4. Email sent to deleted user's email address
5. Email can now be reused for new account

Result:
✅ User completely removed (hard delete)
✅ Email notification sent
✅ Email address freed for reuse
```

---

## 🔒 Multi-Tenancy Implementation

### Complete Data Isolation

**Company A:**
- Users: Only Company A users
- Projects: Only Company A projects
- Dashboard: Only Company A statistics

**Company B:**
- Users: Only Company B users
- Projects: Only Company B projects
- Dashboard: Only Company B statistics

**No Cross-Company Access:**
- ❌ Company A admin cannot see Company B data
- ❌ Company B admin cannot see Company A data
- ✅ Complete data isolation

---

## 📋 Backend Changes

### Models Updated

#### `server/models/User.js`
```javascript
can_manage_users: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  comment: 'Permission for Project Managers to manage Team Members'
}
```

#### `server/models/Project.js`
```javascript
company_id: {
  type: DataTypes.INTEGER,
  allowNull: true,
  references: {
    model: 'companies',
    key: 'id'
  }
}
```

### Routes Updated

#### `server/routes/users.js`

**GET /api/users**
- Filters by `company_id` (multi-tenancy)
- Admin sees all users in company
- PM sees only users they created (if permission granted)

**POST /api/users**
- Checks `can_manage_users` permission for PMs
- Returns 403 if PM lacks permission
- Admin can grant permission when creating PMs
- Sets `can_manage_users` for new PMs

**PUT /api/users/:id**
- Admin can update anyone in their company
- PM with permission can update users they created
- PM without permission gets 403 error
- Only admin can change permissions

**DELETE /api/users/:id** (HARD DELETE)
- Permanently removes user from database
- Admin can delete anyone (except self)
- PM with permission can delete users they created
- Sends email notification to deleted user
- Email address freed for reuse

#### `server/routes/projects.js`
- All queries filtered by `company_id`
- Projects created with creator's `company_id`
- Multi-tenant project isolation

#### `server/routes/dashboard.js`
- All statistics scoped to user's company
- Project counts filtered by `company_id`
- Complete multi-tenant dashboard

#### `server/services/emailService.js`
- Added `sendUserDeletionEmail()` function
- Professional deletion notification email
- Explains account deletion and implications

---

## 🎨 Frontend Changes

### `client/src/pages/Users/UserForm.js`

**Permission Checkbox (Admin Only):**
- Appears only when creating Project Manager
- Checkbox to grant "User Management Permission"
- Clear explanation of what permission allows
- Hidden for Team Members and other roles

### `client/src/pages/Users/Users.js`

**Access Control:**
- PMs without permission see "Access Denied" page
- Helpful message to contact administrator
- Cannot access user management features

**Permission Column (Admin View):**
- Shows "Can Manage Users" badge for PMs with permission
- Shows "No Permissions" badge for PMs without permission
- Only visible to Admins

**Delete Confirmation:**
- Warning: "PERMANENTLY DELETE"
- Mentions email notification
- Cannot be undone

---

## 🧪 Testing Checklist

### Test 1: PM Without Permission
```
1. Login as Admin
2. Create PM (leave permission unchecked)
3. Logout
4. Login as new PM
5. Click Users menu
Expected: "Access Denied" message
```

### Test 2: PM With Permission
```
1. Login as Admin
2. Create PM (check permission box)
3. Logout
4. Login as new PM
5. Click Users menu
Expected: Can see/add/edit/delete Team Members
```

### Test 3: Hard Delete
```
1. Login as Admin or PM with permission
2. Delete a Team Member
3. Confirm deletion
4. Check email inbox
Expected: Deletion notification received
5. Try to register with same email
Expected: Works! Email is available
```

### Test 4: Multi-Tenancy
```
1. Create Company A (register new admin)
2. Add users to Company A
3. Create Company B (register another admin)
4. Login as Company B admin
Expected: Cannot see Company A users/projects
```

---

## 📧 Email Notifications

### User Deletion Email

Sent to: Deleted user's email
Subject: "OneFlow - Account Deleted"

Contains:
- Account deletion notification
- Explanation of what happened
- Information about data removal
- Email address can be reused
- Contact administrator if error

---

## 🔐 Security & Permissions Matrix

| Action | Admin | PM (with perm) | PM (no perm) | Team Member |
|--------|-------|----------------|--------------|-------------|
| Create PM | ✅ | ❌ | ❌ | ❌ |
| Create Team Member | ✅ | ✅ | ❌ | ❌ |
| View all company users | ✅ | ❌ | ❌ | ❌ |
| View created users | ✅ | ✅ | ❌ | ❌ |
| Edit any user | ✅ | ❌ | ❌ | ❌ |
| Edit created users | ✅ | ✅ | ❌ | ❌ |
| Delete any user | ✅ | ❌ | ❌ | ❌ |
| Delete created users | ✅ | ✅ | ❌ | ❌ |
| Grant permissions | ✅ | ❌ | ❌ | ❌ |
| View other companies | ❌ | ❌ | ❌ | ❌ |

---

## 📊 Data Flow

### Creating PM with Permission

```
Admin Form
└─> Select Role: "Project Manager"
    └─> Checkbox appears: "Grant User Management Permission"
        └─> Admin checks checkbox
            └─> Backend creates user with can_manage_users = true
                └─> PM can manage users ✅
```

### Creating PM without Permission

```
Admin Form
└─> Select Role: "Project Manager"
    └─> Checkbox appears: "Grant User Management Permission"
        └─> Admin leaves unchecked
            └─> Backend creates user with can_manage_users = false
                └─> PM sees "Access Denied" ❌
```

### PM Adding Team Member (With Permission)

```
PM clicks "Add Team Member"
└─> Backend checks: pm.can_manage_users === true
    └─> Permission granted ✅
        └─> Form appears
            └─> Create Team Member
                └─> created_by = PM's ID
```

### PM Adding Team Member (Without Permission)

```
PM clicks "Add Team Member"
└─> Backend checks: pm.can_manage_users === false
    └─> Permission denied ❌
        └─> Returns 403: "Access denied. You do not have permission to manage users."
            └─> Frontend shows "Access Denied" page
```

---

## 🚀 Quick Start Guide

### 1. Run Database Migration

```sql
-- Copy from PERMISSION_SYSTEM_MIGRATION.sql and execute in MySQL Workbench
```

### 2. Restart Server

Server should auto-restart with nodemon. If not:
```bash
cd server
npm run dev
```

### 3. Test the Features

**As Admin:**
1. Create a Project Manager
2. Check "Grant User Management Permission" ✅
3. Logout

**As PM (with permission):**
1. Login
2. Navigate to Users menu
3. Add a Team Member ✅
4. Edit the Team Member ✅
5. Delete the Team Member ✅
6. Check email sent ✅

**As PM (without permission):**
1. Login
2. Navigate to Users menu
3. See "Access Denied" message ❌

---

## 📁 Files Changed

### Backend
```
server/
├── models/
│   ├── User.js          (Added can_manage_users field)
│   ├── Project.js       (Added company_id field)
│   └── index.js         (Added Project-Company relationship)
├── routes/
│   ├── users.js         (Permission checks, hard delete, company filtering)
│   ├── projects.js      (Company filtering)
│   ├── dashboard.js     (Company scoping)
│   └── auth.js          (Include company in responses)
└── services/
    └── emailService.js  (Added sendUserDeletionEmail)
```

### Frontend
```
client/src/pages/
├── Users/
│   ├── Users.js         (Permission check, access denied UI)
│   └── UserForm.js      (Permission checkbox for PMs)
```

---

## ✨ Feature Summary

### ✅ Permission System
- Granular permission control for PMs
- Admin can grant/revoke permissions
- Clear "Access Denied" messages
- Permission badges in user list

### ✅ Hard Delete
- Permanent user removal
- Email notifications sent
- Email address freed for reuse
- Deletion confirmation dialog

### ✅ Multi-Tenancy
- Complete data isolation by company
- Users scoped to company
- Projects scoped to company
- Dashboard scoped to company
- No cross-company data leakage

### ✅ User Experience
- Clear permission indicators
- Helpful error messages
- Email notifications
- Professional UI/UX

---

## 🎉 Summary

Your OneFlow system now has:

✅ **Granular Permission Control** - Admins decide which PMs can manage users  
✅ **Multi-Tenant Architecture** - Complete company data isolation  
✅ **Hard Delete with Notifications** - Permanent removal with email alerts  
✅ **Secure & Scalable** - Enterprise-ready user management  
✅ **Professional UX** - Clear messages and workflows  

**Run the migration and test all features!** 🚀

