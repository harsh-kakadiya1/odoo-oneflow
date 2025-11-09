-- ============================================
-- DATABASE MIGRATION: Add Missing Columns
-- ============================================
-- This script adds columns that exist in Sequelize models but are missing from the database
-- Run this to fix column mismatch errors
-- ============================================

USE oneflow_db;

-- ============================================
-- 1. SALES ORDERS: Rename 'notes' to 'description'
-- ============================================
ALTER TABLE sales_orders 
CHANGE COLUMN notes description TEXT;

-- ============================================
-- 2. PURCHASE ORDERS: Rename 'notes' to 'description'
-- ============================================
ALTER TABLE purchase_orders 
CHANGE COLUMN notes description TEXT;

-- ============================================
-- 3. CUSTOMER INVOICES: Rename 'notes' to 'description'
-- ============================================
ALTER TABLE customer_invoices 
CHANGE COLUMN notes description TEXT;

-- ============================================
-- 4. VENDOR BILLS: Rename 'notes' to 'description'
-- ============================================
ALTER TABLE vendor_bills 
CHANGE COLUMN notes description TEXT;

-- ============================================
-- 5. EXPENSES: Rename 'receipt_path' to 'receipt_url'
-- ============================================

-- Rename receipt_path to receipt_url and increase size
ALTER TABLE expenses 
CHANGE COLUMN receipt_path receipt_url VARCHAR(500);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the changes were applied successfully:

-- Check sales_orders columns
-- SELECT COLUMN_NAME, DATA_TYPE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'sales_orders' AND TABLE_SCHEMA = 'oneflow_db'
-- ORDER BY ORDINAL_POSITION;

-- Check purchase_orders columns
-- SELECT COLUMN_NAME, DATA_TYPE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'purchase_orders' AND TABLE_SCHEMA = 'oneflow_db'
-- ORDER BY ORDINAL_POSITION;

-- Check customer_invoices columns
-- SELECT COLUMN_NAME, DATA_TYPE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'customer_invoices' AND TABLE_SCHEMA = 'oneflow_db'
-- ORDER BY ORDINAL_POSITION;

-- Check vendor_bills columns
-- SELECT COLUMN_NAME, DATA_TYPE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'vendor_bills' AND TABLE_SCHEMA = 'oneflow_db'
-- ORDER BY ORDINAL_POSITION;

-- Check expenses columns
-- SELECT COLUMN_NAME, DATA_TYPE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'expenses' AND TABLE_SCHEMA = 'oneflow_db'
-- ORDER BY ORDINAL_POSITION;

