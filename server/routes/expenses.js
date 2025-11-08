const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Expense, Project, User } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { notifyExpenseApproved, notifyExpenseRejected, notifyExpensePendingApproval } = require('../services/notificationService');
const { Op } = require('sequelize');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/receipts/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
});

// @route   GET /api/expenses
// @desc    Get all expenses (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { project_id, status, user_id, search } = req.query;
    let where = {};

    if (project_id) {
      where.project_id = project_id;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.description = { [Op.like]: `%${search}%` };
    }

    // Role-based filtering
    if (req.user.role === 'Team Member' && !user_id) {
      // Team members see only their own expenses by default
      where.user_id = req.user.id;
    } else if (user_id) {
      where.user_id = user_id;
    }

    const expenses = await Expense.findAll({
      where,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching expenses'
    });
  }
});

// @route   GET /api/expenses/:id
// @desc    Get single expense
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'project_manager_id']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      expense
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching expense'
    });
  }
});

// @route   POST /api/expenses
// @desc    Create new expense
// @access  Private (All authenticated users)
router.post('/', protect, upload.single('receipt'), async (req, res) => {
  try {
    const { description, project_id, amount, is_billable, expense_date, category } = req.body;

    if (!description || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Description and amount are required'
      });
    }

    const receipt_url = req.file ? `/uploads/receipts/${req.file.filename}` : null;

    // Create expense
    const expense = await Expense.create({
      description,
      project_id,
      user_id: req.user.id,
      amount,
      status: 'Pending',
      is_billable: is_billable || false,
      expense_date: expense_date || new Date(),
      receipt_url,
      category
    });

    // Notify project manager if expense is linked to a project
    if (project_id) {
      const project = await Project.findByPk(project_id);
      if (project) {
        await notifyExpensePendingApproval(
          project.project_manager_id,
          req.user.name,
          description,
          amount,
          project.name
        );
      }
    }

    // Fetch complete expense
    const completeExpense = await Expense.findByPk(expense.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Expense submitted successfully',
      expense: completeExpense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating expense'
    });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private (Owner, Admin, or PM can approve)
router.put('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id, {
      include: [{
        model: Project,
        as: 'project'
      }]
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const { description, amount, is_billable, expense_date, category, status } = req.body;

    // Check permissions for status change (approval/rejection)
    if (status && status !== expense.status) {
      if (status === 'Approved' || status === 'Rejected' || status === 'Reimbursed') {
        // Only Admin or Project Manager can approve/reject
        const canApprove = req.user.role === 'Admin' || 
                          (expense.project && expense.project.project_manager_id === req.user.id);
        
        if (!canApprove) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to approve/reject expenses'
          });
        }

        expense.status = status;

        // Send notification
        if (status === 'Approved') {
          await notifyExpenseApproved(expense.user_id, expense.description, expense.amount);
        } else if (status === 'Rejected') {
          await notifyExpenseRejected(expense.user_id, expense.description, expense.amount);
        }
      }
    }

    // Only owner can edit expense details (and only if pending)
    if (expense.user_id === req.user.id && expense.status === 'Pending') {
      if (description) expense.description = description;
      if (amount) expense.amount = amount;
      if (is_billable !== undefined) expense.is_billable = is_billable;
      if (expense_date) expense.expense_date = expense_date;
      if (category !== undefined) expense.category = category;
    } else if (expense.user_id !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this expense'
      });
    }

    await expense.save();

    // Fetch updated expense
    const updatedExpense = await Expense.findByPk(expense.id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      expense: updatedExpense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating expense'
    });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private (Owner or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Check permissions
    if (expense.user_id !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this expense'
      });
    }

    await expense.destroy();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting expense'
    });
  }
});

// @route   GET /api/expenses/pending/approvals
// @desc    Get pending expenses for approval (for PMs and Admins)
// @access  Private (Admin, PM)
router.get('/pending/approvals', protect, authorize('Admin', 'Project Manager'), async (req, res) => {
  try {
    let where = { status: 'Pending' };

    // If PM, show only expenses from their projects
    if (req.user.role === 'Project Manager') {
      const projects = await Project.findAll({
        where: { project_manager_id: req.user.id },
        attributes: ['id']
      });
      const projectIds = projects.map(p => p.id);
      where.project_id = { [Op.in]: projectIds };
    }

    const expenses = await Expense.findAll({
      where,
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses
    });
  } catch (error) {
    console.error('Get pending expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pending expenses'
    });
  }
});

module.exports = router;

