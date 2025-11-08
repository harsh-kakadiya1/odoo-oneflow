const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const VendorBill = sequelize.define('VendorBill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bill_number: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'projects',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  purchase_order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'purchase_orders',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  vendor_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Submitted', 'Paid'),
    allowNull: false,
    defaultValue: 'Draft'
  },
  bill_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'vendor_bills',
  timestamps: true
});

module.exports = VendorBill;

