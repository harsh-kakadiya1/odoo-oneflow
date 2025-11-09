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

    // Diagnostic: Check total projects in database
    const totalProjectsInDB = await Project.count();
    console.log(`📊 Total projects in database: ${totalProjectsInDB}`);
    
    // Build company filter - handle NULL company_id
    // If company_id is NULL, don't filter by company (show all data for backward compatibility)
    const companyWhere = currentUser.company_id 
      ? { company_id: currentUser.company_id }
      : {}; // No filter if company_id is NULL - show all data
    
    const projectsWithFilter = await Project.count({ where: companyWhere });
    console.log(`📊 Projects matching filter: ${projectsWithFilter} (company_id: ${currentUser.company_id || 'NULL'})`);

    if (req.user.role === 'Admin' || req.user.role === 'Sales/Finance') {
      // Company-wide statistics for Admin and Sales/Finance
      
      // Active projects (only from user's company)
      stats.activeProjects = await Project.count({
        where: {
          ...companyWhere,
          status: { [Op.in]: ['Planned', 'In Progress'] }
        }
      });

      console.log(`Active projects found: ${stats.activeProjects} for company ${currentUser.company_id}`);

      // Total hours logged this week - from all users in company
      // For Admin: Get hours from all users in the company (not just from tasks)
      let hoursResult = 0;
      if (currentUser.company_id) {
        // Get all users in the company
        const companyUsers = await User.findAll({
          where: { company_id: currentUser.company_id },
          attributes: ['id']
        });
        const userIds = companyUsers.map(u => u.id);
        
        if (userIds.length > 0) {
          hoursResult = await Timesheet.sum('hours_logged', {
            where: {
              user_id: { [Op.in]: userIds },
              log_date: { [Op.gte]: weekAgo }
            }
          });
        }
      } else {
        // If no company_id, get all hours (backward compatibility)
        hoursResult = await Timesheet.sum('hours_logged', {
          where: {
            log_date: { [Op.gte]: weekAgo }
          }
        });
      }
      stats.hoursLoggedWeek = parseFloat(hoursResult) || 0;

      // Overdue tasks - from all company projects (all managers' projects)
      // Get all company projects first
      const companyProjects = await Project.findAll({
        where: companyWhere,
        attributes: ['id']
      });
      const projectIds = companyProjects.map(p => p.id);
      
      console.log(`📊 Admin Dashboard - Found ${projectIds.length} projects for company ${currentUser.company_id}`);
      console.log(`📊 Project IDs:`, projectIds);
      
      // Debug: Check if there are ANY projects in the database
      if (projectIds.length === 0 && currentUser.company_id) {
        const allProjects = await Project.count();
        const projectsWithDifferentCompany = await Project.count({
          where: { company_id: { [Op.ne]: currentUser.company_id } }
        });
        console.warn(`⚠️ No projects found for company ${currentUser.company_id}!`);
        console.warn(`📊 Total projects in DB: ${allProjects}`);
        console.warn(`📊 Projects with different company_id: ${projectsWithDifferentCompany}`);
      }
      
      let overdueCount = 0;
      if (projectIds.length > 0) {
        overdueCount = await Task.count({
          where: {
            project_id: { [Op.in]: projectIds },
            due_date: { [Op.lt]: today },
            status: { [Op.notIn]: ['Done', 'Completed'] }
          }
        });
      }
      stats.overdueTasks = overdueCount;

      // Revenue billed this month - scoped to company projects
      // CustomerInvoice doesn't have company_id, so we need to join with Project
      let revenueResult = 0;
      if (projectIds.length > 0) {
        revenueResult = await CustomerInvoice.sum('amount', {
          where: {
            project_id: { [Op.in]: projectIds },
            invoice_date: { [Op.gte]: monthAgo },
            status: { [Op.in]: ['Sent', 'Paid'] }
          }
        });
      }
      stats.revenueBilledMonth = parseFloat(revenueResult) || 0;

      // Pending expenses count - scoped to company projects
      let pendingExpensesCount = 0;
      if (projectIds.length > 0) {
        pendingExpensesCount = await Expense.count({
          where: { 
            project_id: { [Op.in]: projectIds },
            status: 'Pending' 
          }
        });
      }
      stats.pendingExpenses = pendingExpensesCount;

      // Total projects (only from user's company)
      stats.totalProjects = await Project.count({
        where: companyWhere
      });

      // Open sales orders - scoped to company projects
      // SalesOrder doesn't have company_id, so we need to filter by project_id
      let openSalesOrdersCount = 0;
      if (projectIds.length > 0) {
        openSalesOrdersCount = await require('../models').SalesOrder.count({
          where: { 
            project_id: { [Op.in]: projectIds },
            status: { [Op.in]: ['Draft', 'Confirmed'] } 
          }
        });
      }
      stats.openSalesOrders = openSalesOrdersCount;

      // Unpaid invoices - scoped to company projects
      let unpaidInvoicesCount = 0;
      if (projectIds.length > 0) {
        unpaidInvoicesCount = await CustomerInvoice.count({
          where: { 
            project_id: { [Op.in]: projectIds },
            status: { [Op.in]: ['Draft', 'Sent'] } 
          }
        });
      }
      stats.unpaidInvoices = unpaidInvoicesCount;

      console.log('📊 Admin Dashboard stats calculated:', {
        userRole: req.user.role,
        userId: req.user.id,
        userName: currentUser.firstName + ' ' + currentUser.lastName,
        companyId: currentUser.company_id,
        projectIdsCount: projectIds.length,
        activeProjects: stats.activeProjects,
        overdueTasks: stats.overdueTasks,
        hoursLoggedWeek: stats.hoursLoggedWeek,
        revenueBilledMonth: stats.revenueBilledMonth,
        totalProjects: stats.totalProjects,
        openSalesOrders: stats.openSalesOrders,
        unpaidInvoices: stats.unpaidInvoices,
        pendingExpenses: stats.pendingExpenses
      });

    } else if (req.user.role === 'Project Manager') {
      // Statistics for Project Manager's projects (within their company)
      
      // Get PM's projects (only from their company, or all if no company_id)
      const pmProjectWhere = currentUser.company_id 
        ? { 
            project_manager_id: req.user.id,
            company_id: currentUser.company_id
          }
        : { project_manager_id: req.user.id };
      const myProjects = await Project.findAll({
        where: pmProjectWhere,
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

    // Ensure all required stats fields are present with defaults
    const finalStats = {
      activeProjects: stats.activeProjects || 0,
      overdueTasks: stats.overdueTasks || 0,
      hoursLoggedWeek: stats.hoursLoggedWeek || stats.teamHoursWeek || 0,
      revenueBilledMonth: stats.revenueBilledMonth || 0,
      totalProjects: stats.totalProjects || 0,
      openTasks: stats.openTasks || 0,
      pendingExpenses: stats.pendingExpenses || 0,
      openSalesOrders: stats.openSalesOrders || 0,
      unpaidInvoices: stats.unpaidInvoices || 0,
      ...stats // Override with any additional stats
    };

    console.log('✅ Final dashboard stats being sent to frontend:', JSON.stringify(finalStats, null, 2));

    res.status(200).json({
      success: true,
      stats: finalStats
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
    
    // Build where clause - handle NULL company_id
    let where = currentUser.company_id 
      ? { company_id: currentUser.company_id }
      : {}; // Show all if no company_id

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
    
    // Get all projects from user's company (or all if no company_id)
    const projectWhere = currentUser.company_id 
      ? { company_id: currentUser.company_id }
      : {};
    const companyProjects = await Project.findAll({
      where: projectWhere,
      attributes: ['id']
    });
    const projectIds = companyProjects.map(p => p.id);

    // Build where clause - handle empty projectIds
    let where = {};
    if (projectIds.length > 0) {
      where.project_id = { [Op.in]: projectIds }; // Filter by company projects
    } else {
      // If no projects, return empty result
      return res.status(200).json({
        success: true,
        tasks: []
      });
    }

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

// @route   GET /api/dashboard/charts/project-status
// @desc    Get project status distribution for all projects (for chart)
// @access  Private
router.get('/charts/project-status', protect, async (req, res) => {
  try {
    // Get current user's company for multi-tenancy
    const currentUser = await User.findByPk(req.user.id);
    
    // Build project filter - handle NULL company_id
    let projectWhere = currentUser.company_id 
      ? { company_id: currentUser.company_id }
      : {}; // Show all if no company_id

    // Apply role-based filtering
    if (req.user.role === 'Team Member') {
      const { ProjectMember } = require('../models');
      const memberships = await ProjectMember.findAll({
        where: { user_id: req.user.id },
        attributes: ['project_id']
      });
      const projectIds = memberships.map(m => m.project_id);
      projectWhere.id = { [Op.in]: projectIds };
    } else if (req.user.role === 'Project Manager') {
      projectWhere.project_manager_id = req.user.id;
    }

    // Get project status counts
    const projectStatusCounts = await Project.findAll({
      where: projectWhere,
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Format response with all statuses (defaulting to 0 if not found)
    const statusMap = {};
    projectStatusCounts.forEach(item => {
      statusMap[item.status] = parseInt(item.count);
    });

    const statusDistribution = {
      'Planned': statusMap['Planned'] || 0,
      'In Progress': statusMap['In Progress'] || 0,
      'Completed': statusMap['Completed'] || 0,
      'On Hold': statusMap['On Hold'] || 0
    };

    res.status(200).json({
      success: true,
      data: statusDistribution
    });
  } catch (error) {
    console.error('Get project status distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching project status distribution',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/dashboard/charts/task-completion
// @desc    Get task completion trend for last 7 days (for chart)
// @access  Private
router.get('/charts/task-completion', protect, async (req, res) => {
  try {
    // Get current user's company for multi-tenancy
    const currentUser = await User.findByPk(req.user.id);
    
    // Build project filter - handle NULL company_id
    let projectWhere = currentUser.company_id 
      ? { company_id: currentUser.company_id }
      : {}; // Show all if no company_id
    
    if (req.user.role === 'Team Member') {
      const { ProjectMember } = require('../models');
      const memberships = await ProjectMember.findAll({
        where: { user_id: req.user.id },
        attributes: ['project_id']
      });
      const projectIds = memberships.map(m => m.project_id);
      projectWhere.id = { [Op.in]: projectIds };
    } else if (req.user.role === 'Project Manager') {
      projectWhere.project_manager_id = req.user.id;
    }

    const companyProjects = await Project.findAll({
      where: projectWhere,
      attributes: ['id']
    });
    const projectIds = companyProjects.map(p => p.id);

    // Get task completion data for last 7 days
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Get all completed tasks in the last 7 days
    let completedTasks = [];
    if (projectIds.length > 0) {
      completedTasks = await Task.findAll({
        where: {
          project_id: { [Op.in]: projectIds },
          status: 'Done',
          updated_at: { [Op.gte]: sevenDaysAgo }
        },
        attributes: ['id', 'updated_at']
      });
    }

    // Group by day
    const dailyCounts = {};
    const dayLabels = [];
    
    // Initialize all 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayKey = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      dayLabels.push(dayLabel);
      dailyCounts[dayKey] = 0;
    }

    // Count tasks completed each day
    completedTasks.forEach(task => {
      const taskDate = new Date(task.updated_at);
      const dayKey = taskDate.toISOString().split('T')[0];
      if (dailyCounts.hasOwnProperty(dayKey)) {
        dailyCounts[dayKey]++;
      }
    });

    // Convert to array in correct order
    const completionData = dayLabels.map((label, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - index));
      const dayKey = date.toISOString().split('T')[0];
      return dailyCounts[dayKey] || 0;
    });

    res.status(200).json({
      success: true,
      data: {
        labels: dayLabels,
        values: completionData
      }
    });
  } catch (error) {
    console.error('Get task completion trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching task completion trend',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    // Build project filter - handle NULL company_id
    let projectWhere = currentUser.company_id 
      ? { company_id: currentUser.company_id }
      : {}; // Show all if no company_id
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

    // Billable vs Non-billable hours (all hours are billable since is_billable column doesn't exist)
    const billableHours = totalHoursLogged; // All hours are billable
    const nonBillableHours = 0; // No non-billable hours
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

      // All hours are billable since is_billable column doesn't exist
      const billableHours = await Timesheet.sum('hours_logged', {
        where: {
          log_date: { [Op.between]: [monthStart, monthEnd] }
        }
      }) || 0;

      const nonBillableHours = 0; // No non-billable hours

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

