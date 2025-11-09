const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CustomerInvoice = sequelize.define('CustomerInvoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  invoice_number: {
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
  sales_order_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'sales_orders',
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
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  company_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Sent', 'Paid'),
    allowNull: false,
    defaultValue: 'Draft'
  },
  invoice_date: {
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
  tableName: 'customer_invoices',
  timestamps: true
});

module.exports = CustomerInvoice;

