const { 
  CustomerInvoice, 
  VendorBill, 
  Expense, 
  Timesheet,
  Task,
  User
} = require('../models');
const { Op } = require('sequelize');

/**
 * Calculate total revenue for a project
 * Revenue = Sum of all paid/sent Customer Invoices linked to project
 */
const calculateProjectRevenue = async (projectId) => {
  try {
    const result = await CustomerInvoice.sum('amount', {
      where: {
        project_id: projectId,
        status: {
          [Op.in]: ['Sent', 'Paid']
        }
      }
    });
    return parseFloat(result) || 0;
  } catch (error) {
    console.error('Error calculating project revenue:', error);
    return 0;
  }
};

/**
 * Calculate total cost for a project
 * Cost = Sum of (Vendor Bills + Approved Expenses + Timesheet Costs)
 */
const calculateProjectCost = async (projectId) => {
  try {
    // 1. Vendor Bills (Submitted and Paid)
    const vendorBillsCost = await VendorBill.sum('amount', {
      where: {
        project_id: projectId,
        status: {
          [Op.in]: ['Submitted', 'Paid']
        }
      }
    }) || 0;

    // 2. Approved Expenses
    const expensesCost = await Expense.sum('amount', {
      where: {
        project_id: projectId,
        status: {
          [Op.in]: ['Approved', 'Reimbursed']
        }
      }
    }) || 0;

    // 3. Timesheet Costs
    const tasks = await Task.findAll({
      where: { project_id: projectId },
      attributes: ['id']
    });
    
    const taskIds = tasks.map(t => t.id);
    
    const timesheetCost = await Timesheet.sum('cost', {
      where: {
        task_id: {
          [Op.in]: taskIds
        }
      }
    }) || 0;

    const totalCost = parseFloat(vendorBillsCost) + parseFloat(expensesCost) + parseFloat(timesheetCost);
    return totalCost;
  } catch (error) {
    console.error('Error calculating project cost:', error);
    return 0;
  }
};

/**
 * Calculate profit for a project
 * Profit = Revenue - Cost
 */
const calculateProjectProfit = async (projectId) => {
  try {
    const revenue = await calculateProjectRevenue(projectId);
    const cost = await calculateProjectCost(projectId);
    return revenue - cost;
  } catch (error) {
    console.error('Error calculating project profit:', error);
    return 0;
  }
};

/**
 * Calculate timesheet cost automatically
 * Cost = hours_logged * user's hourly_rate
 */
const calculateTimesheetCost = async (hoursLogged, userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: ['hourly_rate']
    });
    
    if (!user) {
      return 0;
    }
    
    const cost = parseFloat(hoursLogged) * parseFloat(user.hourly_rate);
    return parseFloat(cost.toFixed(2));
  } catch (error) {
    console.error('Error calculating timesheet cost:', error);
    return 0;
  }
};

/**
 * Get complete financial summary for a project
 */
const getProjectFinancials = async (projectId) => {
  try {
    const [revenue, cost] = await Promise.all([
      calculateProjectRevenue(projectId),
      calculateProjectCost(projectId)
    ]);

    const profit = revenue - cost;
    const profitMargin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0;

    return {
      revenue: parseFloat(revenue.toFixed(2)),
      cost: parseFloat(cost.toFixed(2)),
      profit: parseFloat(profit.toFixed(2)),
      profitMargin: parseFloat(profitMargin)
    };
  } catch (error) {
    console.error('Error getting project financials:', error);
    return {
      revenue: 0,
      cost: 0,
      profit: 0,
      profitMargin: 0
    };
  }
};

module.exports = {
  calculateProjectRevenue,
  calculateProjectCost,
  calculateProjectProfit,
  calculateTimesheetCost,
  getProjectFinancials
};

