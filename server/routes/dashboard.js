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
    const weekAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000); // Changed from 7 days to 90 days
    const monthAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000); // Changed from 30 days to 180 days

    console.log('Dashboard stats - Today:', today.toISOString());
    console.log('Dashboard stats - Week ago (90 days):', weekAgo.toISOString());
    console.log('Dashboard stats - Month ago (180 days):', monthAgo.toISOString());

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

      // Debug: Check what timesheets exist
      const totalTimesheets = await Timesheet.count();
      console.log('Total timesheets in database:', totalTimesheets);
      
      const allTimesheets = await Timesheet.findAll({
        where: {
          task_id: { [Op.in]: taskIds }
        },
        attributes: ['hours_logged', 'log_date'],
        limit: 5
      });
      console.log('Sample timesheets:', allTimesheets.map(t => ({ hours: t.hours_logged, date: t.log_date })));
      console.log('Week ago date:', weekAgo);
      console.log('Today date:', today);

      const hoursResult = await Timesheet.sum('hours_logged', {
        where: {
          task_id: { [Op.in]: taskIds },
          log_date: { [Op.gte]: weekAgo }
        }
      });
      stats.hoursLoggedWeek = parseFloat(hoursResult) || 0;
      
      console.log('Hours result for week:', stats.hoursLoggedWeek);

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

      console.log('PM Project IDs:', myProjectIds);
      console.log('PM Task IDs:', myTaskIds);

      const hoursResult = await Timesheet.sum('hours_logged', {
        where: {
          task_id: { [Op.in]: myTaskIds },
          log_date: { [Op.gte]: weekAgo }
        }
      });
      stats.teamHoursWeek = parseFloat(hoursResult) || 0;
      
      console.log('PM Team hours result:', stats.teamHoursWeek);

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
      console.log('Team member user ID:', req.user.id);
      console.log('Week ago date for team member:', weekAgo);
      
      const hoursResult = await Timesheet.sum('hours_logged', {
        where: {
          user_id: req.user.id,
          log_date: { [Op.gte]: weekAgo }
        }
      });
      stats.hoursLoggedWeek = parseFloat(hoursResult) || 0;
      
      console.log('Team member hours result:', stats.hoursLoggedWeek);

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

// @route   GET /api/dashboard/analytics
// @desc    Get comprehensive analytics data with optional user filtering
// @access  Private
router.get('/analytics', protect, async (req, res) => {
  try {
    const analytics = {
      kpis: {},
      charts: {}
    };

    // Get filter parameters from query string
    const { user_id, date_range = '3_months' } = req.query;
    
    // Date ranges for analysis
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000);
    const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Set date filter based on range - Make ranges broader to capture data
    let dateFilter = yearAgo; // Default to 1 year instead of 3 months
    switch(date_range) {
      case '1_week': dateFilter = monthAgo; break; // 1 month instead of 1 week
      case '1_month': dateFilter = threeMonthsAgo; break; // 3 months instead of 1 month
      case '3_months': dateFilter = yearAgo; break; // 1 year instead of 3 months
      case '6_months': dateFilter = yearAgo; break;
      case '1_year': dateFilter = yearAgo; break;
    }

    // Get current user's company for multi-tenancy
    const currentUser = await User.findByPk(req.user.id);
    const companyFilter = { company_id: currentUser.company_id };

    // Debug: Check total timesheets in database
    const totalTimesheetCount = await Timesheet.count();
    console.log('Analytics - Total timesheets in database:', totalTimesheetCount);

    // Build filters for user-specific data
    let projectFilter = { ...companyFilter };
    let taskFilter = {};
    let timesheetFilter = {};
    
    if (user_id) {
      // Filter by specific user
      const targetUser = await User.findOne({
        where: { id: user_id, company_id: currentUser.company_id }
      });
      
      if (!targetUser) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user specified'
        });
      }

      // Get projects where user is manager or member
      if (targetUser.role === 'Project Manager') {
        projectFilter.project_manager_id = user_id;
      } else {
        // Get projects where user is a member
        const { ProjectMember } = require('../models');
        const memberships = await ProjectMember.findAll({
          where: { user_id: user_id },
          attributes: ['project_id']
        });
        const memberProjectIds = memberships.map(m => m.project_id);
        
        if (memberProjectIds.length > 0) {
          projectFilter.id = { [Op.in]: memberProjectIds };
        } else {
          projectFilter.id = { [Op.in]: [] }; // No projects found
        }
      }
      
      taskFilter.assignee_id = user_id;
      timesheetFilter.user_id = user_id;
    }

    // KPI Calculations with filtering
    const totalProjects = await Project.count({ where: projectFilter });
    const activeProjects = await Project.count({
      where: { ...projectFilter, status: { [Op.in]: ['In Progress'] } }
    });
    const completedProjects = await Project.count({
      where: { ...projectFilter, status: 'Completed' }
    });

    // Tasks (filtered by user if specified)
    const totalTasks = await Task.count({ 
      where: taskFilter,
      include: user_id ? [] : [{
        model: Project,
        as: 'project',
        where: companyFilter,
        attributes: []
      }]
    });
    const tasksCompleted = await Task.count({
      where: { ...taskFilter, status: 'Done' },
      include: user_id ? [] : [{
        model: Project,
        as: 'project',
        where: companyFilter,
        attributes: []
      }]
    });

    // Hours (filtered by user and date range)
    console.log('Analytics - checking hours with filters:', { timesheetFilter, dateFilter: dateFilter.toISOString() });
    
    const totalHoursLogged = await Timesheet.sum('hours_logged', {
      where: { ...timesheetFilter, log_date: { [Op.gte]: dateFilter } }
    }) || 0;
    
    console.log('Analytics - Total hours logged:', totalHoursLogged);
    
    const recentHours = await Timesheet.sum('hours_logged', {
      where: { ...timesheetFilter, log_date: { [Op.gte]: weekAgo } }
    }) || 0;
    
    console.log('Analytics - Recent hours (week):', recentHours);
    
    const avgHoursPerDay = recentHours / 7;

    // Billable vs Non-billable hours (filtered)
    const billableHours = await Timesheet.sum('hours_logged', {
      where: { ...timesheetFilter, is_billable: true, log_date: { [Op.gte]: dateFilter } }
    }) || 0;
    const nonBillableHours = await Timesheet.sum('hours_logged', {
      where: { ...timesheetFilter, is_billable: false, log_date: { [Op.gte]: dateFilter } }
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
      billablePercentage,
      filteredBy: user_id ? (await User.findByPk(user_id))?.name : 'All Users',
      dateRange: date_range
    };

    // Charts Data (with user filtering)
    // Project Progress (filtered by user's projects)
    const projectsWithTasks = await Project.findAll({
      where: projectFilter,
      include: [{
        model: Task,
        as: 'tasks',
        attributes: ['id', 'status'],
        where: user_id ? { assignee_id: user_id } : {},
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
        progress,
        totalTasks: tasks.length,
        completedTasks
      };
    }).filter(p => p.totalTasks > 0).slice(0, 10);

    // Resource Utilization (filtered by user or all users in company)
    let userFilter = { is_active: true, company_id: currentUser.company_id };
    if (user_id) {
      userFilter.id = user_id;
    }

    const usersWithHours = await User.findAll({
      where: userFilter,
      include: [{
        model: Timesheet,
        as: 'timesheets',
        where: { log_date: { [Op.gte]: dateFilter } },
        required: false
      }],
      attributes: ['id', 'name', 'hourly_rate', 'role']
    });

    analytics.charts.resourceUtilization = usersWithHours.map(user => {
      const timesheets = user.timesheets || [];
      const totalHours = timesheets.reduce((sum, ts) => sum + parseFloat(ts.hours_logged), 0);
      
      // Calculate expected hours based on date range
      const daysDiff = Math.ceil((today - dateFilter) / (1000 * 60 * 60 * 24));
      const workingDays = Math.floor(daysDiff * 5 / 7); // Approximate working days
      const expectedHours = workingDays * 8; // 8 hours per day
      
      const utilization = expectedHours > 0 ? Math.round((totalHours / expectedHours) * 100) : 0;
      
      return {
        userName: user.name.substring(0, 15) + (user.name.length > 15 ? '...' : ''),
        utilization: Math.min(utilization, 150), // Cap at 150% for overtime
        totalHours: Math.round(totalHours),
        role: user.role
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

    // Task Status Distribution
    const taskStatusCounts = await Task.findAll({
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

    // Project Status Overview
    const projectStatusCounts = await Project.findAll({
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

      console.log(`Analytics - Month ${i}: ${monthStart.toISOString()} to ${monthEnd.toISOString()}`);

      const billableHours = await Timesheet.sum('hours_logged', {
        where: {
          ...timesheetFilter,
          is_billable: true,
          log_date: { [Op.between]: [monthStart, monthEnd] }
        }
      }) || 0;

      const nonBillableHours = await Timesheet.sum('hours_logged', {
        where: {
          ...timesheetFilter,
          is_billable: false,
          log_date: { [Op.between]: [monthStart, monthEnd] }
        }
      }) || 0;

      console.log(`Analytics - Month ${i} hours: billable=${billableHours}, nonBillable=${nonBillableHours}`);

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

// @route   GET /api/dashboard/users
// @desc    Get all users for analytics filtering
// @access  Private
router.get('/users', protect, async (req, res) => {
  try {
    // Get current user's company for multi-tenancy
    const currentUser = await User.findByPk(req.user.id);
    
    const users = await User.findAll({
      where: { 
        company_id: currentUser.company_id,
        is_active: true
      },
      attributes: ['id', 'name', 'role', 'email'],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get users for analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

// @route   GET /api/dashboard/test-timesheets
// @desc    Test endpoint to check timesheet data
// @access  Private
router.get('/test-timesheets', protect, async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get all timesheets
    const allTimesheets = await Timesheet.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name']
        },
        {
          model: Task,
          as: 'task',
          attributes: ['title']
        }
      ],
      limit: 10,
      order: [['log_date', 'DESC']]
    });

    // Get timesheets from last week
    const weekTimesheets = await Timesheet.findAll({
      where: {
        log_date: { [Op.gte]: weekAgo }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name']
        }
      ]
    });

    const totalHoursThisWeek = await Timesheet.sum('hours_logged', {
      where: {
        log_date: { [Op.gte]: weekAgo }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalTimesheets: allTimesheets.length,
        weekTimesheets: weekTimesheets.length,
        totalHoursThisWeek: parseFloat(totalHoursThisWeek) || 0,
        weekAgo: weekAgo,
        today: today,
        sampleTimesheets: allTimesheets.slice(0, 5).map(t => ({
          id: t.id,
          hours: t.hours_logged,
          date: t.log_date,
          user: t.user?.name,
          task: t.task?.title
        })),
        sampleWeekTimesheets: weekTimesheets.slice(0, 5).map(t => ({
          id: t.id,
          hours: t.hours_logged,
          date: t.log_date,
          user: t.user?.name
        }))
      }
    });
  } catch (error) {
    console.error('Test timesheets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error testing timesheets'
    });
  }
});

module.exports = router;

