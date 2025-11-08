const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  po_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
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
  vendor_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  vendor_email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Confirmed', 'Billed'),
    allowNull: false,
    defaultValue: 'Draft'
  },
  order_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'purchase_orders',
  timestamps: true
});

module.exports = PurchaseOrder;

