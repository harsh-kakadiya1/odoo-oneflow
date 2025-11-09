const express = require('express');
const router = express.Router();
const { Project, User, Task, ProjectMember } = require('../models');
const { protect, authorize, isProjectManager, isProjectMember } = require('../middleware/auth');
const { getProjectFinancials } = require('../utils/financialCalculations');
const { notifyProjectAssigned } = require('../services/notificationService');
const { Op } = require('sequelize');

// @route   GET /api/projects
// @desc    Get projects from same company (filtered by role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, search } = req.query;
    
    // Get current user's company_id for multi-tenancy
    const currentUser = await User.findByPk(req.user.id);
    
    console.log(`Projects request from user: ${currentUser.name} (${currentUser.role}) from company: ${currentUser.company_id}`);
    
    // Build where clause - handle NULL company_id
    let where = currentUser.company_id 
      ? { company_id: currentUser.company_id }
      : {}; // Show all if no company_id

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filter based on role
    if (req.user.role === 'Team Member') {
      // Team members see only projects they're assigned to
      const projects = await Project.findAll({
        where,
        include: [
          {
            model: User,
            as: 'projectManager',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'members',
            attributes: ['id', 'name', 'email', 'role'],
            through: { attributes: [] },
            where: { id: req.user.id }
          },
          {
            model: Task,
            as: 'tasks',
            attributes: ['id', 'status'],
            required: false
          }
        ],
        order: [['created_at', 'DESC']]
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

      return res.status(200).json({
        success: true,
        count: projectsWithFinancials.length,
        projects: projectsWithFinancials
      });
    } else if (req.user.role === 'Project Manager') {
      // Project Managers see projects they manage or are members of
      const managedProjects = await Project.findAll({
        where: {
          ...where,
          project_manager_id: req.user.id
        },
        include: [
          {
            model: User,
            as: 'projectManager',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'members',
            attributes: ['id', 'name', 'email', 'role'],
            through: { attributes: [] }
          },
          {
            model: Task,
            as: 'tasks',
            attributes: ['id', 'status'],
            required: false
          }
        ],
        order: [['created_at', 'DESC']]
      });

      const memberProjects = await Project.findAll({
        where: {
          ...where,
          project_manager_id: { [Op.ne]: req.user.id }
        },
        include: [
          {
            model: User,
            as: 'projectManager',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'members',
            attributes: ['id', 'name', 'email', 'role'],
            through: { attributes: [] },
            where: { id: req.user.id }
          },
          {
            model: Task,
            as: 'tasks',
            attributes: ['id', 'status'],
            required: false
          }
        ],
        order: [['created_at', 'DESC']]
      });

      const allProjects = [...managedProjects, ...memberProjects];

      const projectsWithFinancials = await Promise.all(
        allProjects.map(async (project) => {
          const financials = await getProjectFinancials(project.id);
          return {
            ...project.toJSON(),
            financials
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: projectsWithFinancials.length,
        projects: projectsWithFinancials
      });
    } else {
      // Admin and Sales/Finance see all projects
      const projects = await Project.findAll({
        where,
        include: [
          {
            model: User,
            as: 'projectManager',
            attributes: ['id', 'name', 'email']
          },
          {
            model: User,
            as: 'members',
            attributes: ['id', 'name', 'email', 'role'],
            through: { attributes: [] }
          },
          {
            model: Task,
            as: 'tasks',
            attributes: ['id', 'status'],
            required: false
          }
        ],
        order: [['created_at', 'DESC']]
      });

      const projectsWithFinancials = await Promise.all(
        projects.map(async (project) => {
          const financials = await getProjectFinancials(project.id);
          return {
            ...project.toJSON(),
            financials
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: projectsWithFinancials.length,
        projects: projectsWithFinancials
      });
    }
  } catch (error) {
    console.error('Get projects error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      sql: error.sql
    });
    res.status(500).json({
      success: false,
      message: 'Server error fetching projects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project with full details
// @access  Private (Project member/manager)
router.get('/:id', protect, isProjectMember, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'projectManager',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email', 'role'],
          through: { attributes: [] }
        },
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'title', 'status', 'priority', 'due_date', 'assignee_id'],
          include: [
            {
              model: User,
              as: 'assignee',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get financials
    const financials = await getProjectFinancials(project.id);

    res.status(200).json({
      success: true,
      project: {
        ...project.toJSON(),
        financials
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching project'
    });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Admin, Project Manager)
router.post('/', protect, authorize('Admin', 'Project Manager'), async (req, res) => {
  try {
    const { name, description, start_date, end_date, status, project_manager_id, member_ids, budget } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    // Determine project manager
    let pmId = project_manager_id;
    if (!pmId) {
      if (req.user.role === 'Project Manager') {
        pmId = req.user.id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Project manager is required'
        });
      }
    }

    // Verify PM exists and has correct role
    const pm = await User.findByPk(pmId);
    if (!pm || (pm.role !== 'Project Manager' && pm.role !== 'Admin')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project manager'
      });
    }

    // Get current user's company for multi-tenancy
    const currentUser = await User.findByPk(req.user.id);

    // Validate and format dates
    let validStartDate = null;
    let validEndDate = null;

    if (start_date && start_date !== 'Invalid date') {
      const parsedStart = new Date(start_date);
      if (!isNaN(parsedStart.getTime())) {
        validStartDate = parsedStart;
      }
    }

    if (end_date && end_date !== 'Invalid date') {
      const parsedEnd = new Date(end_date);
      if (!isNaN(parsedEnd.getTime())) {
        validEndDate = parsedEnd;
      }
    }

    // Sanitize budget - convert empty string/null/undefined to 0
    let sanitizedBudget = 0;
    if (budget !== '' && budget !== null && budget !== undefined) {
      const parsedBudget = parseFloat(budget);
      if (!isNaN(parsedBudget) && parsedBudget >= 0) {
        sanitizedBudget = parsedBudget;
      }
    }

    // Create project associated with user's company
    const project = await Project.create({
      name,
      description,
      start_date: validStartDate,
      end_date: validEndDate,
      status: status || 'Planned',
      project_manager_id: pmId,
      company_id: currentUser.company_id, // Associate with company
      budget: sanitizedBudget
    });

    // Add project members
    if (member_ids && member_ids.length > 0) {
      const memberData = member_ids.map(userId => ({
        project_id: project.id,
        user_id: userId
      }));
      await ProjectMember.bulkCreate(memberData);

      // Notify members
      for (const userId of member_ids) {
        const user = await User.findByPk(userId);
        if (user) {
          await notifyProjectAssigned(userId, project.name, user.role);
        }
      }
    }

    // Fetch complete project
    const completeProject = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'projectManager',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email', 'role'],
          through: { attributes: [] }
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: completeProject
    });
    // Emit real-time event for new project
    try {
      if (global.io) {
        global.io.emit('project:created', completeProject);
      }
    } catch (err) {
      console.error('Failed to emit project created event:', err);
    }
  } catch (error) {
    console.error('Create project error:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      sql: error.sql
    });
    res.status(500).json({
      success: false,
      message: 'Server error creating project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin, Project Manager of project)
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

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
        message: 'Not authorized to update this project'
      });
    }

    const { name, description, start_date, end_date, status, member_ids, budget } = req.body;

    // Update fields
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    
    // Validate and update dates
    if (start_date !== undefined) {
      if (start_date === null || start_date === '') {
        project.start_date = null;
      } else if (start_date !== 'Invalid date') {
        const parsedStart = new Date(start_date);
        if (!isNaN(parsedStart.getTime())) {
          project.start_date = parsedStart;
        }
      }
    }
    
    if (end_date !== undefined) {
      if (end_date === null || end_date === '') {
        project.end_date = null;
      } else if (end_date !== 'Invalid date') {
        const parsedEnd = new Date(end_date);
        if (!isNaN(parsedEnd.getTime())) {
          project.end_date = parsedEnd;
        }
      }
    }
    
    if (status) project.status = status;
    
    // Sanitize budget before updating
    if (budget !== undefined) {
      if (budget === '' || budget === null) {
        project.budget = 0;
      } else {
        const parsedBudget = parseFloat(budget);
        project.budget = !isNaN(parsedBudget) && parsedBudget >= 0 ? parsedBudget : 0;
      }
    }

    await project.save();

    // Update members if provided
    if (member_ids) {
      // Remove existing members
      await ProjectMember.destroy({ where: { project_id: project.id } });
      
      // Add new members
      if (member_ids.length > 0) {
        const memberData = member_ids.map(userId => ({
          project_id: project.id,
          user_id: userId
        }));
        await ProjectMember.bulkCreate(memberData);

        // Notify new members
        for (const userId of member_ids) {
          const user = await User.findByPk(userId);
          if (user) {
            await notifyProjectAssigned(userId, project.name, user.role);
          }
        }
      }
    }

    // Fetch updated project
    const updatedProject = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'projectManager',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email', 'role'],
          through: { attributes: [] }
        }
      ]
    });

    const financials = await getProjectFinancials(project.id);

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: {
        ...updatedProject.toJSON(),
        financials
      }
    });
    // Emit real-time event for updated project
    try {
      if (global.io) {
        global.io.emit('project:updated', { project: updatedProject, financials });
      }
    } catch (err) {
      console.error('Failed to emit project updated event:', err);
    }
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating project'
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin, Project Manager of project)
router.delete('/:id', protect, isProjectManager, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    await project.destroy();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
    // Emit real-time deletion event
    try {
      if (global.io) {
        global.io.emit('project:deleted', { id: project.id });
      }
    } catch (err) {
      console.error('Failed to emit project deleted event:', err);
    }
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting project'
    });
  }
});

// @route   GET /api/projects/:id/tasks
// @desc    Get tasks for a specific project
// @access  Private
router.get('/:id/tasks', protect, async (req, res) => {
  try {
    const { assigneeId, status, priority } = req.query;
    let where = { project_id: req.params.id };

    if (assigneeId) {
      where.assignee_id = assigneeId;
    }
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('Get project tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching project tasks'
    });
  }
});

// @route   GET /api/projects/:id/links
// @desc    Get linked financial documents for a project
// @access  Private
router.get('/:id/links', protect, async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Import models
    const { SalesOrder, PurchaseOrder, CustomerInvoice, VendorBill, Expense } = require('../models');
    
    // Fetch all linked documents in parallel
    const [salesOrders, purchaseOrders, customerInvoices, vendorBills, expenses] = await Promise.all([
      SalesOrder.findAll({
        where: { project_id: projectId },
        attributes: ['id', 'order_number', 'customer_name', 'customer_email', 'amount', 'status', 'order_date'],
        order: [['created_at', 'DESC']]
      }),
      PurchaseOrder.findAll({
        where: { project_id: projectId },
        attributes: ['id', 'order_number', 'vendor_name', 'vendor_email', 'amount', 'status', 'order_date'],
        order: [['created_at', 'DESC']]
      }),
      CustomerInvoice.findAll({
        where: { project_id: projectId },
        attributes: ['id', 'invoice_number', 'customer_name', 'amount', 'status', 'invoice_date', 'due_date'],
        order: [['created_at', 'DESC']]
      }),
      VendorBill.findAll({
        where: { project_id: projectId },
        attributes: ['id', 'bill_number', 'vendor_name', 'amount', 'status', 'bill_date', 'due_date'],
        order: [['created_at', 'DESC']]
      }),
      Expense.findAll({
        where: { project_id: projectId },
        attributes: ['id', 'description', 'amount', 'status', 'expense_date', 'category'],
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }],
        order: [['created_at', 'DESC']]
      })
    ]);

    const links = {
      salesOrders: salesOrders.map(so => ({
        id: so.id,
        number: so.order_number,
        partner_name: so.customer_name,
        customer_name: so.customer_name,
        customer_email: so.customer_email,
        total_amount: so.amount,
        amount: so.amount,
        status: so.status,
        date: so.order_date
      })),
      purchaseOrders: purchaseOrders.map(po => ({
        id: po.id,
        number: po.order_number,
        vendor_name: po.vendor_name,
        vendor_email: po.vendor_email,
        total_amount: po.amount,
        amount: po.amount,
        status: po.status,
        date: po.order_date
      })),
      customerInvoices: customerInvoices.map(inv => ({
        id: inv.id,
        number: inv.invoice_number,
        customer_name: inv.customer_name,
        partner_name: inv.customer_name,
        total_amount: inv.amount,
        amount: inv.amount,
        status: inv.status,
        date: inv.invoice_date,
        due_date: inv.due_date
      })),
      vendorBills: vendorBills.map(bill => ({
        id: bill.id,
        number: bill.bill_number,
        vendor_name: bill.vendor_name,
        partner_name: bill.vendor_name,
        total_amount: bill.amount,
        amount: bill.amount,
        status: bill.status,
        date: bill.bill_date,
        due_date: bill.due_date
      })),
      expenses: expenses.map(exp => ({
        id: exp.id,
        reference: `EXP-${exp.id}`,
        description: exp.description,
        amount: exp.amount,
        status: exp.status,
        date: exp.expense_date,
        category: exp.category,
        user_name: exp.user ? `${exp.user.firstName} ${exp.user.lastName}` : 'Unknown'
      }))
    };

    res.status(200).json({
      success: true,
      data: links
    });
  } catch (error) {
    console.error('Get project links error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching project links'
    });
  }
});

module.exports = router;

