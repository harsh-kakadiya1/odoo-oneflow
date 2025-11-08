#!/usr/bin/env node

/**
 * Seed Test Data Script
 * 
 * This script populates the OneFlow database with comprehensive test data
 * including companies, users, projects, tasks, timesheets, sales orders,
 * invoices, expenses, and more.
 * 
 * Usage: npm run seed
 */

require('dotenv').config();
const seedTestData = require('./seedTestData');

console.log('🌱 OneFlow Test Data Seeder');
console.log('==========================');

seedTestData();