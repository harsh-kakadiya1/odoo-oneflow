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

    // Emit socket event for real-time updates
    if (global.io) {
      global.io.emit('task:created', completeTask);
    }

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
      if (req.body.hasOwnProperty('cover_image')) task.cover_image = req.body.cover_image;

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

    // Emit socket event for real-time updates
    if (global.io) {
      global.io.emit('task:updated', updatedTask);
    }

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

    // Emit socket event for real-time updates
    if (global.io) {
      global.io.emit('task:deleted', { id: task.id });
    }

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
    const { hours_logged, description, log_date } = req.body;

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

    // Emit socket event for real-time updates
    if (global.io) {
      global.io.emit('timesheet:created', completeTimesheet);
    }

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
// @route   GET /api/tasks/:id/timesheets
// @desc    Get task timesheets
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

// @route   POST /api/tasks/:id/time
// @desc    Log time for a task
// @access  Private
router.post('/:id/time', protect, async (req, res) => {
  try {
    const { hours, description } = req.body;
    
    // Check if task exists
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }

    // Calculate cost
    const cost = await calculateTimesheetCost(parseFloat(hours), req.user.id);

    const timeEntry = await Timesheet.create({
      task_id: req.params.id,
      user_id: req.user.id,
      hours_logged: parseFloat(hours),
      description,
      log_date: new Date(),
      cost
    });

    res.status(201).json({
      success: true,
      message: 'Time logged successfully',
      timeEntry
    });
  } catch (error) {
    console.error('Log time error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error logging time'
    });
  }
});

// @route   GET /api/tasks/:id/time
// @desc    Get time entries for a task
// @access  Private
router.get('/:id/time', protect, async (req, res) => {
  try {
    const timeEntries = await Timesheet.findAll({
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
      timeEntries
    });
  } catch (error) {
    console.error('Get time entries error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching time entries'
    });
  }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { comment } = req.body;
    
    // For now, we'll store comments in a simple way
    // In a real app, you'd want a separate Comments model
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: {
        id: Date.now(),
        comment,
        user: {
          id: req.user.id,
          name: req.user.name
        },
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
});

// @route   GET /api/tasks/:id/comments
// @desc    Get task comments
// @access  Private
router.get('/:id/comments', protect, async (req, res) => {
  try {
    // For now, return empty array - would query Comments model in real app
    res.status(200).json({
      success: true,
      comments: []
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching comments'
    });
  }
});

// @route   POST /api/tasks/:id/attachments
// @desc    Upload attachment to task
// @access  Private
router.post('/:id/attachments', protect, async (req, res) => {
  try {
    // For now, mock response - would implement file upload in real app
    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      attachment: {
        id: Date.now(),
        filename: 'mock-file.pdf',
        size: 1024,
        url: '#'
      }
    });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading file'
    });
  }
});

// @route   GET /api/tasks/:id/attachments
// @desc    Get task attachments
// @access  Private
router.get('/:id/attachments', protect, async (req, res) => {
  try {
    // For now, return empty array - would query Attachments model in real app
    res.status(200).json({
      success: true,
      attachments: []
    });
  } catch (error) {
    console.error('Get attachments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching attachments'
    });
  }
});

module.exports = router;

