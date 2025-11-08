# Database Migration Guide

## Overview
This guide will help you migrate your database to support the new user fields that have been added to match the reference implementation.

## Changes Made

### 1. Frontend Changes
- ✅ Created `PasswordStrengthIndicator` component
- ✅ Created `validation.js` utility with comprehensive validation functions
- ✅ Updated Register page with new fields:
  - First Name and Last Name (instead of single name field)
  - Phone Number (optional)
  - Department (optional)
  - Employee ID (optional)
  - Password strength indicator
  - Enhanced validation
- ✅ Updated Profile page with new fields and layout

### 2. Backend Changes
- ✅ Updated User model with new fields:
  - `firstName` (required)
  - `lastName` (required)
  - `phone` (optional)
  - `department` (optional)
  - `employeeId` (optional)
  - `name` (virtual field combining firstName + lastName)
- ✅ Updated auth routes to handle new fields
- ✅ Updated users routes to support profile updates
- ✅ Enhanced password validation (8 chars minimum, uppercase, lowercase, number, special char)

## Database Migration Steps

### Step 1: Backup Your Current Database
Before making any changes, backup your existing database:

```bash
mysqldump -u your_username -p your_database_name > backup_before_migration.sql
```

### Step 2: Run Database Migration

You need to update your database schema to add the new columns. Connect to your MySQL database and run:

```sql
-- Add new columns to users table
ALTER TABLE users 
  ADD COLUMN first_name VARCHAR(50) AFTER id,
  ADD COLUMN last_name VARCHAR(50) AFTER first_name,
  ADD COLUMN phone VARCHAR(20) AFTER password_hash,
  ADD COLUMN department VARCHAR(100) AFTER phone,
  ADD COLUMN employee_id VARCHAR(50) AFTER department;

-- Migrate existing data: Split name field into first_name and last_name
UPDATE users 
SET 
  first_name = SUBSTRING_INDEX(name, ' ', 1),
  last_name = SUBSTRING_INDEX(name, ' ', -1)
WHERE first_name IS NULL OR last_name IS NULL;

-- If you want to remove the old name column (optional, as we use it as a virtual field now):
-- ALTER TABLE users DROP COLUMN name;

-- Make first_name and last_name NOT NULL after data migration
ALTER TABLE users 
  MODIFY COLUMN first_name VARCHAR(50) NOT NULL,
  MODIFY COLUMN last_name VARCHAR(50) NOT NULL;
```

### Step 3: Restart Your Server

After running the migration, restart your backend server:

```bash
cd server
npm start
```

Or if using the development script:
```bash
# From project root
npm run dev
```

### Step 4: Test the Application

1. **Test Registration:**
   - Navigate to `/register`
   - Fill in the new fields (First Name, Last Name, Email, Phone, Department, Employee ID, Password)
   - Verify password strength indicator works
   - Verify all validations work correctly

2. **Test Login:**
   - Login with existing or newly created account
   - Verify user data loads correctly

3. **Test Profile Update:**
   - Navigate to `/profile`
   - Update profile information
   - Change password with new validation rules
   - Verify password strength indicator in password change form

## New Validation Rules

### Password Requirements (Updated)
- Minimum 8 characters (previously 6)
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*(),.?":{}|<>)

### Name Validation
- First Name and Last Name: 2-30 characters
- Only letters and spaces allowed

### Phone Validation (Optional)
- 10-15 digits
- Can include spaces, dashes, +, and parentheses

### Email Validation
- Standard email format validation

## Rollback Plan

If you need to rollback the changes, restore your database backup:

```bash
mysql -u your_username -p your_database_name < backup_before_migration.sql
```

Then revert the code changes using git:

```bash
git checkout HEAD~1 -- client/src server/models server/routes
```

## Notes

1. **Existing Users:** The migration script will automatically split existing names into first and last names. If a user has only one name, it will be used for both first and last name.

2. **Optional Fields:** Phone, Department, and Employee ID are optional and can be left blank during registration or profile update.

3. **Admin Users:** The first user to register will automatically become an Admin with full system access.

4. **Password Updates:** Users with old passwords (6 characters) will need to update their passwords to meet the new requirements (8 characters with complexity rules) when they next change their password.

## Support

If you encounter any issues during migration:
1. Check the server logs for error messages
2. Verify your database connection settings
3. Ensure all npm packages are installed
4. Try clearing your browser cache and localStorage

## Summary of New Features

✅ Enhanced user registration with more detailed information
✅ Password strength indicator for better security
✅ Comprehensive form validation
✅ Improved profile management
✅ Better user experience with real-time feedback
✅ Consistent with the reference implementation (ODOO-virtual-round)

