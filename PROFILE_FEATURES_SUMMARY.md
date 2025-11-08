# Profile & Users Features - Complete Implementation

## ✅ All Features Implemented!

Your system now has complete profile management with company profiles and advanced user filtering/sorting.

---

## 🎯 New Features

### 1. **Enhanced Profile Page (All Roles)**

**Three Tabs:**
1. **Personal Information** - Edit name and email
2. **Change Password** - Update password with strength indicator
3. **Company Profile** - View/edit company details

**Features:**
- ✅ Removed profile overview sidebar
- ✅ Clean 3-tab layout
- ✅ All users can edit their own info
- ✅ Password change with validation
- ✅ Company info accessible to all

### 2. **Company Profile Section**

**Admin Can Edit:**
- ✅ Company Name
- ✅ Country
- ✅ Currency
- ✅ Company Address (textarea)
- ✅ Company Logo (upload image)

**PM & Team Members Can View:**
- ✅ See all company info (read-only)
- ❌ Cannot edit (fields disabled)
- ℹ️ Message: "Only administrators can edit"

### 3. **Logo Upload**
- ✅ Upload button for admins
- ✅ Image preview
- ✅ Supports: PNG, JPG, GIF
- ✅ Max size: 5MB
- ✅ Stores in `/uploads/logos/`

### 4. **Users Page Filtering**
- ✅ Filter by Role (All, Admin, PM, Team Member, Sales/Finance)
- ✅ Filter clears when changed
- ✅ Shows filtered count

### 5. **Users Page Sorting**

**Sort Options:**
- Newest First (default)
- Oldest First
- Name (A-Z)
- Name (Z-A)
- Managers First
- Members First
- Hourly Rate (High-Low)
- Hourly Rate (Low-High)

### 6. **Edit User Functionality**
- ✅ Edit button (pencil icon) on each user
- ✅ Opens modal with user form
- ✅ Admin can edit anyone
- ✅ PM can edit users they created (if has permission)
- ✅ Updates: Name, Email, Role, Hourly Rate, Permissions

---

## 🗄️ Database Migration Required

Run this SQL:

```sql
USE oneflow_db;

-- Add address and logo to companies table
ALTER TABLE companies 
  ADD COLUMN address TEXT AFTER currency,
  ADD COLUMN logo VARCHAR(255) AFTER address;
```

---

## 📁 Backend Changes

### New Files Created:
- `server/routes/companies.js` - Company CRUD operations
- Includes logo upload with multer

### Routes Added:
```
GET    /api/companies/:id      - Get company details
PUT    /api/companies/:id      - Update company (Admin only)
POST   /api/companies/:id/logo - Upload logo (Admin only)
```

### Models Updated:
- `server/models/Company.js` - Added `address` and `logo` fields

---

## 📁 Frontend Changes

### Updated Files:

#### `client/src/pages/Profile/Profile.js`
- Complete rewrite with 3 tabs
- Personal Information tab (editable by all)
- Change Password tab (with strength indicator)
- Company Profile tab (admin edits, others view)
- Logo upload for admins
- Removed sidebar completely

#### `client/src/pages/Users/Users.js`
- Added filtering by role
- Added sorting (8 options)
- Shows filter/sort status
- Edit button on each user
- Edit modal with user form
- Fixed variable naming (userItem vs user)

#### `client/src/pages/Users/UserForm.js`
- Supports edit mode
- Pre-populates data when editing
- Different button text (Create vs Update)
- Hides password note in edit mode

#### `client/src/utils/api.js`
- Added `companyAPI` functions
- Get, Update, Upload Logo

---

## 🎨 Profile Page Layout

```
┌─────────────────────────────────────────────┐
│ User Info Card                              │
│ (Avatar, Name, Email, Role Badge)           │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Tabs: Personal | Password | Company         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ [Active Tab Content]                        │
│                                             │
│ Personal: First Name, Last Name, Email      │
│           Role (read-only), Hourly Rate     │
│                                             │
│ Password: Current, New, Confirm             │
│           Show password checkbox            │
│           Strength indicator                │
│                                             │
│ Company:  Logo Upload (Admin only)          │
│           Company Name, Country, Currency   │
│           Address                           │
│           (Read-only for non-admins)        │
└─────────────────────────────────────────────┘
```

---

## 🎯 Users Page Layout

```
┌─────────────────────────────────────────────┐
│ Header: Title + Add User Button             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Search | Role Filter | Sort By              │
│ Showing X of Y users • Filtered by... •...  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ User | Role | Rate | Permissions | Status   │
│ ─────────────────────────────────────────── │
│ John | PM   | ₹50  | Can Manage  | Active   │
│ Bob  | TM   | ₹25  |             | Active   │
│ [Edit] [Delete]                             │
└─────────────────────────────────────────────┘
```

---

## 🧪 Testing Steps

### Test 1: Profile - Personal Info
```
1. Login as any user
2. Go to Profile
3. Click "Personal Information" tab
4. Edit First Name, Last Name, Email
5. Click "Save Changes"
Result: ✅ Profile updated
```

### Test 2: Profile - Password Change
```
1. Click "Change Password" tab
2. Enter current password
3. Enter new strong password (see strength meter)
4. Confirm new password
5. Check "Show passwords" if needed
6. Click "Update Password"
Result: ✅ Password changed
```

### Test 3: Profile - Company (Admin)
```
1. Login as Admin
2. Go to Profile → Company Profile
3. Upload company logo
4. Edit company name, country, address
5. Click "Update Company Profile"
Result: ✅ Company updated, logo uploaded
```

### Test 4: Profile - Company (PM/Member)
```
1. Login as PM or Team Member
2. Go to Profile → Company Profile
3. See all company info
4. All fields are read-only (grey background)
5. No save button
Result: ✅ Can view, cannot edit
```

### Test 5: Users - Filtering
```
1. Go to Users page
2. Select "Project Manager" from role filter
3. See only PMs
4. Select "Team Member"
5. See only Team Members
Result: ✅ Filtering works
```

### Test 6: Users - Sorting
```
1. Select "Name (A-Z)" from sort dropdown
2. Users sorted alphabetically
3. Select "Hourly Rate (High-Low)"
4. Users sorted by salary
5. Select "Managers First"
6. All PMs at top, then others
Result: ✅ Sorting works
```

### Test 7: Users - Edit
```
1. Click edit icon (pencil) on a user
2. Modal opens with user data
3. Edit name, role, hourly rate
4. For PM: Toggle permission checkbox
5. Click "Update User"
Result: ✅ User updated
```

---

## 🔒 Permissions Summary

### Personal Information
- ✅ **All users** can edit their own profile
- ✅ First Name, Last Name, Email

### Password Change
- ✅ **All users** can change their password
- ✅ Requires current password
- ✅ Password strength validation

### Company Profile
- ✅ **Admin** can edit everything (name, country, currency, address, logo)
- ✅ **PM & Team Members** can VIEW only (read-only)

### User Management
- ✅ **Admin** can edit/delete anyone
- ✅ **PM with permission** can edit/delete users they created
- ✅ **PM without permission** cannot access page

---

## 📧 Logo Upload Details

### Technical Specs:
- **Accepted formats:** JPG, JPEG, PNG, GIF
- **Max size:** 5MB
- **Storage location:** `server/uploads/logos/`
- **File naming:** `company-logo-{timestamp}-{random}.{ext}`
- **Access URL:** `http://localhost:5000/uploads/logos/{filename}`

### How It Works:
1. Admin selects image file
2. Preview shown immediately
3. On save, file uploaded to server
4. Old logo deleted (if exists)
5. New logo path saved to database
6. Logo appears on next page load

---

## 🎨 UI/UX Improvements

### Profile Page:
- Modern 3-tab interface
- Clear section headers with icons
- Read-only indicators for non-admins
- Professional form layout
- Proper spacing and alignment

### Users Page:
- Advanced filtering and sorting
- Shows active filter/sort status
- Displays count (filtered vs total)
- Quick refresh button
- Edit and delete actions side by side
- Empty state when no results

---

## 📋 API Endpoints

### Company APIs (New)
```
GET    /api/companies/:id      
PUT    /api/companies/:id      (Admin only)
POST   /api/companies/:id/logo (Admin only)
```

### User APIs (Updated)
```
PUT    /api/users/:id
- Now used for editing
- Validates permissions
- Returns updated user
```

---

## 🚀 Quick Start

### Step 1: Run Database Migration
```sql
ALTER TABLE companies 
  ADD COLUMN address TEXT AFTER currency,
  ADD COLUMN logo VARCHAR(255) AFTER address;
```

### Step 2: Create Logos Directory
The server will create it automatically, but verify:
```
server/uploads/logos/
```

### Step 3: Test Features
1. Login as admin
2. Go to Profile → Company Profile
3. Upload logo, edit address
4. Go to Users
5. Try filtering and sorting
6. Edit a user
7. All should work! ✅

---

## ✨ Feature Summary

✅ **Profile Management**
- Personal info editing (all roles)
- Password change with strength indicator
- Company profile (admin edits, others view)
- Logo upload functionality
- Clean 3-tab interface

✅ **Users Management**
- Filter by role
- Sort by 8 different criteria
- Edit users (modal form)
- Delete users (permanent with email)
- Shows filtered/sorted counts

✅ **Multi-Tenancy**
- All data scoped to company
- Company profiles isolated
- Proper permission checks

---

**Everything is ready! Just run the SQL migration.** 🎉

