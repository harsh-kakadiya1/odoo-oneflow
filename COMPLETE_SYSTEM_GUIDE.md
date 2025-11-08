# OneFlow - Complete System Guide

## 🎉 System Overview

OneFlow is a **multi-tenant project management system** with comprehensive user management, role-based permissions, and company isolation.

---

## 📚 Quick Links

- **Database Schema:** `database_schema.sql`
- **Database Guide:** `DATABASE_README.md`
- **Profile Features:** `PROFILE_FEATURES_SUMMARY.md`
- **Permission System:** `PERMISSION_SYSTEM_MIGRATION.sql`
- **Multi-Tenancy:** `MULTI_TENANCY_MIGRATION.sql`

---

## 🚀 Getting Started

### 1. Database Setup

**Option A: Fresh Install**
```bash
# In MySQL Workbench:
File → Open SQL Script → database_schema.sql → Execute
```

**Option B: Migrate Existing Database**
```sql
# Run migrations in order:
1. SIMPLE_MIGRATION.sql
2. MULTI_TENANCY_MIGRATION.sql
3. PERMISSION_SYSTEM_MIGRATION.sql
4. PROFILE_AND_USERS_MIGRATION.sql
```

### 2. Start Servers

```bash
# Terminal 1 - Backend
cd server
npm install
npm run dev

# Terminal 2 - Frontend
cd client
npm install
npm start
```

### 3. First User Setup

1. Navigate to: `http://localhost:3000/register`
2. Fill in signup form (creates company + admin)
3. Login with credentials
4. You're the company admin!

---

## 🎯 Complete Feature List

### ✅ Signup & Authentication
- Enhanced signup with company creation
- First Name + Last Name (split fields)
- Company Name (unique)
- Country dropdown (from REST API)
- Auto-fill currency based on country
- Password strength indicator
- Email validation
- Password reset functionality

### ✅ Multi-Tenancy
- Each signup creates new company
- Complete data isolation per company
- Users scoped to company
- Projects scoped to company
- Dashboard scoped to company
- No cross-company visibility

### ✅ Permission System
- Admin can grant "User Management" permission to PMs
- Permission checkbox in user creation
- PMs with permission can manage Team Members
- PMs without permission see "Access Denied"
- Permission badges in user list

### ✅ User Management
- Create users (Admin/PM with permission)
- Edit users (name, email, role, hourly rate, permissions)
- Delete users (permanent, sends email notification)
- Email freed for reuse after deletion
- Filter by role
- Sort by 8 criteria
- Search by name/email

### ✅ Profile Management
- **Personal Information:** Edit name, email (all users)
- **Change Password:** With strength indicator (all users)
- **Company Profile:** Admin edits, others view
  - Company logo upload
  - Company name, country, currency
  - Company address

### ✅ Project Management
- Create projects (Admin/PM)
- Company-scoped projects
- Assign team members
- Track budget and timeline
- Multi-status workflow

---

## 👥 User Roles & Capabilities

### Admin (Company Owner)

**Can:**
- ✅ Create any user role
- ✅ Grant/revoke PM permissions
- ✅ Edit all company users
- ✅ Delete all company users (except self)
- ✅ Edit company profile
- ✅ Upload company logo
- ✅ View all company projects
- ✅ Create and manage projects
- ✅ Full company control

**Cannot:**
- ❌ See other companies' data
- ❌ Delete own account

### Project Manager (WITH Permission)

**Can:**
- ✅ Access Users menu
- ✅ Create Team Members
- ✅ Edit Team Members they created
- ✅ Delete Team Members they created
- ✅ Filter and sort users
- ✅ Create and manage projects
- ✅ Edit own profile
- ✅ Change password
- ✅ View company profile (read-only)

**Cannot:**
- ❌ Create other PMs or Admins
- ❌ See users created by others
- ❌ Edit company profile
- ❌ Grant permissions

### Project Manager (WITHOUT Permission)

**Can:**
- ✅ Create and manage projects
- ✅ Edit own profile
- ✅ Change password
- ✅ View company profile (read-only)

**Cannot:**
- ❌ Access Users menu (sees "Access Denied")
- ❌ Create/edit/delete users
- ❌ Edit company profile

### Team Member

**Can:**
- ✅ View assigned projects
- ✅ Complete tasks
- ✅ Log timesheets
- ✅ Submit expenses
- ✅ Edit own profile
- ✅ Change password
- ✅ View company profile (read-only)

**Cannot:**
- ❌ Access Users menu
- ❌ Create projects
- ❌ Manage other users
- ❌ Edit company profile

---

## 🔒 Security Features

### Authentication
- JWT-based authentication
- Bcrypt password hashing
- Secure password reset with tokens
- Token expiration (7 days default)

### Authorization
- Role-based access control
- Permission-based user management
- Route-level protection
- Component-level checks

### Data Security
- Multi-tenant architecture
- Company-scoped queries
- Foreign key constraints
- Input validation
- SQL injection protection

---

## 📧 Email Notifications

### Welcome Email
- Sent when user is created by Admin/PM
- Contains temporary password
- Login link included

### Deletion Email
- Sent when user is permanently deleted
- Professional template
- Explains account deletion
- Contact information

### Password Reset
- Secure token-based system
- 1-hour expiration
- One-time use tokens

---

## 🗄️ Database Schema Summary

```
companies (1)
  ↓
users (many) ← can_manage_users flag
  ↓
created users (self-referential)
  ↓
projects (many) ← company_id
  ↓
project_members, tasks, expenses, etc.
```

### Key Fields:

**users:**
- `first_name`, `last_name` (split name)
- `company_id` (multi-tenancy)
- `created_by` (audit trail)
- `can_manage_users` (permission flag)

**projects:**
- `company_id` (multi-tenancy)
- `project_manager_id`

**companies:**
- `name`, `country`, `currency`
- `address`, `logo`

---

## 🎨 UI Components

### Signup Page
- First Name, Last Name
- Email
- Company Name
- Country (dropdown)
- Currency (auto-fill)
- Password (with strength meter)

### Profile Page
- Tab 1: Personal Information
- Tab 2: Change Password
- Tab 3: Company Profile

### Users Page
- Search bar
- Role filter dropdown
- Sort dropdown
- User table with actions
- Add/Edit/Delete modals

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=oneflow_db
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="OneFlow <noreply@oneflow.com>"

# Client
CLIENT_URL=http://localhost:3000
```

---

## 📊 Data Flow

### New Company Registration
```
User fills signup form
  ↓
Creates Company record
  ↓
Creates User record (Admin, company_id set)
  ↓
User logs in
  ↓
Sees only their company data
```

### Admin Creates PM
```
Admin fills user form
  ↓
Selects Role: Project Manager
  ↓
Checkbox: Grant User Management Permission (optional)
  ↓
Creates User (role=PM, created_by=Admin's ID, can_manage_users=true/false)
  ↓
PM receives welcome email
  ↓
PM logs in
  ↓
If permission granted: Can manage users
If no permission: Can only manage projects
```

### PM Creates Team Member
```
PM (with permission) adds team member
  ↓
Creates User (role=Team Member, created_by=PM's ID, company_id=PM's company)
  ↓
Team Member receives email
  ↓
PM can edit/delete this team member
  ↓
Admin can also see and manage this team member
```

---

## 🧪 Testing Checklist

### Database
- [ ] Run `database_schema.sql`
- [ ] Verify all 12 tables created
- [ ] Check foreign keys exist
- [ ] Verify indexes created

### Signup
- [ ] Register with company details
- [ ] Country dropdown loads
- [ ] Currency auto-fills
- [ ] Password strength shows
- [ ] Becomes admin automatically

### Multi-Tenancy
- [ ] Register 2 different companies
- [ ] Verify data isolation
- [ ] Each admin sees only their data

### User Management
- [ ] Admin creates PM with permission
- [ ] PM can access Users menu
- [ ] PM can add Team Member
- [ ] PM can edit their team member
- [ ] PM can delete their team member
- [ ] Deletion email received

### Filtering & Sorting
- [ ] Filter by role works
- [ ] Sort by name works
- [ ] Sort by hourly rate works
- [ ] Shows filtered count

### Profile
- [ ] Edit personal info
- [ ] Change password
- [ ] Admin can edit company
- [ ] Admin can upload logo
- [ ] PM/Member can view company (read-only)

---

## 🎊 Complete Feature Summary

✅ **Enhanced Signup** - Company fields, country dropdown, password strength  
✅ **Multi-Tenancy** - Complete company isolation  
✅ **Permission System** - Granular PM permissions  
✅ **User Management** - Create/edit/delete with filters & sorting  
✅ **Profile Management** - 3-tab interface with company profile  
✅ **Logo Upload** - Company branding  
✅ **Email Notifications** - Welcome, deletion, password reset  
✅ **Hard Delete** - Permanent removal, email reuse  
✅ **Role-Based Access** - Proper security at all levels  
✅ **Advanced Filtering** - By role  
✅ **Advanced Sorting** - 8 sort options  
✅ **Company Profile** - Admin edits, others view  

---

## 📞 Support & Troubleshooting

### Issue: "Access Denied" for PM with permission
**Solution:**
1. Check database: `SELECT can_manage_users FROM users WHERE email='pm@email.com';`
2. Should be `1` (true)
3. PM must logout and login again
4. Check browser console for permission status

### Issue: Cannot upload logo
**Solution:**
1. Verify `server/uploads/logos/` directory exists
2. Check file size < 5MB
3. Check file type (jpg, png, gif only)
4. Verify admin role

### Issue: Users from other companies visible
**Solution:**
1. Verify `company_id` exists in users table
2. Check all users have company_id set
3. Verify backend filters by company_id

### Issue: Cannot delete user
**Solution:**
1. Check you're not trying to delete yourself
2. Verify you have permission
3. Check foreign key constraints
4. Review server logs for errors

---

## 🎯 Next Steps

1. **Run database schema:** `database_schema.sql`
2. **Start servers:** Backend and Frontend
3. **Register first company:** Creates admin user
4. **Create Project Manager:** Grant permission
5. **PM creates Team Members:** Build team
6. **Create projects:** Assign team
7. **Manage company:** Upload logo, set address

---

**Your OneFlow system is complete and ready for production use!** 🚀

---

## 📄 Documentation Files

- `database_schema.sql` - Complete DB schema
- `DATABASE_README.md` - Database documentation
- `PROFILE_FEATURES_SUMMARY.md` - Profile features guide
- `PERMISSION_SYSTEM_MIGRATION.sql` - Permission system
- `MULTI_TENANCY_MIGRATION.sql` - Multi-tenancy setup
- `COMPLETE_FEATURE_SUMMARY.md` - All features summary
- `QUICK_SETUP_GUIDE.md` - Quick reference
- `COMPLETE_SYSTEM_GUIDE.md` - This file

---

**Everything is documented and ready!** ✨

