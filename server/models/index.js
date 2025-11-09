const User = require('./User');
const Company = require('./Company');
const Project = require('./Project');
const ProjectMember = require('./ProjectMember');
const Task = require('./Task');
const Timesheet = require('./Timesheet');
const SalesOrder = require('./SalesOrder');
const PurchaseOrder = require('./PurchaseOrder');
const CustomerInvoice = require('./CustomerInvoice');
const VendorBill = require('./VendorBill');
const Expense = require('./Expense');
const Notification = require('./Notification');

// User-Company Relationships
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Company.hasMany(User, { foreignKey: 'company_id', as: 'users' });

// Project-Company Relationships
Project.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
Company.hasMany(Project, { foreignKey: 'company_id', as: 'projects' });

// User-Creator Relationships (who created this user)
User.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(User, { foreignKey: 'created_by', as: 'createdUsers' });

// User-Project Relationships
User.hasMany(Project, { foreignKey: 'project_manager_id', as: 'managedProjects' });
Project.belongsTo(User, { foreignKey: 'project_manager_id', as: 'projectManager' });

// Project-User Many-to-Many (Team Members)
Project.belongsToMany(User, { 
  through: ProjectMember, 
  foreignKey: 'project_id',
  otherKey: 'user_id',
  as: 'members'
});
User.belongsToMany(Project, { 
  through: ProjectMember, 
  foreignKey: 'user_id',
  otherKey: 'project_id',
  as: 'projects'
});

// Project-Task Relationship
Project.hasMany(Task, { foreignKey: 'project_id', as: 'tasks' });
Task.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// User-Task Relationship (Assignee)
User.hasMany(Task, { foreignKey: 'assignee_id', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assignee_id', as: 'assignee' });

// Task-Timesheet Relationship
Task.hasMany(Timesheet, { foreignKey: 'task_id', as: 'timesheets' });
Timesheet.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

// User-Timesheet Relationship
User.hasMany(Timesheet, { foreignKey: 'user_id', as: 'timesheets' });
Timesheet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Project-SalesOrder Relationship
Project.hasMany(SalesOrder, { foreignKey: 'project_id', as: 'salesOrders' });
SalesOrder.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Project-PurchaseOrder Relationship
Project.hasMany(PurchaseOrder, { foreignKey: 'project_id', as: 'purchaseOrders' });
PurchaseOrder.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// Project-CustomerInvoice Relationship
Project.hasMany(CustomerInvoice, { foreignKey: 'project_id', as: 'customerInvoices' });
CustomerInvoice.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// SalesOrder-CustomerInvoice Relationship
SalesOrder.hasMany(CustomerInvoice, { foreignKey: 'sales_order_id', as: 'invoices' });
CustomerInvoice.belongsTo(SalesOrder, { foreignKey: 'sales_order_id', as: 'salesOrder' });

// Project-VendorBill Relationship
Project.hasMany(VendorBill, { foreignKey: 'project_id', as: 'vendorBills' });
VendorBill.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// PurchaseOrder-VendorBill Relationship
PurchaseOrder.hasMany(VendorBill, { foreignKey: 'purchase_order_id', as: 'bills' });
VendorBill.belongsTo(PurchaseOrder, { foreignKey: 'purchase_order_id', as: 'purchaseOrder' });

// Project-Expense Relationship
Project.hasMany(Expense, { foreignKey: 'project_id', as: 'expenses' });
Expense.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// User-Expense Relationship
User.hasMany(Expense, { foreignKey: 'user_id', as: 'expenses' });
Expense.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User-Notification Relationship
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  User,
  Company,
  Project,
  ProjectMember,
  Task,
  Timesheet,
  SalesOrder,
  PurchaseOrder,
  CustomerInvoice,
  VendorBill,
  Expense,
  Notification
};

