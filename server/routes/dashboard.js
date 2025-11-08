const express = require('express');
const router = express.Router();
const { Project, Task, Expense, Timesheet, CustomerInvoice, User, Company } = require('../models');
const { protect } = require('../middleware/auth');
const { getProjectFinancials } = require('../utils/financialCalculations');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics based on user role (scoped to company)
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = {};
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get current user's company for multi-tenancy
    const currentUser = await User.findByPk(req.user.id, {
      include: [{ model: require('../models').Company, as: 'company' }]
    });

    console.log(`Dashboard stats for user: ${currentUser.name} (${currentUser.role}) from company: ${currentUser.company_id}`);

    if (req.user.role === 'Admin' || req.user.role === 'Sales/Finance') {
      // Company-wide statistics for Admin and Sales/Finance
      
      // Active projects (only from user's company)
      stats.activeProjects = await Project.count({
        where: {
          company_id: currentUser.company_id,
          status: { [Op.in]: ['Planned', 'In Progress'] }
        }
      });

      console.log(`Active projects found: ${stats.activeProjects} for company ${currentUser.company_id}`);

      // Total hours logged this week - scoped to company projects
      const companyProjects = await Project.findAll({
        where: { company_id: currentUser.company_id },
        attributes: ['id']
      });
      const projectIds = companyProjects.map(p => p.id);
      
      const companyTasks = await Task.findAll({
        where: { project_id: { [Op.in]: projectIds } },
        attributes: ['id']
      });
      const taskIds = companyTasks.map(t => t.id);

      const hoursResult = await Timesheet.sum('hours_logged', {
        where: {
          task_id: { [Op.in]: taskIds },
          log_date: { [Op.gte]: weekAgo }
        }
      });
      stats.hoursLoggedWeek = parseFloat(hoursResult) || 0;

      // Overdue tasks - scoped to company projects  
      stats.overdueTasks = await Task.count({
        where: {
          project_id: { [Op.in]: projectIds },
          due_date: { [Op.lt]: today },
          status: { [Op.notIn]: ['Done'] }
        }
      });

      // Revenue billed this month - scoped to company
      const revenueResult = await CustomerInvoice.sum('amount', {
        where: {
          company_id: currentUser.company_id,
          invoice_date: { [Op.gte]: monthAgo },
          status: { [Op.in]: ['Sent', 'Paid'] }
        }
      });
      stats.revenueBilledMonth = parseFloat(revenueResult) || 0;

      // Pending expenses count - scoped to company projects
      stats.pendingExpenses = await Expense.count({
        where: { 
          project_id: { [Op.in]: projectIds },
          status: 'Pending' 
        }
      });

      // Total projects (only from user's company)
      stats.totalProjects = await Project.count({
        where: { company_id: currentUser.company_id }
      });

      // Open sales orders - scoped to company
      stats.openSalesOrders = await require('../models').SalesOrder.count({
        where: { 
          company_id: currentUser.company_id,
          status: { [Op.in]: ['Draft', 'Confirmed'] } 
        }
      });

      // Unpaid invoices - scoped to company
      stats.unpaidInvoices = await CustomerInvoice.count({
        where: { 
          company_id: currentUser.company_id,
          status: { [Op.in]: ['Draft', 'Sent'] } 
        }
      });

      console.log('Dashboard stats calculated:', stats);

    } else if (req.user.role === 'Project Manager') {
      // Statistics for Project Manager's projects (within their company)
      
      // Get PM's projects (only from their company)
      const myProjects = await Project.findAll({
        where: { 
          project_manager_id: req.user.id,
          company_id: currentUser.company_id
        },
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
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      sql: error.sql
    });
    res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/dashboard/recent-projects
// @desc    Get recent projects for dashboard (scoped to company)
// @access  Private
router.get('/recent-projects', protect, async (req, res) => {
  try {
    // Get current user's company for multi-tenancy
    const currentUser = await User.findByPk(req.user.id);
    
    let where = {
      company_id: currentUser.company_id // Only show projects from user's company
    };

    if (req.user.role === 'Team Member') {
      // Show projects where user is a member (within their company)
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
          attributes: ['id', 'firstName', 'lastName']
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
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      sql: error.sql
    });
    res.status(500).json({
      success: false,
      message: 'Server error fetching recent projects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/dashboard/recent-tasks
// @desc    Get recent tasks for dashboard (scoped to company)
// @access  Private
router.get('/recent-tasks', protect, async (req, res) => {
  try {
    // Get current user's company for multi-tenancy
    const currentUser = await User.findByPk(req.user.id);
    
    // Get all projects from user's company
    const companyProjects = await Project.findAll({
      where: { company_id: currentUser.company_id },
      attributes: ['id']
    });
    const projectIds = companyProjects.map(p => p.id);

    let where = {
      project_id: { [Op.in]: projectIds } // Filter by company projects
    };

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
          attributes: ['id', 'firstName', 'lastName']
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

// @route   GET /api/dashboard/analytics
// @desc    Get comprehensive analytics data with filtering
// @access  Private
router.get('/analytics', protect, async (req, res) => {
  try {
    const analytics = {
      kpis: {},
      charts: {}
    };

    // Get current user for company filtering
    const currentUser = await User.findByPk(req.user.id);
    
    // Get filters from query params
    const { managerId, memberId } = req.query;

    // Date ranges for analysis
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Build project filter with company_id
    let projectWhere = { company_id: currentUser.company_id };
    if (managerId && managerId !== 'all') {
      projectWhere.project_manager_id = parseInt(managerId);
    }

    // Get filtered projects
    const filteredProjects = await Project.findAll({
      where: projectWhere,
      attributes: ['id']
    });
    const projectIds = filteredProjects.map(p => p.id);

    // Build task filter
    let taskWhere = { project_id: { [Op.in]: projectIds } };
    if (memberId && memberId !== 'all') {
      taskWhere.assignee_id = parseInt(memberId);
    }

    // KPI Calculations
    // Total Projects
    const totalProjects = await Project.count({ where: projectWhere });
    const activeProjects = await Project.count({
      where: { ...projectWhere, status: { [Op.in]: ['In Progress'] } }
    });
    const completedProjects = await Project.count({
      where: { ...projectWhere, status: 'Completed' }
    });

    // Tasks
    const totalTasks = await Task.count({ where: taskWhere });
    const tasksCompleted = await Task.count({
      where: { ...taskWhere, status: 'Done' }
    });

    // Hours
    const totalHoursLogged = await Timesheet.sum('hours_logged') || 0;
    const recentHours = await Timesheet.sum('hours_logged', {
      where: { log_date: { [Op.gte]: weekAgo } }
    }) || 0;
    const avgHoursPerDay = recentHours / 7;

    // Billable vs Non-billable hours
    const billableHours = await Timesheet.sum('hours_logged', {
      where: { is_billable: true }
    }) || 0;
    const nonBillableHours = await Timesheet.sum('hours_logged', {
      where: { is_billable: false }
    }) || 0;
    const billablePercentage = totalHoursLogged > 0 ? Math.round((billableHours / totalHoursLogged) * 100) : 0;

    analytics.kpis = {
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      tasksCompleted,
      totalHoursLogged: Math.round(totalHoursLogged),
      avgHoursPerDay: Math.round(avgHoursPerDay * 10) / 10,
      billableHours: Math.round(billableHours),
      nonBillableHours: Math.round(nonBillableHours),
      billablePercentage
    };

    // Charts Data
    // Project Progress - use filtered projects
    const projectsWithTasks = await Project.findAll({
      where: projectWhere,
      include: [{
        model: Task,
        as: 'tasks',
        attributes: ['id', 'status'],
        where: memberId && memberId !== 'all' ? { assignee_id: parseInt(memberId) } : {},
        required: false
      }],
      attributes: ['id', 'name']
    });

    analytics.charts.projectProgress = projectsWithTasks.map(project => {
      const tasks = project.tasks || [];
      const completedTasks = tasks.filter(task => task.status === 'Done').length;
      const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
      
      return {
        projectName: project.name.substring(0, 20) + (project.name.length > 20 ? '...' : ''),
        progress
      };
    }).slice(0, 10);

    // Resource Utilization
    let userWhere = { is_active: true, company_id: currentUser.company_id };
    if (memberId && memberId !== 'all') {
      userWhere.id = parseInt(memberId);
    }
    
    const usersWithHours = await User.findAll({
      include: [{
        model: Timesheet,
        as: 'timesheets',
        where: { log_date: { [Op.gte]: threeMonthsAgo } },
        required: false
      }],
      where: userWhere,
      attributes: ['id', 'firstName', 'lastName', 'hourly_rate']
    });

    analytics.charts.resourceUtilization = usersWithHours.map(user => {
      const timesheets = user.timesheets || [];
      const totalHours = timesheets.reduce((sum, ts) => sum + parseFloat(ts.hours_logged), 0);
      // Assuming 40 hours/week * 12 weeks = 480 hours for 3 months
      const expectedHours = 480;
      const utilization = expectedHours > 0 ? Math.round((totalHours / expectedHours) * 100) : 0;
      
      const fullName = `${user.firstName} ${user.lastName}`;
      return {
        userName: fullName.substring(0, 15) + (fullName.length > 15 ? '...' : ''),
        utilization: Math.min(utilization, 100) // Cap at 100%
      };
    }).slice(0, 10);

    // Project Cost vs Revenue
    analytics.charts.costRevenue = [];
    for (const project of projectsWithTasks.slice(0, 10)) {
      const financials = await getProjectFinancials(project.id);
      analytics.charts.costRevenue.push({
        projectName: project.name.substring(0, 15) + (project.name.length > 15 ? '...' : ''),
        cost: financials.totalExpenses + financials.laborCost,
        revenue: financials.totalRevenue || project.budget || 0
      });
    }

    // Task Status Distribution - use filtered tasks
    const taskStatusCounts = await Task.findAll({
      where: taskWhere,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    analytics.charts.taskDistribution = taskStatusCounts.map(item => ({
      name: item.status,
      value: parseInt(item.count)
    }));

    // Project Status Overview - use filtered projects
    const projectStatusCounts = await Project.findAll({
      where: projectWhere,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    analytics.charts.projectStatus = {};
    projectStatusCounts.forEach(item => {
      const status = item.status.toLowerCase().replace(' ', '');
      analytics.charts.projectStatus[status] = parseInt(item.count);
    });

    // Monthly Hours Trend (last 6 months)
    const monthlyHoursData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const billableHours = await Timesheet.sum('hours_logged', {
        where: {
          is_billable: true,
          log_date: { [Op.between]: [monthStart, monthEnd] }
        }
      }) || 0;

      const nonBillableHours = await Timesheet.sum('hours_logged', {
        where: {
          is_billable: false,
          log_date: { [Op.between]: [monthStart, monthEnd] }
        }
      }) || 0;

      monthlyHoursData.push({
        month: date.toLocaleString('default', { month: 'short' }),
        billable: Math.round(billableHours),
        nonBillable: Math.round(nonBillableHours)
      });
    }

    analytics.charts.monthlyHours = monthlyHoursData;

    res.status(200).json({
      success: true,
      ...analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics data'
    });
  }
});

module.exports = router;

