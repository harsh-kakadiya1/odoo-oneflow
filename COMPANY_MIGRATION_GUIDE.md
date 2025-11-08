# Company Feature Migration Guide

## Overview
This guide will help you migrate your database to support the new company-based user registration system that matches the reference implementation.

## What's New

### Key Changes
1. **Company Model**: New `companies` table to store company information
2. **User Model**: Updated with `company_id` foreign key linking users to companies
3. **Registration Flow**: Users now create a company during registration
4. **Fields Removed**: `phone`, `department`, and `employee_id` fields removed from users
5. **Fields Added**: Users split into `first_name` and `last_name`; companies have `name`, `country`, and `currency`

## Database Migration Steps

### Step 1: Backup Your Current Database
**CRITICAL: Always backup before making schema changes!**

```bash
mysqldump -u your_username -p your_database_name > backup_before_company_migration.sql
```

### Step 2: Create Companies Table

```sql
CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  country VARCHAR(100) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_company_name (name),
  INDEX idx_company_country (country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Step 3: Update Users Table

#### 3.1: Add new columns (if not already present from previous migration)

```sql
-- Add first_name and last_name if they don't exist
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(50) AFTER id,
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(50) AFTER first_name;

-- Migrate existing name data if needed
UPDATE users 
SET 
  first_name = COALESCE(first_name, SUBSTRING_INDEX(name, ' ', 1)),
  last_name = COALESCE(last_name, SUBSTRING_INDEX(name, ' ', -1))
WHERE first_name IS NULL OR last_name IS NULL;

-- Make them NOT NULL after data migration
ALTER TABLE users 
  MODIFY COLUMN first_name VARCHAR(50) NOT NULL,
  MODIFY COLUMN last_name VARCHAR(50) NOT NULL;
```

#### 3.2: Add company_id column

```sql
-- Add company_id column
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS company_id INT AFTER last_name,
  ADD CONSTRAINT fk_user_company 
    FOREIGN KEY (company_id) 
    REFERENCES companies(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_user_company ON users(company_id);
```

#### 3.3: Remove old optional columns (phone, department, employee_id)

**⚠️ WARNING: This will permanently delete data in these columns!**

```sql
-- Remove phone, department, and employee_id columns
ALTER TABLE users 
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS department,
  DROP COLUMN IF EXISTS employee_id;
```

### Step 4: Migrate Existing Data

For existing users without companies, you have two options:

#### Option A: Create a Default Company for All Existing Users

```sql
-- Create a default company
INSERT INTO companies (name, country, currency, is_active)
VALUES ('Default Company', 'United States', 'USD', TRUE);

-- Get the created company ID
SET @default_company_id = LAST_INSERT_ID();

-- Associate all existing users with this company
UPDATE users 
SET company_id = @default_company_id
WHERE company_id IS NULL;
```

#### Option B: Create Individual Companies for Each User

```sql
-- This is useful if users are from different organizations
-- For each existing user, create a company named after them
INSERT INTO companies (name, country, currency, is_active)
SELECT 
  CONCAT(first_name, ' ', last_name, ' Company'),
  'United States',
  'USD',
  TRUE
FROM users 
WHERE company_id IS NULL;

-- Then manually associate users with their companies
-- (This requires custom logic based on your data)
```

### Step 5: Verify Migration

```sql
-- Check that all users have companies
SELECT 
  u.id,
  u.first_name,
  u.last_name,
  u.email,
  c.name as company_name,
  c.country,
  c.currency
FROM users u
LEFT JOIN companies c ON u.company_id = c.id;

-- Check for any users without companies
SELECT COUNT(*) as users_without_company
FROM users
WHERE company_id IS NULL;

-- Check all companies
SELECT * FROM companies;
```

## Testing the Changes

### 1. Test New User Registration

```bash
# Start your server
cd server
npm start
```

```bash
# Start your client
cd client
npm start
```

Navigate to `/register` and create a new account with:
- First Name
- Last Name
- Email
- Company Name
- Country (dropdown)
- Currency (auto-populated)
- Password
- Confirm Password

### 2. Test User Login

- Login with the newly created account
- Verify company information appears in profile

### 3. Test Admin User Creation

- Login as admin
- Create a new user
- Verify the user is associated with the admin's company

## Rollback Plan

If you need to rollback:

```bash
# Restore from backup
mysql -u your_username -p your_database_name < backup_before_company_migration.sql
```

Then revert code changes:

```bash
git checkout HEAD~1 -- client/src server/models server/routes
```

## Updated API Endpoints

### Registration Endpoint
```
POST /api/auth/signup
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecureP@ss123",
  "companyName": "Acme Corp",
  "country": "US",
  "currency": "USD"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "Admin",
    "company": {
      "id": 1,
      "name": "Acme Corp",
      "country": "US",
      "currency": "USD"
    }
  }
}
```

### Login Endpoint
```
POST /api/auth/login
```

Returns user object with company information included.

## Frontend Changes Summary

### New Files Created
1. `client/src/services/currencyService.js` - Fetches countries and currencies from external APIs
2. `client/src/contexts/CurrencyContext.js` - Manages currency state globally

### Updated Components
1. **Register Page** (`client/src/pages/Auth/Register.js`)
   - Added: Company Name, Country (dropdown), Currency (auto-fill)
   - Removed: Phone, Department, Employee ID
   - Country dropdown auto-updates currency based on selection

2. **Profile Page** (`client/src/pages/Profile/Profile.js`)
   - Removed: Phone, Department, Employee ID fields
   - Added: Company information in sidebar

3. **UserForm** (`client/src/pages/Users/UserForm.js`)
   - Removed: Phone, Department, Employee ID fields
   - Users created by admin are automatically associated with admin's company

## Environment Variables

No new environment variables required. The currency service uses public APIs:
- Countries: https://restcountries.com/v3.1/all
- Exchange Rates: https://api.exchangerate-api.com/v4/latest/{currency}

## Important Notes

1. **First User**: The first user to register creates both a user account and a company, and becomes an Admin
2. **Subsequent Users**: Regular users registering later create their own companies
3. **Admin Created Users**: Users created by admin in the system are automatically associated with the admin's company
4. **Company Names**: Must be unique across the system
5. **Currency Auto-Update**: Currency automatically updates when country is selected based on country's primary currency
6. **Fallback Countries**: If the external API is unavailable, a fallback list of 10 major countries is provided

## Troubleshooting

### Issue: "Company name is already taken"
**Solution**: Each company name must be unique. Choose a different name.

### Issue: Countries dropdown is empty
**Solution**: Check your internet connection. The app fetches countries from an external API. If the API is down, it will use a fallback list of 10 countries.

### Issue: Users can't see their company information
**Solution**: Ensure the login endpoint includes company data. Check that the user has a valid `company_id` in the database.

### Issue: Migration fails with foreign key constraint error
**Solution**: Make sure you create the `companies` table before adding the `company_id` foreign key to the `users` table.

## Summary of Changes

### Removed Fields
- ❌ `phone` - Optional phone number
- ❌ `department` - Optional department field
- ❌ `employee_id` - Optional employee ID

### Added Fields

**Users Table:**
- ✅ `first_name` - User's first name (required)
- ✅ `last_name` - User's last name (required)
- ✅ `company_id` - Foreign key to companies table

**Companies Table (New):**
- ✅ `id` - Primary key
- ✅ `name` - Company name (unique, required)
- ✅ `country` - Company country (required)
- ✅ `currency` - Company currency (required, default 'USD')
- ✅ `is_active` - Active status
- ✅ `created_at` - Creation timestamp
- ✅ `updated_at` - Update timestamp

## Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify database schema matches the migration scripts
3. Ensure all npm packages are installed (`npm install`)
4. Clear browser cache and localStorage
5. Verify foreign key constraints are properly set up

---

**Migration Status**: Complete  
**Estimated Time**: 15-30 minutes  
**Complexity**: Medium  
**Risk Level**: Medium (involves schema changes and data migration)

