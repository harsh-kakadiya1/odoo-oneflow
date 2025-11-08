const express = require('express');
const router = express.Router();
const { User, Company } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { generatePassword } = require('../utils/generatePassword');
const { sendWelcomeEmail } = require('../services/emailService');

// @route   GET /api/users
// @desc    Get users from same company (Admin sees all company users, PM sees only users they created)
// @access  Private (Admin, Project Manager, Sales/Finance)
router.get('/', protect, authorize('Admin', 'Project Manager', 'Sales/Finance'), async (req, res) => {
  try {
    const { role, search } = req.query;
    const { Op } = require('sequelize');
    
    // Get current user's company_id
    const currentUser = await User.findByPk(req.user.id);
    
    console.log(`Users request from user: ${currentUser.name} (${currentUser.role}) from company: ${currentUser.company_id}`);
    
    let where = { 
      is_active: true,
      company_id: currentUser.company_id // Only show users from same company
    };

    // For project creation, all users should be visible to Admins and Project Managers
    // Only restrict for Team Members
    if (req.user.role === 'Team Member') {
      // Team members can only see themselves and their project team members
      where.id = req.user.id;
    }

    if (role) {
      where.role = role;
    }

    if (search) {
      // Build search condition for name and email
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash', 'reset_password_token', 'reset_password_expire'] },
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'country', 'currency']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash', 'reset_password_token', 'reset_password_expire'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
});

// @route   POST /api/users
// @desc    Create new user (Admin creates any role, PM creates Team Members only)
// @access  Private (Admin, Project Manager)
router.post('/', protect, authorize('Admin', 'Project Manager'), async (req, res) => {
  try {
    const { firstName, lastName, email, role, hourly_rate } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide first name, last name, email, and role'
      });
    }

    // Project Managers can only create Team Members
    if (req.user.role === 'Project Manager' && role !== 'Team Member') {
      return res.status(403).json({
        success: false,
        message: 'Project Managers can only create Team Member accounts'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate temporary password
    const temporaryPassword = generatePassword();

    // Get current user's company_id to associate new user with same company
    const currentUser = await User.findByPk(req.user.id);
    
    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password_hash: temporaryPassword,
      role,
      company_id: currentUser.company_id,
      created_by: req.user.id, // Track who created this user
      hourly_rate: hourly_rate || 0,
      is_active: true
    });

    // Send welcome email with credentials
    const emailResult = await sendWelcomeEmail(user, temporaryPassword);

    if (!emailResult.success) {
      console.error('Failed to send welcome email:', emailResult.error);
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully. Credentials sent via email.',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        hourly_rate: user.hourly_rate
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin or Self)
router.put('/:id', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    if (req.user.role !== 'Admin' && req.user.id !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    const { firstName, lastName, email, role, hourly_rate } = req.body;

    // Only admin can change role and hourly_rate
    if ((role || hourly_rate !== undefined) && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin can change role or hourly rate'
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (role && req.user.role === 'Admin') user.role = role;
    if (hourly_rate !== undefined && req.user.role === 'Admin') user.hourly_rate = hourly_rate;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        hourly_rate: user.hourly_rate
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Deactivate user (soft delete)
// @access  Private (Admin)
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting yourself
    if (req.user.id === user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Soft delete
    user.is_active = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deactivating user'
    });
  }
});

module.exports = router;

