-- ============================================
-- PROFILE & USERS FEATURES MIGRATION
-- Adds company address and logo fields
-- ============================================

USE oneflow_db;

-- Add address and logo columns to companies table
ALTER TABLE companies 
  ADD COLUMN address TEXT AFTER currency,
  ADD COLUMN logo VARCHAR(255) AFTER address;

-- Create logos directory (done via Node.js, but noted here)
-- Directory: server/uploads/logos/

-- Verify the migration
SELECT 'Migration completed successfully!' AS Status;

-- Show updated company structure
DESCRIBE companies;

-- Show all companies
SELECT 
  id,
  name,
  country,
  currency,
  address,
  logo,
  created_at
FROM companies
ORDER BY id;

