const express = require('express');
const router = express.Router();
const { Timesheet, Task, Project, User } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

// @route   GET /api/timesheets/my
// @desc    Get current user's timesheets
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const { startDate, endDate, projectId } = req.query;
    let where = { user_id: req.user.id };

    if (startDate && endDate) {
      where.log_date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const timesheets = await Timesheet.findAll({
      where,
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title', 'project_id'],
          include: [{
            model: Project,
            as: 'project',
            attributes: ['id', 'name']
          }],
          ...(projectId && { where: { project_id: projectId } })
        }
      ],
      order: [['log_date', 'DESC'], ['created_at', 'DESC']]
    });

    // Calculate summary (all hours are billable since is_billable column doesn't exist)
    const totalHours = timesheets.reduce((sum, t) => sum + parseFloat(t.hours_logged), 0);
    const billableHours = totalHours; // All hours are billable
    const totalEarnings = timesheets.reduce((sum, t) => sum + parseFloat(t.cost), 0);

    res.status(200).json({
      success: true,
      count: timesheets.length,
      summary: {
        totalHours,
        billableHours,
        nonBillableHours: 0, // No non-billable hours
        totalEarnings,
        billablePercentage: 100 // All hours are billable
      },
      timesheets
    });
  } catch (error) {
    console.error('Get user timesheets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching timesheets'
    });
  }
});

// @route   GET /api/timesheets/project/:projectId
// @desc    Get all timesheets for a project
// @access  Private (Admin, PM, or project member)
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Get all tasks for this project
    const tasks = await Task.findAll({
      where: { project_id: projectId },
      attributes: ['id']
    });
    const taskIds = tasks.map(t => t.id);

    // Get all timesheets for these tasks
    const timesheets = await Timesheet.findAll({
      where: { task_id: taskIds },
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'hourly_rate']
        }
      ],
      order: [['log_date', 'DESC']]
    });

    // Calculate metrics (all hours are billable)
    const totalHours = timesheets.reduce((sum, t) => sum + parseFloat(t.hours_logged), 0);
    const billableHours = totalHours; // All hours are billable
    const totalCost = timesheets.reduce((sum, t) => sum + parseFloat(t.cost), 0);
    const billableCost = totalCost; // All cost is billable

    // Group by user
    const byUser = timesheets.reduce((acc, t) => {
      const userId = t.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          user: t.user,
          totalHours: 0,
          billableHours: 0,
          nonBillableHours: 0,
          cost: 0,
          entries: 0
        };
      }
      acc[userId].totalHours += parseFloat(t.hours_logged);
      acc[userId].billableHours += parseFloat(t.hours_logged); // All hours are billable
      acc[userId].cost += parseFloat(t.cost);
      acc[userId].entries += 1;
      return acc;
    }, {});

    // Group by task
    const byTask = timesheets.reduce((acc, t) => {
      const taskId = t.task_id;
      if (!acc[taskId]) {
        acc[taskId] = {
          task: t.task,
          totalHours: 0,
          cost: 0,
          users: []
        };
      }
      acc[taskId].totalHours += parseFloat(t.hours_logged);
      acc[taskId].cost += parseFloat(t.cost);
      if (!acc[taskId].users.includes(t.user_id)) {
        acc[taskId].users.push(t.user_id);
      }
      return acc;
    }, {});

    // Group by date
    const byDate = timesheets.reduce((acc, t) => {
      const date = t.log_date;
      if (!acc[date]) acc[date] = { hours: 0, cost: 0, billableHours: 0 };
      acc[date].hours += parseFloat(t.hours_logged);
      acc[date].cost += parseFloat(t.cost);
      acc[date].billableHours += parseFloat(t.hours_logged); // All hours are billable
      return acc;
    }, {});

    const workingDays = Object.keys(byDate).length;
    const avgHoursPerDay = workingDays > 0 ? totalHours / workingDays : 0;

    res.status(200).json({
      success: true,
      count: timesheets.length,
      summary: {
        totalHours,
        billableHours,
        nonBillableHours: totalHours - billableHours,
        totalCost,
        billableCost,
        nonBillableCost: totalCost - billableCost,
        workingDays,
        avgHoursPerDay,
        billableUtilization: totalHours > 0 ? (billableHours / totalHours) * 100 : 0
      },
      byUser: Object.values(byUser),
      byTask: Object.values(byTask),
      byDate,
      timesheets
    });
  } catch (error) {
    console.error('Get project timesheets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching project timesheets'
    });
  }
});

// @route   PUT /api/timesheets/:id
// @desc    Update timesheet entry
// @access  Private (Owner, Admin, or PM)
router.put('/:id', protect, async (req, res) => {
  try {
    const timesheet = await Timesheet.findByPk(req.params.id, {
      include: [{
        model: Task,
        as: 'task',
        include: [{
          model: Project,
          as: 'project'
        }]
      }]
    });

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet not found'
      });
    }

    // Check permissions
    const isOwner = timesheet.user_id === req.user.id;
    const isAdmin = req.user.role === 'Admin';
    const isPM = timesheet.task.project?.project_manager_id === req.user.id;

    if (!isOwner && !isAdmin && !isPM) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this timesheet'
      });
    }

    const { hours_logged, description, log_date } = req.body;

    // Update fields
    if (hours_logged !== undefined) {
      if (hours_logged <= 0 || hours_logged > 24) {
        return res.status(400).json({
          success: false,
          message: 'Hours must be between 0.01 and 24'
        });
      }
      timesheet.hours_logged = hours_logged;
      
      // Recalculate cost
      const user = await User.findByPk(timesheet.user_id);
      timesheet.cost = hours_logged * user.hourly_rate;
    }

    if (description !== undefined) timesheet.description = description;
    if (log_date !== undefined) timesheet.log_date = log_date;

    await timesheet.save();

    // Fetch updated timesheet with associations
    const updatedTimesheet = await Timesheet.findByPk(timesheet.id, {
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Timesheet updated successfully',
      timesheet: updatedTimesheet
    });
  } catch (error) {
    console.error('Update timesheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating timesheet'
    });
  }
});

// @route   DELETE /api/timesheets/:id
// @desc    Delete timesheet entry
// @access  Private (Owner, Admin, or PM)
router.delete('/:id', protect, async (req, res) => {
  try {
    const timesheet = await Timesheet.findByPk(req.params.id, {
      include: [{
        model: Task,
        as: 'task',
        include: [{
          model: Project,
          as: 'project'
        }]
      }]
    });

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet not found'
      });
    }

    // Check permissions
    const isOwner = timesheet.user_id === req.user.id;
    const isAdmin = req.user.role === 'Admin';
    const isPM = timesheet.task.project?.project_manager_id === req.user.id;

    if (!isOwner && !isAdmin && !isPM) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this timesheet'
      });
    }

    await timesheet.destroy();

    res.status(200).json({
      success: true,
      message: 'Timesheet deleted successfully'
    });
  } catch (error) {
    console.error('Delete timesheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting timesheet'
    });
  }
});

// @route   GET /api/timesheets/analytics/user/:userId
// @desc    Get user timesheet analytics
// @access  Private (Own data, or Admin/PM)
router.get('/analytics/user/:userId', protect, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { startDate, endDate } = req.query;

    // Permission check
    if (userId !== req.user.id && req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this data'
      });
    }

    let where = { user_id: userId };
    if (startDate && endDate) {
      where.log_date = { [Op.between]: [startDate, endDate] };
    }

    const timesheets = await Timesheet.findAll({
      where,
      include: [
        {
          model: Task,
          as: 'task',
          include: [{
            model: Project,
            as: 'project',
            attributes: ['id', 'name']
          }]
        }
      ],
      order: [['log_date', 'DESC']]
    });

    const totalHours = timesheets.reduce((sum, t) => sum + parseFloat(t.hours_logged), 0);
    const totalEarnings = timesheets.reduce((sum, t) => sum + parseFloat(t.cost), 0);
    const billableHours = totalHours; // All hours are billable

    // Group by project
    const byProject = timesheets.reduce((acc, t) => {
      const projectId = t.task?.project_id || 'none';
      const projectName = t.task?.project?.name || 'No Project';
      if (!acc[projectId]) {
        acc[projectId] = { projectId, projectName, hours: 0, earnings: 0 };
      }
      acc[projectId].hours += parseFloat(t.hours_logged);
      acc[projectId].earnings += parseFloat(t.cost);
      return acc;
    }, {});

    // Group by day of week
    const byDayOfWeek = timesheets.reduce((acc, t) => {
      const day = new Date(t.log_date).getDay();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = dayNames[day];
      if (!acc[dayName]) acc[dayName] = 0;
      acc[dayName] += parseFloat(t.hours_logged);
      return acc;
    }, {});

    // Group by date
    const byDate = timesheets.reduce((acc, t) => {
      const date = t.log_date;
      if (!acc[date]) acc[date] = { hours: 0, billable: 0, cost: 0 };
      acc[date].hours += parseFloat(t.hours_logged);
      acc[date].billable += parseFloat(t.hours_logged); // All hours are billable
      acc[date].cost += parseFloat(t.cost);
      return acc;
    }, {});

    const days = Object.keys(byDate).length;
    const avgHoursPerDay = days > 0 ? totalHours / days : 0;

    res.status(200).json({
      success: true,
      analytics: {
        totalHours,
        totalEarnings,
        billableHours,
        nonBillableHours: totalHours - billableHours,
        billablePercentage: totalHours > 0 ? (billableHours / totalHours) * 100 : 0,
        avgHoursPerDay,
        workingDays: days,
        entriesCount: timesheets.length,
        byProject: Object.values(byProject),
        byDayOfWeek,
        byDate
      },
      timesheets
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user analytics'
    });
  }
});

// @route   GET /api/timesheets/analytics/project/:projectId
// @desc    Get project timesheet analytics
// @access  Private (Admin, PM, or project member)
router.get('/analytics/project/:projectId', protect, async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Get all tasks for project
    const tasks = await Task.findAll({
      where: { project_id: projectId },
      attributes: ['id', 'title']
    });
    const taskIds = tasks.map(t => t.id);

    if (taskIds.length === 0) {
      return res.status(200).json({
        success: true,
        analytics: {
          totalHours: 0,
          totalCost: 0,
          billableHours: 0,
          byUser: [],
          byTask: [],
          byDate: {}
        },
        timesheets: []
      });
    }

    // Get all timesheets
    const timesheets = await Timesheet.findAll({
      where: { task_id: taskIds },
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'hourly_rate']
        }
      ],
      order: [['log_date', 'DESC']]
    });

    const totalHours = timesheets.reduce((sum, t) => sum + parseFloat(t.hours_logged), 0);
    const billableHours = totalHours; // All hours are billable
    const totalCost = timesheets.reduce((sum, t) => sum + parseFloat(t.cost), 0);
    const billableCost = totalCost; // All cost is billable

    // Group by user
    const byUser = timesheets.reduce((acc, t) => {
      const userId = t.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          userName: `${t.user.firstName} ${t.user.lastName}`,
          email: t.user.email,
          totalHours: 0,
          billableHours: 0,
          nonBillableHours: 0,
          cost: 0,
          entries: 0
        };
      }
      acc[userId].totalHours += parseFloat(t.hours_logged);
      acc[userId].billableHours += parseFloat(t.hours_logged); // All hours are billable
      acc[userId].cost += parseFloat(t.cost);
      acc[userId].entries += 1;
      return acc;
    }, {});

    // Group by task
    const byTask = timesheets.reduce((acc, t) => {
      const taskId = t.task_id;
      if (!acc[taskId]) {
        acc[taskId] = {
          taskId,
          taskTitle: t.task.title,
          totalHours: 0,
          cost: 0,
          userCount: 0,
          users: new Set()
        };
      }
      acc[taskId].totalHours += parseFloat(t.hours_logged);
      acc[taskId].cost += parseFloat(t.cost);
      acc[taskId].users.add(t.user_id);
      acc[taskId].userCount = acc[taskId].users.size;
      return acc;
    }, {});

    // Group by date
    const byDate = timesheets.reduce((acc, t) => {
      const date = t.log_date;
      if (!acc[date]) acc[date] = { hours: 0, cost: 0, billableHours: 0, entries: 0 };
      acc[date].hours += parseFloat(t.hours_logged);
      acc[date].cost += parseFloat(t.cost);
      acc[date].billableHours += parseFloat(t.hours_logged); // All hours are billable
      acc[date].entries += 1;
      return acc;
    }, {});

    const workingDays = Object.keys(byDate).length;
    const avgHoursPerDay = workingDays > 0 ? totalHours / workingDays : 0;

    res.status(200).json({
      success: true,
      count: timesheets.length,
      analytics: {
        totalHours,
        billableHours,
        nonBillableHours: totalHours - billableHours,
        totalCost,
        billableCost,
        nonBillableCost: totalCost - billableCost,
        billableUtilization: totalHours > 0 ? (billableHours / totalHours) * 100 : 0,
        workingDays,
        avgHoursPerDay,
        byUser: Object.values(byUser).map(u => ({ ...u, users: undefined })),
        byTask: Object.values(byTask).map(t => ({ ...t, users: undefined })),
        byDate
      },
      timesheets
    });
  } catch (error) {
    console.error('Get project analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching project analytics'
    });
  }
});

module.exports = router;

