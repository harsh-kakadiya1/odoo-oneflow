const express = require('express');
const router = express.Router();
const { Task, Project, User, Timesheet } = require('../models');
const { protect, isProjectMember } = require('../middleware/auth');
const { notifyTaskAssigned } = require('../services/notificationService');
const { calculateTimesheetCost } = require('../utils/financialCalculations');
const { Op } = require('sequelize');

// @route   GET /api/tasks
// @desc    Get all tasks (filtered by role and query params)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { project_id, assignee, status, priority } = req.query;
    let where = {};

    if (project_id) {
      where.project_id = project_id;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    // Filter by assignee
    if (assignee === 'me') {
      where.assignee_id = req.user.id;
    } else if (assignee) {
      where.assignee_id = assignee;
    }

    // Role-based filtering
    if (req.user.role === 'Team Member' && !assignee) {
      // Team members see only their assigned tasks by default
      where.assignee_id = req.user.id;
    }

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tasks'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task with timesheets
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'status']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Timesheet,
          as: 'timesheets',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          }]
        }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching task'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private (Admin, Project Manager of project)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, project_id, assignee_id, due_date, priority, status } = req.body;

    if (!title || !project_id) {
      return res.status(400).json({
        success: false,
        message: 'Title and project are required'
      });
    }

    // Verify project exists and user has permission
    const project = await Project.findByPk(project_id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'Admin' && project.project_manager_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create tasks in this project'
      });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      project_id,
      assignee_id,
      due_date,
      priority: priority || 'Medium',
      status: status || 'New'
    });

    // Notify assignee
    if (assignee_id) {
      await notifyTaskAssigned(assignee_id, title, project.name);
    }

    // Fetch complete task
    const completeTask = await Task.findByPk(task.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: completeTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating task'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private (Admin, PM, or Assignee can update status)
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{
        model: Project,
        as: 'project'
      }]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const { title, description, assignee_id, due_date, priority, status } = req.body;

    // Team members can only update status of their own tasks
    if (req.user.role === 'Team Member') {
      if (task.assignee_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this task'
        });
      }
      // Team member can only update status
      if (status) task.status = status;
      await task.save();
    } else {
      // Admin and PM can update all fields
      if (req.user.role !== 'Admin' && task.project.project_manager_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this task'
        });
      }

      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignee_id !== undefined) {
        const oldAssignee = task.assignee_id;
        task.assignee_id = assignee_id;
        
        // Notify new assignee if changed
        if (assignee_id && assignee_id !== oldAssignee) {
          await notifyTaskAssigned(assignee_id, task.title, task.project.name);
        }
      }
      if (due_date !== undefined) task.due_date = due_date;
      if (priority) task.priority = priority;
      if (status) task.status = status;

      await task.save();
    }

    // Fetch updated task
    const updatedTask = await Task.findByPk(task.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating task'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (Admin, PM of project)
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{
        model: Project,
        as: 'project'
      }]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'Admin' && task.project.project_manager_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await task.destroy();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting task'
    });
  }
});

// @route   POST /api/tasks/:id/timesheets
// @desc    Log hours on a task
// @access  Private (Assignee or Admin)
router.post('/:id/timesheets', protect, async (req, res) => {
  try {
    const { hours_logged, description, is_billable, log_date } = req.body;

    if (!hours_logged || hours_logged <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Hours logged must be greater than 0'
      });
    }

    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Calculate cost
    const cost = await calculateTimesheetCost(hours_logged, req.user.id);

    // Create timesheet
    const timesheet = await Timesheet.create({
      task_id: task.id,
      user_id: req.user.id,
      hours_logged,
      log_date: log_date || new Date(),
      description,
      is_billable: is_billable !== undefined ? is_billable : true,
      cost
    });

    // Fetch complete timesheet
    const completeTimesheet = await Timesheet.findByPk(timesheet.id, {
      include: [
        {
          model: Task,
          as: 'task',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Hours logged successfully',
      timesheet: completeTimesheet
    });
  } catch (error) {
    console.error('Log timesheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error logging hours'
    });
  }
});

// @route   GET /api/tasks/:id/timesheets
// @desc    Get all timesheets for a task
// @access  Private
router.get('/:id/timesheets', protect, async (req, res) => {
  try {
    const timesheets = await Timesheet.findAll({
      where: { task_id: req.params.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['log_date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: timesheets.length,
      timesheets
    });
  } catch (error) {
    console.error('Get timesheets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching timesheets'
    });
  }
});

module.exports = router;

