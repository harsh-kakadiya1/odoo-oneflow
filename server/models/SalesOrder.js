const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SalesOrder = sequelize.define('SalesOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_number: {
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
  customer_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  customer_email: {
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
  tableName: 'sales_orders',
  timestamps: true
});

module.exports = SalesOrder;

