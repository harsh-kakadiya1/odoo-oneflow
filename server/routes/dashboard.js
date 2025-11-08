const express = require('express');
const router = express.Router();
const { Project, Task, Expense, Timesheet, CustomerInvoice, User } = require('../models');
const { protect } = require('../middleware/auth');
const { getProjectFinancials } = require('../utils/financialCalculations');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics based on user role
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = {};
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (req.user.role === 'Admin' || req.user.role === 'Sales/Finance') {
      // Global statistics for Admin and Sales/Finance
      
      // Active projects
      stats.activeProjects = await Project.count({
        where: {
          status: { [Op.in]: ['Planned', 'In Progress'] }
        }
      });

      // Total hours logged this week
      const hoursResult = await Timesheet.sum('hours_logged', {
        where: {
          log_date: { [Op.gte]: weekAgo }
        }
      });
      stats.hoursLoggedWeek = parseFloat(hoursResult) || 0;

      // Overdue tasks
      stats.overdueTasks = await Task.count({
        where: {
          due_date: { [Op.lt]: today },
          status: { [Op.notIn]: ['Done'] }
        }
      });

      // Revenue billed this month
      const revenueResult = await CustomerInvoice.sum('amount', {
        where: {
          invoice_date: { [Op.gte]: monthAgo },
          status: { [Op.in]: ['Sent', 'Paid'] }
        }
      });
      stats.revenueBilledMonth = parseFloat(revenueResult) || 0;

      // Pending expenses count
      stats.pendingExpenses = await Expense.count({
        where: { status: 'Pending' }
      });

      // Total projects
      stats.totalProjects = await Project.count();

      // Open sales orders
      stats.openSalesOrders = await require('../models').SalesOrder.count({
        where: { status: { [Op.in]: ['Draft', 'Confirmed'] } }
      });

      // Unpaid invoices
      stats.unpaidInvoices = await CustomerInvoice.count({
        where: { status: { [Op.in]: ['Draft', 'Sent'] } }
      });

    } else if (req.user.role === 'Project Manager') {
      // Statistics for Project Manager's projects
      
      // Get PM's projects
      const myProjects = await Project.findAll({
        where: { project_manager_id: req.user.id },
        attributes: ['id']
      });
      const myProjectIds = myProjects.map(p => p.id);

      // Active projects managed
      stats.activeProjects = await Project.count({
        where: {
          id: { [Op.in]: myProjectIds },
          status: { [Op.in]: ['Planned', 'In Progress'] }
        }
      });

      // Team's hours logged this week
      const myProjectTasks = await Task.findAll({
        where: { project_id: { [Op.in]: myProjectIds } },
        attributes: ['id']
      });
      const myTaskIds = myProjectTasks.map(t => t.id);

      const hoursResult = await Timesheet.sum('hours_logged', {
        where: {
          task_id: { [Op.in]: myTaskIds },
          log_date: { [Op.gte]: weekAgo }
        }
      });
      stats.teamHoursWeek = parseFloat(hoursResult) || 0;

      // Overdue tasks in my projects
      stats.overdueTasks = await Task.count({
        where: {
          project_id: { [Op.in]: myProjectIds },
          due_date: { [Op.lt]: today },
          status: { [Op.notIn]: ['Done'] }
        }
      });

      // Pending expenses in my projects
      stats.pendingExpenses = await Expense.count({
        where: {
          project_id: { [Op.in]: myProjectIds },
          status: 'Pending'
        }
      });

      // Total projects managed
      stats.totalProjects = myProjects.length;

    } else {
      // Team Member statistics
      
      // My open tasks
      stats.openTasks = await Task.count({
        where: {
          assignee_id: req.user.id,
          status: { [Op.notIn]: ['Done'] }
        }
      });

      // My hours logged this week
      const hoursResult = await Timesheet.sum('hours_logged', {
        where: {
          user_id: req.user.id,
          log_date: { [Op.gte]: weekAgo }
        }
      });
      stats.hoursLoggedWeek = parseFloat(hoursResult) || 0;

      // My overdue tasks
      stats.overdueTasks = await Task.count({
        where: {
          assignee_id: req.user.id,
          due_date: { [Op.lt]: today },
          status: { [Op.notIn]: ['Done'] }
        }
      });

      // My pending expenses
      stats.pendingExpenses = await Expense.count({
        where: {
          user_id: req.user.id,
          status: 'Pending'
        }
      });
    }

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard statistics'
    });
  }
});

// @route   GET /api/dashboard/recent-projects
// @desc    Get recent projects for dashboard
// @access  Private
router.get('/recent-projects', protect, async (req, res) => {
  try {
    let where = {};

    if (req.user.role === 'Team Member') {
      // Show projects where user is a member
      const { ProjectMember } = require('../models');
      const memberships = await ProjectMember.findAll({
        where: { user_id: req.user.id },
        attributes: ['project_id']
      });
      const projectIds = memberships.map(m => m.project_id);
      where.id = { [Op.in]: projectIds };
    } else if (req.user.role === 'Project Manager') {
      where.project_manager_id = req.user.id;
    }

    const projects = await Project.findAll({
      where,
      include: [
        {
          model: User,
          as: 'projectManager',
          attributes: ['id', 'name']
        }
      ],
      order: [['updated_at', 'DESC']],
      limit: 5
    });

    // Get financials for each project
    const projectsWithFinancials = await Promise.all(
      projects.map(async (project) => {
        const financials = await getProjectFinancials(project.id);
        return {
          ...project.toJSON(),
          financials
        };
      })
    );

    res.status(200).json({
      success: true,
      projects: projectsWithFinancials
    });
  } catch (error) {
    console.error('Get recent projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recent projects'
    });
  }
});

// @route   GET /api/dashboard/recent-tasks
// @desc    Get recent tasks for dashboard
// @access  Private
router.get('/recent-tasks', protect, async (req, res) => {
  try {
    let where = {};

    if (req.user.role === 'Team Member') {
      where.assignee_id = req.user.id;
    }

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name']
        }
      ],
      order: [['updated_at', 'DESC']],
      limit: 10
    });

    res.status(200).json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('Get recent tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recent tasks'
    });
  }
});

module.exports = router;

